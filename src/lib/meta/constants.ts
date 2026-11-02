/**
 * Meta identifiers shared by the browser Pixel and the server Conversions API.
 *
 * CLIENT-SAFE: nothing here is secret. The Pixel id is public by design — it is
 * visible in every page that loads the Pixel. The CAPI access token is NEVER
 * referenced here or in any module reachable from client code; it is read only
 * by the server-only lib/meta/config.ts.
 */

/**
 * The ONLY Meta dataset this site may use: "I3DC Services — image3dconversion.com".
 *
 * The browser Pixel and the server CAPI both resolve to this exact value, so the
 * two halves can never report into different datasets. It is an allowlist of
 * one: a legacy SurgiGuide/workshop Pixel id supplied through the environment
 * is refused rather than wired in (see resolveMetaTracking()).
 */
export const I3DC_META_PIXEL_ID = "1788653802312623" as const;

export const META_EVENT_ID_PREFIX = "i3dc_lead_" as const;

/** Server-derived event ids: the prefix and 128 bits of an HMAC-SHA256 in hex. */
const EVENT_ID_RE = /^i3dc_lead_[0-9a-f]{32}$/;

/** True for a well-formed server-derived event id. Anything else is never sent to Meta. */
export function isMetaEventId(value: unknown): value is string {
  return typeof value === "string" && EVENT_ID_RE.test(value);
}
