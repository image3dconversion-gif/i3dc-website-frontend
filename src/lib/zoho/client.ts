/**
 * Zoho CRM client — GUARDED. Server-only.
 *
 * SAFETY: live submission happens ONLY when ZOHO_SUBMIT_ENABLED === "true" AND
 * all credentials are present. Otherwise every submission runs in DRY-RUN: the
 * record is validated, mapped and logged, and a success is returned WITHOUT
 * contacting Zoho. This satisfies "do not send real production leads unless
 * approved". Credentials are read from server env only and never reach the
 * browser bundle.
 *
 * LOGGING: no enquirer data (name, email, phone, message) and no mapped record
 * is ever written to runtime logs — only classification and failure category.
 *
 * Required env for live mode (set on the host, never committed):
 *   ZOHO_SUBMIT_ENABLED=true
 *   ZOHO_ACCOUNTS_URL=https://accounts.zoho.in        (or .com / region)
 *   ZOHO_API_DOMAIN=https://www.zohoapis.in           (or .com / region)
 *   ZOHO_CLIENT_ID=...
 *   ZOHO_CLIENT_SECRET=...
 *   ZOHO_REFRESH_TOKEN=...
 *   ZOHO_MODULE=Leads                                 (default Leads)
 *
 * Live mode additionally requires a production build. On a local dev server
 * submission is forced to dry-run unless ZOHO_ALLOW_LOCAL_LIVE=true is set
 * deliberately (local only — never set it in Vercel).
 */
import "server-only";
import type { ZohoLeadRecord } from "./mapping";

export type SubmitMode = "dry-run" | "live";

/** Which half of a live submission failed. Operational only — never user-facing. */
export type SubmitStage = "auth" | "create";

export interface SubmitResult {
  mode: SubmitMode;
  ok: boolean;
  id?: string;
  /** Present only on a live failure. */
  stage?: SubmitStage;
  /**
   * Coarse, non-sensitive failure category (`http_401`, `INVALID_DATA`,
   * `network_error`, …). Safe to log. Raw error messages are deliberately NOT
   * propagated: the token request carries credentials in its query string, so a
   * thrown fetch error could otherwise leak them into runtime logs.
   */
  category?: string;
  detail?: string;
}

interface ZohoEnv {
  accountsUrl: string;
  apiDomain: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  module: string;
  /** Optional: target layout id for "Image3DConversion Website Leads". */
  layoutId?: string;
}

function readEnv(): ZohoEnv | null {
  const {
    ZOHO_SUBMIT_ENABLED,
    ZOHO_ACCOUNTS_URL,
    ZOHO_API_DOMAIN,
    ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET,
    ZOHO_REFRESH_TOKEN,
    ZOHO_MODULE,
    ZOHO_LAYOUT_ID,
    ZOHO_ALLOW_LOCAL_LIVE,
  } = process.env;

  if (ZOHO_SUBMIT_ENABLED !== "true") return null;

  // Local-development guard. A dev server must never write to the live CRM,
  // even when .env.local holds real credentials — an ordinary `npm run dev`
  // session working on the form would otherwise create genuine leads.
  //
  // Keyed on NODE_ENV, matching the Keystatic gate in middleware.ts. Vercel sets
  // NODE_ENV=production for Production and Preview builds, so this is inert
  // there: it can only fail closed on a positively-identified local `next dev`.
  // It deliberately does NOT key on VERCEL/VERCEL_ENV — if those were ever
  // absent at runtime the site would silently revert to dry-run, which is the
  // exact lead loss this module exists to prevent.
  if (process.env.NODE_ENV !== "production" && ZOHO_ALLOW_LOCAL_LIVE !== "true") {
    return null;
  }

  if (
    !ZOHO_ACCOUNTS_URL ||
    !ZOHO_API_DOMAIN ||
    !ZOHO_CLIENT_ID ||
    !ZOHO_CLIENT_SECRET ||
    !ZOHO_REFRESH_TOKEN
  ) {
    return null;
  }
  return {
    accountsUrl: ZOHO_ACCOUNTS_URL,
    apiDomain: ZOHO_API_DOMAIN,
    clientId: ZOHO_CLIENT_ID,
    clientSecret: ZOHO_CLIENT_SECRET,
    refreshToken: ZOHO_REFRESH_TOKEN,
    module: ZOHO_MODULE || "Leads",
    layoutId: ZOHO_LAYOUT_ID || undefined,
  };
}

/** True when live submission is fully configured and approved. */
export function isLiveEnabled(): boolean {
  return readEnv() !== null;
}

/** Auth failure carrying only a coarse category — never a credential or URL. */
class ZohoAuthError extends Error {
  constructor(readonly category: string) {
    super(`Zoho auth failed: ${category}`);
    this.name = "ZohoAuthError";
  }
}

/** Transient token-endpoint conditions worth one more attempt. */
const RETRYABLE_TOKEN_STATUS = new Set([429, 500, 502, 503, 504]);
const TOKEN_RETRY_DELAY_MS = 400;

interface TokenAttempt {
  token?: string;
  category?: string;
  retryable: boolean;
}

async function requestAccessToken(env: ZohoEnv): Promise<TokenAttempt> {
  const url =
    `${env.accountsUrl}/oauth/v2/token?refresh_token=${encodeURIComponent(env.refreshToken)}` +
    `&client_id=${encodeURIComponent(env.clientId)}` +
    `&client_secret=${encodeURIComponent(env.clientSecret)}` +
    `&grant_type=refresh_token`;
  try {
    const res = await fetch(url, { method: "POST", cache: "no-store" });
    if (!res.ok) {
      return { category: `http_${res.status}`, retryable: RETRYABLE_TOKEN_STATUS.has(res.status) };
    }
    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) return { category: "no_access_token", retryable: false };
    return { token: json.access_token, retryable: false };
  } catch {
    // The thrown error is swallowed on purpose: `url` above embeds the refresh
    // token and client secret, and fetch errors can carry the request URL.
    return { category: "network_error", retryable: true };
  }
}

/**
 * Fetch an access token, retrying ONCE on a transient failure.
 *
 * Retrying here is safe because the token exchange is idempotent and has no CRM
 * side effect. The record create is deliberately never retried — without an
 * idempotency key, a retry after a lost response would duplicate the lead, and
 * trading silent loss for silent duplication is not an improvement.
 */
async function getAccessToken(env: ZohoEnv): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await requestAccessToken(env);
    if (result.token) return result.token;
    if (!result.retryable || attempt === 1) throw new ZohoAuthError(result.category ?? "unknown");
    await new Promise((resolve) => setTimeout(resolve, TOKEN_RETRY_DELAY_MS));
  }
  throw new ZohoAuthError("unknown");
}

/**
 * Submit a mapped lead. Dry-run unless live mode is configured + approved.
 * Never throws to the caller for a Zoho-side failure — returns ok:false so the
 * route can respond gracefully (the enquiry is not lost to the user).
 */
export async function submitLead(record: ZohoLeadRecord): Promise<SubmitResult> {
  const env = readEnv();

  if (env && process.env.NODE_ENV !== "production") {
    // Only reachable via the deliberate ZOHO_ALLOW_LOCAL_LIVE override. Loud on
    // every submission so it cannot be left switched on unnoticed.
    console.warn(
      "[enquiry:LOCAL-LIVE] ZOHO_ALLOW_LOCAL_LIVE is set — this development server is writing to the LIVE Zoho CRM.",
    );
  }

  if (!env) {
    // DRY-RUN: log server-side, do not contact Zoho. Classification only —
    // no name, email, phone or message is ever written to runtime logs.
    console.info("[enquiry:dry-run] would create Zoho lead", {
      lead_source: record.Lead_Source,
      inquiry_type: record.Inquiry_Type,
      journey_stage: record.Journey_Stage,
      has_email: Boolean(record.Email),
    });
    return { mode: "dry-run", ok: true, detail: "Dry-run: Zoho submission not enabled." };
  }

  let token: string;
  try {
    token = await getAccessToken(env);
  } catch (err) {
    const category = err instanceof ZohoAuthError ? err.category : "network_error";
    return { mode: "live", ok: false, stage: "auth", category };
  }

  // Single attempt — see getAccessToken() for why creates are never retried.
  try {
    // Target the Website-Leads layout when its id is configured (no hardcoded id).
    const payload = env.layoutId ? { ...record, Layout: { id: env.layoutId } } : record;
    const res = await fetch(`${env.apiDomain}/crm/v6/${env.module}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [payload], trigger: ["workflow"] }),
    });
    const json = (await res.json()) as {
      data?: Array<{ code?: string; details?: { id?: string } }>;
    };
    const row = json.data?.[0];
    if (res.ok && row?.code === "SUCCESS") {
      return { mode: "live", ok: true, id: row.details?.id };
    }
    return { mode: "live", ok: false, stage: "create", category: row?.code || `http_${res.status}` };
  } catch {
    return { mode: "live", ok: false, stage: "create", category: "network_error" };
  }
}
