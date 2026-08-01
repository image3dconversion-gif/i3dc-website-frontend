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
 * Required env for live mode (set on the host, never committed):
 *   ZOHO_SUBMIT_ENABLED=true
 *   ZOHO_ACCOUNTS_URL=https://accounts.zoho.in        (or .com / region)
 *   ZOHO_API_DOMAIN=https://www.zohoapis.in           (or .com / region)
 *   ZOHO_CLIENT_ID=...
 *   ZOHO_CLIENT_SECRET=...
 *   ZOHO_REFRESH_TOKEN=...
 *   ZOHO_MODULE=Leads                                 (default Leads)
 */
import "server-only";
import type { ZohoLeadRecord } from "./mapping";

export type SubmitMode = "dry-run" | "live";

export interface SubmitResult {
  mode: SubmitMode;
  ok: boolean;
  id?: string;
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
  } = process.env;

  if (ZOHO_SUBMIT_ENABLED !== "true") return null;
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

async function getAccessToken(env: ZohoEnv): Promise<string> {
  const url =
    `${env.accountsUrl}/oauth/v2/token?refresh_token=${encodeURIComponent(env.refreshToken)}` +
    `&client_id=${encodeURIComponent(env.clientId)}` +
    `&client_secret=${encodeURIComponent(env.clientSecret)}` +
    `&grant_type=refresh_token`;
  const res = await fetch(url, { method: "POST", cache: "no-store" });
  if (!res.ok) throw new Error(`Zoho token error ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Zoho token missing access_token");
  return json.access_token;
}

/**
 * Submit a mapped lead. Dry-run unless live mode is configured + approved.
 * Never throws to the caller for a Zoho-side failure — returns ok:false so the
 * route can respond gracefully (the enquiry is not lost to the user).
 */
export async function submitLead(record: ZohoLeadRecord): Promise<SubmitResult> {
  const env = readEnv();

  if (!env) {
    // DRY-RUN: log server-side, do not contact Zoho.
    console.info("[enquiry:dry-run] would create Zoho lead:", {
      Last_Name: record.Last_Name,
      Email: record.Email,
      Lead_Source: record.Lead_Source,
      Inquiry_Type: record.Inquiry_Type,
    });
    return { mode: "dry-run", ok: true, detail: "Dry-run: Zoho submission not enabled." };
  }

  try {
    const token = await getAccessToken(env);
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
    return { mode: "live", ok: false, detail: row?.code || `HTTP ${res.status}` };
  } catch (err) {
    return { mode: "live", ok: false, detail: (err as Error).message };
  }
}
