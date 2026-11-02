/**
 * Conversions API — the server-side Lead event. SERVER-ONLY.
 *
 * WHAT IS SENT, and nothing else:
 *
 *   event_name        "Lead"
 *   event_time        server clock, Unix seconds
 *   event_id          derived from this enquiry's website_ref (lib/meta/identity)
 *   action_source     "website"
 *   event_source_url  the page the enquiry was submitted from (origin + path only)
 *   user_data         fbp / fbc — under ALLOW only, exactly as issued, when well-formed
 *                     client_user_agent
 *
 * NEVER SENT: raw IP, email or phone (raw or hashed), external_id, website_ref,
 * name, organisation, the enquiry message or CRM Description, enquiry type,
 * service interest, consent flags, or anything clinical. There is no custom_data
 * block at all.
 *
 * DELIVERY is a single attempt with a hard timeout. It never throws and is
 * never retried, so a slow or failing Meta can neither block nor duplicate
 * anything — the CRM write has already succeeded before this runs. A failed send
 * is lost, by design: there is no outbox and nothing replays or backfills.
 *
 * LOGGING carries operational evidence only: event id, event name, HTTP
 * status, Meta's received-event count, a coarse error category. Never the
 * token, never an identifier, never the request payload, and never
 * Meta's error message text (it can echo request parameters back).
 */
import "server-only";
import type { CapiTransport } from "./config";

/** Everything the Lead event is built from. No contact detail can reach it. */
export interface LeadFacts {
  eventId: string;
  eventTimeSec: number;
  eventSourceUrl: string;
  fbp?: string;
  fbc?: string;
  userAgent?: string;
}

export interface CapiUserData {
  fbp?: string;
  fbc?: string;
  client_user_agent?: string;
}

export interface CapiLeadEvent {
  event_name: "Lead";
  event_time: number;
  event_id: string;
  action_source: "website";
  event_source_url: string;
  user_data: CapiUserData;
}

export interface CapiRequestBody {
  data: [CapiLeadEvent];
  /** UAT only: routes the event to Meta's Test Events view. */
  test_event_code?: string;
}

/** Build the request body. Absent facts are omitted outright, never sent empty. */
export function buildLeadRequest(facts: LeadFacts, testEventCode?: string): CapiRequestBody {
  const user_data: CapiUserData = {};
  if (facts.fbp) user_data.fbp = facts.fbp;
  if (facts.fbc) user_data.fbc = facts.fbc;
  if (facts.userAgent) user_data.client_user_agent = facts.userAgent;

  return {
    data: [
      {
        event_name: "Lead",
        event_time: facts.eventTimeSec,
        event_id: facts.eventId,
        action_source: "website",
        event_source_url: facts.eventSourceUrl,
        user_data,
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };
}

export interface CapiResult {
  ok: boolean;
  status?: number;
  /** Meta's `events_received` on success. */
  eventsReceived?: number;
  /** Coarse, secret-free failure category: `http_500`, `meta_error_190`, `timeout`, … */
  category?: string;
  /** Meta's trace id — an opaque support reference, safe to log. */
  fbtraceId?: string;
}

export const CAPI_TIMEOUT_MS = 4000;

interface MetaResponseBody {
  events_received?: unknown;
  fbtrace_id?: unknown;
  error?: { code?: unknown; error_subcode?: unknown; fbtrace_id?: unknown };
}

/**
 * POST one request to the events endpoint. Single attempt, hard timeout, never throws.
 *
 * The token travels only in the Authorization header — not in the URL, where a
 * thrown fetch error or an intermediary's access log could capture it, and not
 * in the body, which is JSON that someone may one day decide to log.
 */
export async function sendCapiRequest(
  transport: CapiTransport,
  body: CapiRequestBody,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<CapiResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? CAPI_TIMEOUT_MS);
  try {
    const res = await fetchImpl(transport.endpoint, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${transport.accessToken.reveal()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    let json: MetaResponseBody | null = null;
    try {
      json = (await res.json()) as MetaResponseBody;
    } catch {
      /* non-JSON body — the status alone classifies it */
    }
    const fbtrace = json?.error?.fbtrace_id ?? json?.fbtrace_id;
    const fbtraceId = typeof fbtrace === "string" ? fbtrace.slice(0, 64) : undefined;
    if (res.ok) {
      const received = json?.events_received;
      return {
        ok: true,
        status: res.status,
        eventsReceived: typeof received === "number" ? received : undefined,
        fbtraceId,
      };
    }
    const code = json?.error?.code;
    const subcode = json?.error?.error_subcode;
    const category =
      typeof code === "number"
        ? `meta_error_${code}${typeof subcode === "number" ? `_${subcode}` : ""}`
        : `http_${res.status}`;
    return { ok: false, status: res.status, category, fbtraceId };
  } catch {
    // The thrown error is swallowed on purpose: only a category leaves here.
    return { ok: false, category: controller.signal.aborted ? "timeout" : "network_error" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Deliver a prepared Lead and record the outcome. Never throws — it runs after
 * the visitor already has their response, and must not disturb anything.
 */
export async function deliverLead(
  transport: CapiTransport,
  body: CapiRequestBody,
  context: { requestId: string },
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<CapiResult> {
  const event = body.data[0];
  const testEvent = Boolean(body.test_event_code);
  const evidence = { request_id: context.requestId, event_id: event.event_id, event_name: event.event_name };
  if (testEvent) {
    // Loud on every send, like [enquiry:LOCAL-LIVE], so a UAT code cannot be
    // left switched on in Production unnoticed.
    console.warn(
      "[meta:TEST-EVENTS] META_TEST_EVENT_CODE is set — this Lead is sent as a Meta Test Event. Remove it after UAT.",
      evidence,
    );
  }
  let result: CapiResult;
  try {
    result = await sendCapiRequest(transport, body, options);
  } catch {
    result = { ok: false, category: "unexpected" };
  }
  if (result.ok) {
    console.info("[meta:capi] Lead delivered", {
      ...evidence,
      status: result.status,
      events_received: result.eventsReceived,
      test_event: testEvent,
    });
  } else {
    // The enquiry itself is safe in the CRM; this records only that Meta did not
    // receive the server half. The browser Pixel half may still have landed.
    console.error("[meta:CAPI-FAILED]", {
      ...evidence,
      at: new Date().toISOString(),
      status: result.status,
      category: result.category,
      fbtrace_id: result.fbtraceId,
    });
  }
  return result;
}
