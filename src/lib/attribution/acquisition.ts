/**
 * Cross-page acquisition attribution.
 *
 * THE PROBLEM THIS SOLVES: the enquiry form used to read campaign values from
 * `window.location.search` of the page it happened to be rendered on. A paid
 * visitor almost never lands on the form page — they land on a service page and
 * navigate. Every UTM, and every click id, was therefore lost before the form
 * was ever seen. Only a direct landing on the form page preserved anything.
 *
 * The fix is to capture the acquisition touch at the ENTRY page and carry it
 * for the rest of the visit.
 *
 * SCOPE LIMIT: this module captures click ids as plain values for CRM
 * continuity. It is deliberately NOT a tracking layer — no Meta Pixel, no
 * `_fbp`/`_fbc`, no `event_id`, no browser Lead event, no network calls of any
 * kind. Those belong to the separate Meta/CAPI gate.
 *
 * The exported functions below are pure; only `captureAcquisition()` touches
 * the browser, so the resolution rules are unit-testable without a DOM.
 */
import type { Attribution, Utm } from "../enquiry/types";

/** Query parameters that mark a page view as a new acquisition touch. */
export const CAMPAIGN_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

const MAX_VALUE = 255;
const SESSION_KEY = "i3dc.acq.touch";
const FIRST_KEY = "i3dc.acq.first";

export interface AcquisitionTouch {
  utm?: Utm;
  gclid?: string;
  fbclid?: string;
  /** Entry URL for this touch — path plus campaign parameters only. */
  landingUrl?: string;
  /** External referrer for this touch. Own-host referrers are dropped. */
  referrer?: string;
  startedAtIso: string;
}

export interface FirstTouch {
  landingUrl?: string;
  atIso: string;
}

const trim = (v: string | null | undefined): string | undefined => {
  const s = (v ?? "").trim();
  return s ? s.slice(0, MAX_VALUE) : undefined;
};

/** True when this page view carries any campaign parameter. */
export function hasCampaignParams(search: string): boolean {
  const p = new URLSearchParams(search);
  return CAMPAIGN_PARAMS.some((k) => (p.get(k) ?? "").trim() !== "");
}

/**
 * A referrer counts only when it is genuinely external. After the first
 * navigation `document.referrer` is our own page, which would otherwise
 * overwrite the real acquisition source with an internal URL.
 */
export function externalReferrer(referrer: string, ownHost: string): string | undefined {
  const raw = (referrer ?? "").trim();
  if (!raw) return undefined;
  try {
    const host = new URL(raw).host;
    if (!host || host === ownHost) return undefined;
    return raw.slice(0, MAX_VALUE);
  } catch {
    return undefined;
  }
}

/**
 * Rebuild the entry URL keeping ONLY campaign parameters.
 *
 * Anything else a page happens to carry — a service selection, a search term,
 * anyone's stray identifier — is dropped, so an entry URL can never smuggle
 * personal data into the CRM.
 */
export function landingUrlFrom(href: string): string | undefined {
  try {
    const u = new URL(href);
    const keep = new URLSearchParams();
    for (const k of CAMPAIGN_PARAMS) {
      const v = (u.searchParams.get(k) ?? "").trim();
      if (v) keep.set(k, v);
    }
    const q = keep.toString();
    return `${u.origin}${u.pathname}${q ? `?${q}` : ""}`.slice(0, MAX_VALUE);
  } catch {
    return undefined;
  }
}

/**
 * Read an acquisition touch from a page view, or null when this view is just
 * ordinary in-site navigation.
 */
export function readTouch(
  href: string,
  referrer: string,
  ownHost: string,
  nowIso: string,
): AcquisitionTouch | null {
  let search = "";
  try {
    search = new URL(href).search;
  } catch {
    return null;
  }
  const ref = externalReferrer(referrer, ownHost);
  if (!hasCampaignParams(search) && !ref) return null;

  const p = new URLSearchParams(search);
  const utm: Utm = {
    source: trim(p.get("utm_source")),
    medium: trim(p.get("utm_medium")),
    campaign: trim(p.get("utm_campaign")),
    content: trim(p.get("utm_content")),
    term: trim(p.get("utm_term")),
  };
  return {
    utm: Object.values(utm).some(Boolean) ? utm : undefined,
    gclid: trim(p.get("gclid")),
    fbclid: trim(p.get("fbclid")),
    landingUrl: landingUrlFrom(href),
    referrer: ref,
    startedAtIso: nowIso,
  };
}

/**
 * Decide which touch applies to this page view.
 *
 * A page view carrying campaign parameters (or arriving from an external site)
 * REPLACES the stored touch outright rather than merging into it. Merging would
 * blend two different campaigns into one record that describes neither — a
 * clean last-non-direct touch is more honest than a composite.
 */
export function resolveTouch(
  stored: AcquisitionTouch | null,
  fresh: AcquisitionTouch | null,
): AcquisitionTouch | null {
  return fresh ?? stored;
}

/** Fold the resolved touch into the payload shape the enquiry API expects. */
export function toAttributionPayload(
  touch: AcquisitionTouch | null,
  first: FirstTouch | null,
): Partial<Attribution> & { utm?: Utm } {
  return {
    utm: touch?.utm,
    gclid: touch?.gclid,
    fbclid: touch?.fbclid,
    landingUrl: first?.landingUrl ?? touch?.landingUrl,
    referrer: touch?.referrer,
    firstTouchIso: first?.atIso,
    lastTouchIso: touch?.startedAtIso,
  };
}

/* ── browser layer ──────────────────────────────────────────────────────── */

function readJson<T>(store: Storage | undefined, key: string): T | null {
  try {
    const raw = store?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(store: Storage | undefined, key: string, value: unknown): void {
  try {
    store?.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode, blocked storage, quota — attribution degrades, form still works */
  }
}

/**
 * Capture (or continue) the acquisition touch for this page view and return the
 * attribution payload. Safe to call on every page; never throws.
 */
export function captureAcquisition(): Partial<Attribution> & { utm?: Utm } {
  if (typeof window === "undefined") return {};
  const nowIso = new Date().toISOString();

  const session = (() => {
    try { return window.sessionStorage; } catch { return undefined; }
  })();
  const local = (() => {
    try { return window.localStorage; } catch { return undefined; }
  })();

  const fresh = readTouch(window.location.href, document.referrer, window.location.host, nowIso);
  const stored = readJson<AcquisitionTouch>(session, SESSION_KEY);
  const touch = resolveTouch(stored, fresh);
  if (fresh) writeJson(session, SESSION_KEY, fresh);

  let first = readJson<FirstTouch>(local, FIRST_KEY);
  if (!first) {
    first = { landingUrl: landingUrlFrom(window.location.href), atIso: nowIso };
    writeJson(local, FIRST_KEY, first);
  }

  // A visit with no campaign params and no external referrer still records a
  // last-touch timestamp, so an organic enquiry is not attribution-blank.
  return toAttributionPayload(touch ?? { startedAtIso: nowIso }, first);
}
