/**
 * Measurement consent — the one gate between a visitor and Meta. CLIENT-SAFE.
 *
 * Frozen policy (MKT-04, 2026-11-02):
 *
 *   ALLOW      browser PageView + eligible server CAPI Lead
 *   UNDECIDED  zero Meta
 *   DENY       zero Meta
 *   UNKNOWN    zero Meta
 *
 * The state is whatever the visitor last chose, and nothing else: there is no
 * default of ALLOW, no inference from jurisdiction, and an unreadable or
 * malformed record is UNKNOWN rather than a guess. This is separate from the
 * enquiry form's consent checkboxes, which concern replying to the enquiry.
 *
 * The pure functions are shared with the server, which reads the state the form
 * submitted through normaliseConsent(). Only the browser layer touches storage.
 */

export const MEASUREMENT_CONSENT_STATES = ["ALLOW", "DENY", "UNDECIDED", "UNKNOWN"] as const;
export type MeasurementConsent = (typeof MEASUREMENT_CONSENT_STATES)[number];

/** Bump when the banner's meaning changes: earlier choices then read as UNKNOWN. */
export const MEASUREMENT_CONSENT_VERSION = "2026-11-02.v1" as const;

const STORAGE_KEY = "i3dc.measurement";
const CHANGE_EVENT = "i3dc:measurement-consent";
export const PREFERENCES_EVENT = "i3dc:measurement-preferences";

/** Exact values only. Anything else a client sends, or omits, is UNKNOWN. */
export function normaliseConsent(value: unknown): MeasurementConsent {
  return value === "ALLOW" || value === "DENY" || value === "UNDECIDED" ? value : "UNKNOWN";
}

/** Read a stored record. No record is UNDECIDED; a damaged or stale one is UNKNOWN. */
export function parseStoredConsent(raw: string | null | undefined): MeasurementConsent {
  if (raw === null || raw === undefined) return "UNDECIDED";
  try {
    const record = JSON.parse(raw) as { state?: unknown; version?: unknown } | null;
    if (record?.version !== MEASUREMENT_CONSENT_VERSION) return "UNKNOWN";
    return record.state === "ALLOW" || record.state === "DENY" ? record.state : "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

export function serialiseConsent(state: "ALLOW" | "DENY", atIso: string): string {
  return JSON.stringify({ state, version: MEASUREMENT_CONSENT_VERSION, at: atIso });
}

/* ── browser layer ──────────────────────────────────────────────────────── */

/** Blocked storage still honours a choice for the life of the page, and no longer. */
let unsavedChoice: "ALLOW" | "DENY" | null = null;

export function readMeasurementConsent(): MeasurementConsent {
  if (typeof window === "undefined") return "UNKNOWN";
  if (unsavedChoice) return unsavedChoice;
  try {
    return parseStoredConsent(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return "UNKNOWN";
  }
}

/** Expire the Pixel's first-party cookies on this host and the parent domain. */
export function clearMetaCookies(): void {
  if (typeof document === "undefined") return;
  const parent = window.location.hostname.replace(/^www\./, "");
  for (const name of ["_fbp", "_fbc"]) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${parent}`;
  }
}

export function setMeasurementConsent(state: "ALLOW" | "DENY"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, serialiseConsent(state, new Date().toISOString()));
    unsavedChoice = null;
  } catch {
    unsavedChoice = state;
  }
  if (state === "DENY") clearMetaCookies();
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribe to changes in this tab and in others, for useSyncExternalStore. */
export function subscribeMeasurementConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
