/**
 * Meta Pixel + Conversions API configuration — the single enable gate. SERVER-ONLY.
 *
 * Nothing is sent to Meta unless ALL of the following hold:
 *
 *   META_TRACKING_ENABLED=true                      explicit master switch (default off)
 *   NEXT_PUBLIC_META_PIXEL_ID=1788653802312623      must be EXACTLY the I3DC dataset
 *
 * and the visitor has chosen ALLOW (lib/meta/consent). For server-side CAPI events:
 *
 *   META_CAPI_DELIVERY=OFF|TEST_EVENTS|LIVE         default OFF
 *   META_CAPI_ACCESS_TOKEN=…                        server-only secret (never NEXT_PUBLIC_)
 *   META_EVENT_ID_SECRET=…                          I3DC-only HMAC secret, 32+ characters
 *
 *   TEST_EVENTS  a Vercel Preview only, and META_TEST_EVENT_CODE must be set.
 *   LIVE         a Vercel Production only, and META_TEST_EVENT_CODE must be absent.
 *
 * META_TEST_EVENT_CODE on a Production deployment fails closed: no Pixel and no
 * CAPI at runtime, and next.config.ts refuses the build (lib/meta/build-gate).
 * With the switch off the integration is INERT: no Pixel is rendered, no event
 * id is derived, and no request leaves the server.
 *
 * LOCAL DEVELOPMENT GUARD (mirrors the Zoho guard in lib/zoho/client.ts): on a
 * `next dev` server nothing reaches Meta, even with production values copied
 * into .env.local. The Pixel renders locally only with META_ALLOW_LOCAL_TRACKING
 * =true, and CAPI then goes ONLY to a loopback sink named by META_GRAPH_API_BASE
 * — the test harness's fake Graph API. A production build ignores both
 * variables: it always talks to graph.facebook.com and can never be pointed at
 * another host, so the token cannot be redirected by configuration. An unrecognised
 * deployment (no VERCEL_ENV) can send neither Test Events nor live events.
 *
 * The access token is held in a SecretValue, which redacts itself in every
 * serialisation path, so logging a config object cannot leak it.
 */
import "server-only";
import { I3DC_META_PIXEL_ID } from "./constants";

/** Pinned Graph API version for CAPI (v26.0, released 2026-07-29). */
export const GRAPH_API_VERSION = "v26.0" as const;
const GRAPH_API_ORIGIN = "https://graph.facebook.com";

export type MetaEnv = Readonly<Record<string, string | undefined>>;

/** Opaque holder for the CAPI access token. Every serialisation path is redacted. */
export class SecretValue {
  readonly #value: string;
  constructor(value: string) {
    this.#value = value;
  }
  /** The one deliberate read — used for the Authorization header and nowhere else. */
  reveal(): string {
    return this.#value;
  }
  toString(): string {
    return "[redacted]";
  }
  toJSON(): string {
    return "[redacted]";
  }
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return "[redacted]";
  }
}

export type CapiDeliveryMode = "TEST_EVENTS" | "LIVE";

export interface CapiTransport {
  /** e.g. https://graph.facebook.com/v26.0/1788653802312623/events */
  endpoint: string;
  accessToken: SecretValue;
  /** The I3DC-only HMAC key that derives event ids from website references. */
  eventIdSecret: SecretValue;
  mode: CapiDeliveryMode;
  /** Present only in TEST_EVENTS mode, which cannot run on Production. */
  testEventCode?: string;
}

export interface MetaTracking {
  /** The Pixel id the browser may load, or null when the Pixel must not render. */
  pixelId: string | null;
  /** Server CAPI transport, or null when no server event may be sent. */
  capi: CapiTransport | null;
  /** Why something is off. Operational and secret-free — safe to log. */
  notes: string[];
}

const isTrue = (v: string | undefined): boolean => v === "true";

/** Keyed on NODE_ENV alone, exactly like the Zoho guard, so it can only fail closed. */
const isProductionBuild = (env: MetaEnv): boolean => env.NODE_ENV === "production";

const isVercelProduction = (env: MetaEnv): boolean => isProductionBuild(env) && env.VERCEL_ENV === "production";
const isVercelPreview = (env: MetaEnv): boolean => isProductionBuild(env) && env.VERCEL_ENV === "preview";

const MIN_EVENT_ID_SECRET_LENGTH = 32;

/**
 * The browser half of the gate. Deliberately never touches the access token, so
 * the root layout can call it without the secret ever being read on that path.
 */
export function resolveBrowserPixelId(env: MetaEnv): string | null {
  return pixelGate(env).pixelId;
}

function pixelGate(env: MetaEnv): { pixelId: string | null; notes: string[] } {
  if (isVercelProduction(env) && (env.META_TEST_EVENT_CODE ?? "").trim()) {
    return { pixelId: null, notes: ["test-event-code-forbidden-in-production"] };
  }
  if (!isTrue(env.META_TRACKING_ENABLED)) return { pixelId: null, notes: ["tracking-disabled"] };
  // An allowlist of one. A legacy SurgiGuide/workshop Pixel id — or any other
  // value — is refused rather than wired into this site.
  if ((env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim() !== I3DC_META_PIXEL_ID) {
    return { pixelId: null, notes: ["pixel-id-not-i3dc-dataset"] };
  }
  if (!isProductionBuild(env) && !isTrue(env.META_ALLOW_LOCAL_TRACKING)) {
    return { pixelId: null, notes: ["local-dev-suppressed"] };
  }
  return { pixelId: I3DC_META_PIXEL_ID, notes: [] };
}

/** Meta Test Events codes are short tokens such as `TEST12345`. */
const TEST_EVENT_CODE_RE = /^[A-Za-z0-9_-]{1,64}$/;

/** A loopback origin (the local fake Graph API), or null for anything else. */
function loopbackOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** Resolve both halves of the integration from one environment snapshot. */
export function resolveMetaTracking(env: MetaEnv): MetaTracking {
  const gate = pixelGate(env);
  if (!gate.pixelId) return { pixelId: null, capi: null, notes: gate.notes };
  const pixelId = gate.pixelId;
  const notes: string[] = [];

  const requested = (env.META_CAPI_DELIVERY ?? "OFF").trim();
  if (requested !== "TEST_EVENTS" && requested !== "LIVE") {
    return { pixelId, capi: null, notes: [requested === "OFF" ? "capi-delivery-off" : "capi-delivery-unrecognised"] };
  }
  const mode: CapiDeliveryMode = requested;

  const rawCode = (env.META_TEST_EVENT_CODE ?? "").trim();
  const testEventCode = TEST_EVENT_CODE_RE.test(rawCode) ? rawCode : undefined;
  if (mode === "LIVE") {
    if (rawCode) return { pixelId, capi: null, notes: ["capi-live-refused-test-code-present"] };
    if (isProductionBuild(env) && !isVercelProduction(env)) {
      return { pixelId, capi: null, notes: ["capi-live-refused-outside-production"] };
    }
  } else {
    if (!testEventCode) return { pixelId, capi: null, notes: ["capi-test-events-need-valid-code"] };
    if (isProductionBuild(env) && !isVercelPreview(env)) {
      return { pixelId, capi: null, notes: ["capi-test-events-refused-outside-preview"] };
    }
  }

  const token = (env.META_CAPI_ACCESS_TOKEN ?? "").trim();
  if (!token) return { pixelId, capi: null, notes: ["capi-no-access-token"] };

  const eventIdSecret = (env.META_EVENT_ID_SECRET ?? "").trim();
  if (eventIdSecret.length < MIN_EVENT_ID_SECRET_LENGTH) {
    return { pixelId, capi: null, notes: ["capi-no-event-id-secret"] };
  }

  let origin = GRAPH_API_ORIGIN;
  if (isProductionBuild(env)) {
    if (env.META_GRAPH_API_BASE) notes.push("graph-base-override-ignored-in-production");
  } else {
    const sink = loopbackOrigin(env.META_GRAPH_API_BASE);
    if (!sink) return { pixelId, capi: null, notes: ["capi-local-dev-without-loopback-sink"] };
    origin = sink;
  }

  return {
    pixelId,
    capi: {
      endpoint: `${origin}/${GRAPH_API_VERSION}/${pixelId}/events`,
      accessToken: new SecretValue(token),
      eventIdSecret: new SecretValue(eventIdSecret),
      mode,
      ...(mode === "TEST_EVENTS" ? { testEventCode } : {}),
    },
    notes,
  };
}
