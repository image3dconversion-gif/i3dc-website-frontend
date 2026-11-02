/**
 * Server half of the Meta Lead lifecycle. SERVER-ONLY.
 *
 *   1. /api/enquiry validates the enquiry and mints its website_ref.
 *   2. The CRM (Zoho) write runs — for EVERY valid enquiry, eligible or not.
 *   3. isAcceptedCreate() decides whether the CRM accepted it. Zoho's synchronous
 *      create response is the acceptance authority for I3DC.
 *   4. decideMetaLead() applies scope, consent, synthetic and spam rules.
 *   5. Only then is the event id derived and the CAPI Lead scheduled.
 *
 * The browser plays no part: it never receives an event id and never sends a
 * Lead. A page view, form view, CTA click or website_ref is never a Lead.
 */
import "server-only";
import { SOURCE_WEBSITE, type NormalisedEnquiry } from "../enquiry/types";
import { PIPELINE_ROUTING } from "../zoho/mapping";
import type { SubmitResult } from "../zoho/client";
import type { LeadFacts } from "./capi";
import { readCookie, resolveFbc, validFbp } from "./cookies";

/**
 * Why a submission is, or is not, in Lead scope. Exclusions still complete
 * normally in the CRM — they only produce no Meta Lead event.
 */
export type LeadScope =
  | "eligible"
  /** The invitation form, reported from or sent by a page other than /case-portal/. */
  | "portal-interest-off-page"
  /** The standard enquiry form, submitted from the /case-portal/ page. */
  | "case-portal-page"
  /** Existing_Customer=true, or the "Existing Customer Support" enquiry type. */
  | "existing-customer"
  /** Partnership card, or a Collaboration / Lab-Vendor enquiry (CRM: Inquiry_Category=Collaboration). */
  | "partnership-collaboration"
  /** "Portal Help" — portal guidance, routed to the Case Portal, not a service enquiry. */
  | "portal-support";

const CASE_PORTAL_PATH = /^\/case-portal(?:\/|$)/i;

/** True for /case-portal and anything beneath it, ignoring query, hash and case. */
export function isCasePortalPath(pathOrUrl: string | undefined): boolean {
  if (!pathOrUrl) return false;
  try {
    return CASE_PORTAL_PATH.test(new URL(pathOrUrl, "https://path.invalid").pathname);
  } catch {
    return false;
  }
}

/**
 * Meta Lead scope.
 *
 * Standard enquiries: new-business I3DC service acquisition only (controller
 * amendment, 2026-09-11). General Enquiry and Service Information qualify; pricing
 * or quote wording from a new prospect also qualifies, as commercial intent.
 *
 * Case Portal invitation requests: eligible when the invitation form itself was
 * submitted from /case-portal/ (controller decision, 2026-11-02, superseding the
 * 11 Sep exclusion). Both the form's reported path and the page that actually
 * sent the request must agree.
 */
export function metaLeadScope(enquiry: NormalisedEnquiry, sourceUrl: string): LeadScope {
  if (enquiry.formType === "portal-interest") {
    return isCasePortalPath(enquiry.pageSource) && isCasePortalPath(sourceUrl)
      ? "eligible"
      : "portal-interest-off-page";
  }
  if (isCasePortalPath(enquiry.pageSource) || isCasePortalPath(sourceUrl)) return "case-portal-page";
  if (enquiry.existingCustomer === true || enquiry.inquiryType === "existing-customer-support") {
    return "existing-customer";
  }
  const routing = PIPELINE_ROUTING[enquiry.inquiryType];
  if (enquiry.serviceKey === "partnership" || routing.partnerReview) return "partnership-collaboration";
  if (routing.portal) return "portal-support";
  return "eligible";
}

/**
 * The I3DC acceptance event: a live create that Zoho answered with HTTP OK and
 * code SUCCESS (both required by submitLead for `ok`) and a non-empty Lead ID.
 * A dry-run "success" never qualifies: no real lead exists behind it.
 */
export function isAcceptedCreate(submit: SubmitResult): boolean {
  return (
    submit.ok === true &&
    submit.mode === "live" &&
    typeof submit.id === "string" &&
    submit.id.trim() !== ""
  );
}

export type MetaLeadDecision =
  | { eligible: true }
  | {
      eligible: false;
      reason:
        | "not-accepted"
        | Exclude<LeadScope, "eligible">
        | "consent-undecided"
        | "consent-deny"
        | "consent-unknown"
        | "synthetic"
        | "spam-suspected";
    };

/**
 * Every condition for a Meta Lead, in one place. Synthetic submissions may only
 * ever go as Test Events, which lib/meta/config refuses in Production.
 */
export function decideMetaLead(input: {
  enquiry: NormalisedEnquiry;
  sourceUrl: string;
  submit: SubmitResult;
  synthetic: boolean;
  testEvents: boolean;
}): MetaLeadDecision {
  const { enquiry, sourceUrl, submit, synthetic, testEvents } = input;
  if (!isAcceptedCreate(submit)) return { eligible: false, reason: "not-accepted" };
  const scope = metaLeadScope(enquiry, sourceUrl);
  if (scope !== "eligible") return { eligible: false, reason: scope };
  if (enquiry.measurementConsent === "UNDECIDED") return { eligible: false, reason: "consent-undecided" };
  if (enquiry.measurementConsent === "DENY") return { eligible: false, reason: "consent-deny" };
  if (enquiry.measurementConsent !== "ALLOW") return { eligible: false, reason: "consent-unknown" };
  if (synthetic && !testEvents) return { eligible: false, reason: "synthetic" };
  if (enquiry.spamIndicators.length > 0) return { eligible: false, reason: "spam-suspected" };
  return { eligible: true };
}

const MAX_USER_AGENT = 512;

/**
 * The page the enquiry was submitted from — origin and path only; query and
 * hash are dropped so no URL parameter is ever forwarded. The browser's own
 * same-origin Referer is preferred; the form's reported path is the fallback.
 */
export function eventSourceUrl(req: Request, pageSource: string | undefined): string {
  const host = req.headers.get("host");
  const referer = req.headers.get("referer");
  if (host && referer) {
    try {
      const url = new URL(referer);
      if ((url.protocol === "https:" || url.protocol === "http:") && url.host === host) {
        return `${url.origin}${url.pathname}`;
      }
    } catch {
      /* fall through to the reported path */
    }
  }
  const site = new URL(SOURCE_WEBSITE);
  if (pageSource && pageSource.startsWith("/") && !pageSource.startsWith("//")) {
    try {
      const url = new URL(pageSource, site);
      if (url.origin === site.origin) return `${url.origin}${url.pathname}`;
    } catch {
      /* fall through to the site root */
    }
  }
  return `${site.origin}/`;
}

function userAgent(req: Request): string | undefined {
  const ua = (req.headers.get("user-agent") ?? "").trim();
  return ua ? ua.slice(0, MAX_USER_AGENT) : undefined;
}

/**
 * Collect the facts for the CAPI Lead. `_fbp`/`_fbc` are read from the request
 * ONLY when the visitor's consent is ALLOW: a cookie left over from an earlier
 * ALLOW is ignored after DENY, and the fbclid-based `fbc` follows the same rule.
 */
export function leadFacts(input: {
  eventId: string;
  enquiry: NormalisedEnquiry;
  req: Request;
  now: Date;
  sourceUrl: string;
}): LeadFacts {
  const { eventId, enquiry, req, now, sourceUrl } = input;
  const allowed = enquiry.measurementConsent === "ALLOW";
  const cookies = allowed ? req.headers.get("cookie") : null;
  return {
    eventId,
    eventTimeSec: Math.floor(now.getTime() / 1000),
    eventSourceUrl: sourceUrl,
    fbp: allowed ? validFbp(readCookie(cookies, "_fbp")) : undefined,
    fbc: allowed
      ? resolveFbc(
          {
            cookie: readCookie(cookies, "_fbc"),
            fbclid: enquiry.attribution.fbclid,
            // The fbclid's FIRST-TOUCH timestamp: `lastTouchIso` is the start of the
            // acquisition touch that carried this very fbclid (lib/attribution keeps
            // the two together), i.e. when the click was first observed on landing.
            // Deliberately NOT `firstTouchIso` — that is the browser's first-ever
            // visit, which can predate the ad click by weeks and would back-date
            // the click outside Meta's attribution window.
            fbclidObservedAtIso: enquiry.attribution.lastTouchIso,
          },
          { nowMs: now.getTime() },
        )
      : undefined,
    userAgent: userAgent(req),
  };
}

/** Meta can only attribute a Lead through one of these; none are ever invented. */
export function hasMatchKeys(facts: LeadFacts): boolean {
  return Boolean(facts.fbp || facts.fbc);
}
