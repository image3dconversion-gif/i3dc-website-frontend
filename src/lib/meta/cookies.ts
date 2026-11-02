/**
 * Meta browser identifiers `_fbp` and `_fbc`. Pure — no I/O.
 *
 * Both cookies are first-party cookies set by the Meta Pixel (fbevents.js):
 *
 *   _fbp  fb.{subdomainIndex}.{creationTimeMs}.{random}   browser id, set on the first Pixel load
 *   _fbc  fb.{subdomainIndex}.{creationTimeMs}.{fbclid}   click id, set when a landing URL carries ?fbclid=
 *
 * The enquiry route reads them from the request's Cookie header and forwards
 * them to CAPI UNMODIFIED — Meta treats them as case-sensitive and they are
 * never hashed. A value that does not match the documented shape is dropped:
 * never repaired, never invented.
 *
 * The CRM's `Meta_FBCLID` is a separate, pre-existing path (lib/attribution →
 * lib/zoho/mapping) and is not touched by anything here.
 */

/** Documented shape, tolerating the optional trailing appendix newer Meta SDKs add. */
const FBP_RE = /^fb\.\d\.\d{10,13}\.\d{1,20}(?:\.[A-Za-z0-9_-]{1,32})?$/;
const FBC_RE = /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,500}(?:\.[A-Za-z0-9_-]{1,32})?$/;
const MAX_COOKIE_VALUE = 1000;

/** One cookie's raw value from a Cookie header; the first occurrence wins. */
export function readCookie(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0 || part.slice(0, eq).trim() !== name) continue;
    const value = part.slice(eq + 1).trim();
    return value || undefined;
  }
  return undefined;
}

const matches = (re: RegExp, value: string | undefined): string | undefined =>
  value && value.length <= MAX_COOKIE_VALUE && re.test(value) ? value : undefined;

/** A well-formed `_fbp` value, else undefined. */
export function validFbp(value: string | undefined): string | undefined {
  return matches(FBP_RE, value);
}

/** A well-formed `_fbc` value, else undefined. */
export function validFbc(value: string | undefined): string | undefined {
  return matches(FBC_RE, value);
}

/**
 * ENABLED — controller amendment 2026-09-11: only when a complete,
 * non-truncated fbclid AND its first-touch timestamp are available.
 *
 * A visitor can arrive with ?fbclid= yet have no `_fbc` cookie — typically
 * because the Pixel was blocked, so fbevents.js never ran to set it. The click
 * id itself is still captured by lib/attribution (and still reaches the CRM as
 * `Meta_FBCLID`). Meta documents a server-side construction for exactly this
 * case:
 *
 *   fbc = fb.1.{creationTimeMs}.{fbclid}
 *     subdomainIndex  1      — Meta: use 1 when generating the value on a server
 *     creationTimeMs         — Meta: when the fbclid was first observed; here the
 *                              start of the acquisition touch that carried it
 *     fbclid                 — exactly as received; case-sensitive, never altered
 *
 * It is a FALLBACK only: a well-formed `_fbc` cookie always wins, and any
 * doubt about either input means no `fbc` at all rather than a guessed one.
 */
export const CONSTRUCT_FBC_FROM_FBCLID = true;

/**
 * lib/enquiry/validate.ts stores fbclid capped at 160 characters, so a value AT
 * the cap may be a truncated click id. Only a value provably under it is used.
 */
const FBCLID_MAX_UNTRUNCATED = 159;
const FBCLID_RE = /^[A-Za-z0-9_-]+$/;
/** The Pixel's own `_fbc` cookie lives 90 days; an older observation is stale. */
const MAX_FBCLID_AGE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Meta's documented server-side `fbc` construction, or undefined if any input
 * is unsafe: a missing, truncated-length or malformed click id, or an
 * observation time that is missing, unparseable, in the future relative to the
 * server clock, or older than the cookie's own lifetime.
 */
export function constructFbc(
  fbclid: string | undefined,
  observedAtIso: string | undefined,
  nowMs: number = Date.now(),
): string | undefined {
  if (!fbclid || fbclid.length > FBCLID_MAX_UNTRUNCATED || !FBCLID_RE.test(fbclid)) return undefined;
  const observedAtMs = observedAtIso ? Date.parse(observedAtIso) : Number.NaN;
  if (!Number.isFinite(observedAtMs) || observedAtMs <= 0) return undefined;
  if (observedAtMs > nowMs || nowMs - observedAtMs > MAX_FBCLID_AGE_MS) return undefined;
  return validFbc(`fb.1.${observedAtMs}.${fbclid}`);
}

/**
 * The `fbc` to send: the Pixel's own cookie when it is well-formed; otherwise
 * the documented construction (while enabled); otherwise nothing.
 */
export function resolveFbc(
  input: { cookie?: string; fbclid?: string; fbclidObservedAtIso?: string },
  options: { allowConstruction?: boolean; nowMs?: number } = {},
): string | undefined {
  const fromCookie = validFbc(input.cookie);
  if (fromCookie) return fromCookie;
  const allowConstruction = options.allowConstruction ?? CONSTRUCT_FBC_FROM_FBCLID;
  return allowConstruction ? constructFbc(input.fbclid, input.fbclidObservedAtIso, options.nowMs) : undefined;
}
