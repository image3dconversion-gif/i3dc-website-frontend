/**
 * Zoho CRM field mapping + journey routing for I3DC website enquiries.
 *
 * BOUNDARY: this is a GENERIC-INQUIRY funnel, not a case/service-order funnel.
 * The website never collects or handles case files, DICOM/STL/CBCT, quotations,
 * treatment/surgery plans, guide design, implant-system details, production, or
 * case status — those live only in the I3DC Case Portal. The CRM's job is to
 * educate, classify, nurture, and route (to the Portal or to partner review).
 *
 * Records target the existing `I3DC Website` Leads layout (id 6607227000004071789);
 * the layout is attached at the submission layer from ZOHO_LAYOUT_ID (no hardcoded id).
 * Mapping is data-only so it can be reviewed before live submission is enabled.
 */
import {
  BUSINESS_TAG,
  DEFAULT_JOURNEY_STAGE,
  INQUIRY_LABELS,
  INQUIRY_ZOHO_VALUES,
  JOURNEY_ENGINE_VERSION,
  LEAD_SOURCE,
  PORTAL_GUIDANCE_STAGE,
  PORTAL_ROUTED_CATEGORY,
  V2_NEW_ENQUIRY_STAGE,
  type InquiryType,
  type NormalisedEnquiry,
} from "../enquiry/types";
import { mentionsPortalTopic } from "../enquiry/validate";
import { toZohoDateTime } from "../enquiry/normalise";

/**
 * How each inquiry type is routed.
 *  - portal: true       → guide the user into the Case Portal (portal-owned topics)
 *  - partnerReview: true → collaboration / lab / vendor / partner pipeline
 */
export const PIPELINE_ROUTING: Record<
  InquiryType,
  { portal: boolean; partnerReview: boolean; label: string }
> = {
  general: { portal: false, partnerReview: false, label: "General enquiry" },
  "service-information": { portal: false, partnerReview: false, label: "Service information (category-level)" },
  collaboration: { portal: false, partnerReview: true, label: "Collaboration review" },
  "lab-vendor": { portal: false, partnerReview: true, label: "Lab / Vendor review" },
  "portal-help": { portal: true, partnerReview: false, label: "Portal guidance" },
  "existing-customer-support": { portal: true, partnerReview: false, label: "Existing customer → Portal" },
};

/**
 * True when the enquiry should be routed toward Case Portal guidance:
 * an existing customer, an explicit portal/existing-customer inquiry type, or a
 * message mentioning a Portal-owned case/commercial topic.
 */
export function needsPortalGuidance(e: NormalisedEnquiry): boolean {
  return (
    e.existingCustomer === true ||
    PIPELINE_ROUTING[e.inquiryType].portal ||
    mentionsPortalTopic(e.message)
  );
}

/**
 * A Zoho Leads record for the `I3DC Website` layout. Standard fields
 * (First/Last_Name, Email, Mobile, Clinic_Practice_Name, Lead_Source, Description)
 * are live today. `Business_Unit`, `Inquiry_Type`, `Existing_Customer`,
 * `Page_Submitted_From`, `Consent` were created on the layout. `Journey_Stage` and
 * `Inquiry_Category` are journey fields PENDING admin creation/approval in Zoho —
 * included here so the mapping is ready; harmless while dry-run.
 * `Clinic_Practice_Name` is used for organisation (NOT `Company`, inactive here).
 */
export interface ZohoLeadRecord {
  Last_Name: string;
  First_Name?: string;
  Email: string;
  Mobile?: string;
  Clinic_Practice_Name?: string;
  Lead_Source: string;
  Description: string;
  /** Native Leads kanban/stage field. Set so website leads don't land in the
   *  "Unknown" column; uses the existing shared value "Not Contacted". */
  Lead_Status?: string;
  Business_Unit?: string;
  Inquiry_Type?: string;
  Journey_Stage?: string;
  Inquiry_Category?: string;
  Existing_Customer?: boolean;
  Page_Submitted_From?: string;
  Consent?: boolean;
  UTM_Source?: string;
  UTM_Medium?: string;
  UTM_Campaign?: string;
  UTM_Content?: string;
  UTM_Term?: string;
  /** Google Ads click id. */
  Ad_GCLID?: string;

  // ── CRM V2 control fields ───────────────────────────────────────────────
  /** Marks the lead as owned by the V2 journey engine from the moment of creation. */
  Journey_Engine_Version?: string;
  V2_Journey_Stage?: string;
  /** Explicitly false so the live acknowledgement rule does not treat it as a test. */
  Automation_Test?: boolean;

  // ── Purpose-separated permissions (each independent) ────────────────────
  Consent_WA_Operational?: boolean;
  Consent_Email_Marketing?: boolean;
  Consent_WA_Marketing?: boolean;
  Consent_Captured_At?: string;
  /** Controlled source value on its own, e.g. `i3dc-website-form`. */
  Consent_Source?: string;
  /** The wording version the permission was captured under. */
  Consent_Wording_Version?: string;

  // ── Duplicate-matching keys (read by "V2 SYS - Duplicate Classification") ─
  V2_Email_Normalized?: string;
  V2_Phone_Normalized?: string;

  // ── Derived intent (never city/venue — those belong to the education BU) ─
  Service_Interest?: string;
  Workflow_Interest?: string;

  /** Attached from ZOHO_LAYOUT_ID at submission time; omitted when unset. */
  Layout?: { id: string };
}

/** Zoho text-field limits for the fields written above. */
const LIMITS = {
  text255: 255,
  text120: 120,
  normalisedEmail: 100,
  normalisedPhone: 30,
} as const;

/** Trim to a Zoho field limit; over-long values are rejected by the API, not truncated. */
function fit(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  return value.slice(0, max);
}

/**
 * Derive service / workflow intent from the page the enquiry came from.
 *
 * Values are exact `Service_Interest` / `Workflow_Interest` picklist entries.
 * Only unambiguous pages are mapped; anything else is left unset rather than
 * guessed, because a wrong intent is worse for routing than an absent one.
 *
 * Deliberately contains NO city, venue or location value. Location fields on the
 * Leads module (`Location`, `Workshop_City`, `Workshop_Location`) belong to the
 * education business unit and must never be written by the I3DC website.
 */
function derivedIntent(pageSource: string | undefined): {
  service?: string;
  workflow?: string;
} {
  const path = (pageSource ?? "").toLowerCase();
  if (path.includes("full-arch-stackable")) {
    return { service: "Full-Arch/Stackable Guide", workflow: "Full-Arch" };
  }
  if (path.includes("zygoma-pterygoid")) {
    return { service: "Guided Implant Planning", workflow: "Zygoma / Pterygoid" };
  }
  if (path.includes("immediate-loading")) {
    return { service: "Guided Implant Planning", workflow: "Immediate Loading" };
  }
  if (path.includes("design-only")) {
    return { service: "Digital Design Service", workflow: "Guide Design" };
  }
  if (path.includes("design-to-delivery")) {
    return { service: "3D Printing / Production" };
  }
  if (path.includes("guided-implant-workflow")) {
    return { service: "Guided Implant Planning" };
  }
  return {};
}

function splitName(full: string): { first?: string; last: string } {
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { last: full || "Enquiry" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

const yesNo = (v: boolean): string => (v ? "Yes" : "No");

/** Non-clinical context appended to Description. No case/service fields. */
function buildDescription(e: NormalisedEnquiry, portalRouted: boolean): string {
  const lines = [
    `Enquiry type: ${INQUIRY_LABELS[e.inquiryType]}`,
    // Fallback: preserve organisation in Description in case Clinic_Practice_Name
    // is not on the target layout (Zoho silently drops off-layout fields).
    e.organization && `Clinic / organisation: ${e.organization}`,
    `Existing customer: ${e.existingCustomer ? "Yes" : "No"}`,
    e.pageSource && `Submitted from: ${e.pageSource}`,
    "",
    "Permissions (each ticked separately; unticked = refused):",
    `  Processing this enquiry: ${yesNo(e.consentSelections.processing)}`,
    `  Operational WhatsApp:    ${yesNo(e.consentSelections.operationalWhatsApp)}`,
    `  Email marketing:         ${yesNo(e.consentSelections.emailMarketing)}`,
    `  WhatsApp marketing:      ${yesNo(e.consentSelections.whatsAppMarketing)}`,
    `  Captured at: ${e.consentCapturedAtIso} · Source: ${e.consentSource} · Wording: ${e.consentWordingVersion}`,
    "",
    "Attribution:",
    `  Source website: ${e.attribution.sourceWebsite}`,
    e.attribution.referrer && `  Referrer: ${e.attribution.referrer}`,
    e.attribution.firstTouchIso && `  First touch: ${e.attribution.firstTouchIso}`,
    e.attribution.lastTouchIso && `  Last touch: ${e.attribution.lastTouchIso}`,
    e.attribution.gclid && `  GCLID: ${e.attribution.gclid}`,
    // Referrer and touch timestamps have no dedicated Leads fields yet, so this
    // block is the only place they survive. Keep it until fields exist.
    `  Phone interpreted as: ${e.phoneBasis}`,
    e.spamIndicators.length > 0 &&
      `  ⚠ Review signals (advisory, did NOT block): ${e.spamIndicators.join(", ")}`,
    portalRouted &&
      "⚠ Mentions a Case Portal topic (case/file/price/plan/status). Route to the I3DC Case Portal — do not handle here.",
    "",
    "Summary:",
    e.message,
  ].filter(Boolean);
  return lines.join("\n");
}

/** Classify a lead for reporting (Inquiry_Category picklist — pending in Zoho). */
function inquiryCategory(e: NormalisedEnquiry, portalRouted: boolean): string {
  if (portalRouted) return PORTAL_ROUTED_CATEGORY;
  if (PIPELINE_ROUTING[e.inquiryType].partnerReview) return "Collaboration";
  if (e.inquiryType === "service-information") return "Service-Info";
  return "Generic";
}

export function toZohoLead(e: NormalisedEnquiry): ZohoLeadRecord {
  const { first, last } = splitName(e.name);
  const portalRouted = needsPortalGuidance(e);
  const intent = derivedIntent(e.pageSource);
  return {
    Last_Name: last,
    First_Name: first,
    Email: e.email,
    Mobile: e.phone,
    // Organisation → Clinic_Practice_Name (Company is inactive on this layout).
    Clinic_Practice_Name: e.organization,
    Lead_Source: e.leadSource,
    Description: buildDescription(e, portalRouted),
    // Native kanban stage — keep website leads out of the "Unknown" column.
    Lead_Status: "Not Contacted",
    Business_Unit: e.businessTag,
    // Picklist-safe value; the exact website intent is preserved in Description.
    Inquiry_Type: INQUIRY_ZOHO_VALUES[e.inquiryType],
    Journey_Stage: portalRouted ? PORTAL_GUIDANCE_STAGE : DEFAULT_JOURNEY_STAGE,
    Inquiry_Category: inquiryCategory(e, portalRouted),
    Existing_Customer: e.existingCustomer,
    Page_Submitted_From: fit(e.pageSource, LIMITS.text255),

    // COMPATIBILITY ONLY: legacy bundled consent = permission to process this
    // enquiry. It is NOT a marketing permission and nothing downstream should
    // read it as one — the three fields below are the permission signals.
    Consent: e.consent,

    Consent_WA_Operational: e.consentSelections.operationalWhatsApp,
    Consent_Email_Marketing: e.consentSelections.emailMarketing,
    Consent_WA_Marketing: e.consentSelections.whatsAppMarketing,
    Consent_Captured_At: toZohoDateTime(e.consentCapturedAtIso) || undefined,
    Consent_Source: fit(e.consentSource, LIMITS.text255),
    Consent_Wording_Version: fit(e.consentWordingVersion, LIMITS.text120),

    V2_Email_Normalized: fit(e.normalisedEmail, LIMITS.normalisedEmail),
    V2_Phone_Normalized: fit(e.normalisedPhone, LIMITS.normalisedPhone),

    Journey_Engine_Version: JOURNEY_ENGINE_VERSION,
    V2_Journey_Stage: V2_NEW_ENQUIRY_STAGE,
    Automation_Test: false,

    Service_Interest: intent.service,
    Workflow_Interest: intent.workflow,

    UTM_Source: fit(e.utm?.source, LIMITS.text255),
    UTM_Medium: fit(e.utm?.medium, LIMITS.text255),
    UTM_Campaign: fit(e.utm?.campaign, LIMITS.text255),
    UTM_Content: fit(e.utm?.content, LIMITS.text255),
    UTM_Term: fit(e.utm?.term, LIMITS.text255),
    Ad_GCLID: fit(e.attribution.gclid, LIMITS.text255),
  };
}

/*
 * Deliberately NOT written by the website, and why:
 *   Duplicate_Status      — owned by "V2 SYS - Duplicate Classification", which
 *                           runs five minutes after create to dodge the search
 *                           index race. Writing it here would fight that rule.
 *   Automation_Exception  — "V2 COM - Enquiry Acknowledgement" withholds the
 *                           operational acknowledgement when an exception is
 *                           set, so a false-positive spam signal would silently
 *                           deny a real enquirer their acknowledgement.
 *   Acquisition_Channel   — existing "AC – …" rules classify it on create from
 *                           the raw UTM/source data this mapping supplies.
 *   Program_Type,
 *   Location, Workshop_*  — education business unit. Purpose separation.
 */
