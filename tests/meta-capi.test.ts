/**
 * The CAPI Lead payload and its transport.
 *
 * What these tests hold in place:
 *  - the payload carries exactly the agreed fields: no contact detail raw or
 *    hashed, no IP, no external_id, no name, message or clinical text, no custom_data;
 *  - blank identifiers are omitted, never sent empty;
 *  - test_event_code appears only when a UAT code is configured;
 *  - the token travels only in the Authorization header, and no failure mode
 *    — HTTP error, Meta error echoing the request, network error, timeout —
 *    can surface the token, a raw identifier or Meta's message text.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { format } from "node:util";
import { SecretValue, type CapiTransport } from "../src/lib/meta/config.ts";
import { buildLeadRequest, deliverLead, sendCapiRequest, type LeadFacts } from "../src/lib/meta/capi.ts";

const TOKEN = "FAKE-TEST-TOKEN-not-a-real-credential-0123456789";
const EVENT_ID = "i3dc_lead_00112233445566778899aabbccddeeff";
const EMAIL_RAW = "doctor@clinic-sample.in";

const transport = (testEventCode?: string): CapiTransport => ({
  endpoint: "https://graph.facebook.com/v26.0/1788653802312623/events",
  accessToken: new SecretValue(TOKEN),
  eventIdSecret: new SecretValue("fake-i3dc-event-id-secret-0123456789abcdef"),
  mode: testEventCode ? "TEST_EVENTS" : "LIVE",
  ...(testEventCode ? { testEventCode } : {}),
});

const facts = (over: Partial<LeadFacts> = {}): LeadFacts => ({
  eventId: EVENT_ID,
  eventTimeSec: 1789120800,
  eventSourceUrl: "https://image3dconversion.com/discuss-a-case/",
  fbp: "fb.1.1596403881668.1116446470",
  fbc: "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
  userAgent: "Mozilla/5.0 (I3DC test)",
  ...over,
});

describe("the Lead payload", () => {
  test("carries exactly the agreed fields", () => {
    assert.deepEqual(buildLeadRequest(facts()), {
      data: [
        {
          event_name: "Lead",
          event_time: 1789120800,
          event_id: EVENT_ID,
          action_source: "website",
          event_source_url: "https://image3dconversion.com/discuss-a-case/",
          user_data: {
            fbp: "fb.1.1596403881668.1116446470",
            fbc: "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
            client_user_agent: "Mozilla/5.0 (I3DC test)",
          },
        },
      ],
    });
  });

  test("has no custom_data and no top-level extras", () => {
    const body = buildLeadRequest(facts());
    assert.deepEqual(Object.keys(body), ["data"]);
    assert.ok(!("custom_data" in body.data[0]));
  });

  test("absent optional identifiers are omitted, not sent empty", () => {
    const body = buildLeadRequest(facts({ fbp: undefined, fbc: undefined, userAgent: undefined }));
    assert.deepEqual(body.data[0].user_data, {});
  });

  test("test_event_code only when a UAT code is supplied", () => {
    assert.ok(!("test_event_code" in buildLeadRequest(facts())));
    assert.ok(!("test_event_code" in buildLeadRequest(facts(), undefined)));
    assert.equal(buildLeadRequest(facts(), "TEST12345").test_event_code, "TEST12345");
  });
});

/** A fetch stand-in that records the request and answers as told. */
function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return respond();
  }) as typeof fetch;
  return { impl, calls };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("transport", () => {
  test("the token travels only in the Authorization header", async () => {
    const f = fakeFetch(() => json(200, { events_received: 1, fbtrace_id: "AbC123" }));
    await sendCapiRequest(transport(), buildLeadRequest(facts()), { fetchImpl: f.impl });
    assert.equal(f.calls.length, 1);
    const { url, init } = f.calls[0];
    assert.equal(url, "https://graph.facebook.com/v26.0/1788653802312623/events");
    assert.ok(!url.includes(TOKEN) && !url.includes("access_token"), "never in the URL");
    assert.equal(init.method, "POST");
    const headers = init.headers as Record<string, string>;
    assert.equal(headers.Authorization, `Bearer ${TOKEN}`);
    assert.equal(headers["Content-Type"], "application/json");
    assert.ok(!String(init.body).includes(TOKEN), "never in the body");
  });

  test("success reports Meta's received-event count", async () => {
    const f = fakeFetch(() => json(200, { events_received: 1, messages: [], fbtrace_id: "AbC123" }));
    const r = await sendCapiRequest(transport(), buildLeadRequest(facts()), { fetchImpl: f.impl });
    assert.deepEqual(r, { ok: true, status: 200, eventsReceived: 1, fbtraceId: "AbC123" });
  });

  test("a Meta error is reduced to a code — its message (which can echo the request) is dropped", async () => {
    const f = fakeFetch(() =>
      json(400, {
        error: {
          message: `Invalid OAuth access token - Cannot parse access token ${TOKEN} for ${EMAIL_RAW}`,
          type: "OAuthException",
          code: 190,
          error_subcode: 463,
          fbtrace_id: "Xyz789",
        },
      }),
    );
    const r = await sendCapiRequest(transport(), buildLeadRequest(facts()), { fetchImpl: f.impl });
    assert.deepEqual(r, { ok: false, status: 400, category: "meta_error_190_463", fbtraceId: "Xyz789" });
    assert.ok(!JSON.stringify(r).includes(TOKEN));
  });

  test("a non-JSON HTTP failure is classified by status", async () => {
    const f = fakeFetch(() => new Response("<html>bad gateway</html>", { status: 502 }));
    const r = await sendCapiRequest(transport(), buildLeadRequest(facts()), { fetchImpl: f.impl });
    assert.deepEqual(r, { ok: false, status: 502, category: "http_502", fbtraceId: undefined });
  });

  test("a thrown network error surfaces as a category only", async () => {
    const f = fakeFetch(() => {
      throw new TypeError(`fetch failed for https://graph.facebook.com/?access_token=${TOKEN}`);
    });
    const r = await sendCapiRequest(transport(), buildLeadRequest(facts()), { fetchImpl: f.impl });
    assert.deepEqual(r, { ok: false, category: "network_error" });
  });

  test("a hung Meta times out instead of holding the function open", async () => {
    const hang = (async (_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      })) as typeof fetch;
    const started = Date.now();
    const r = await sendCapiRequest(transport(), buildLeadRequest(facts()), { fetchImpl: hang, timeoutMs: 50 });
    assert.deepEqual(r, { ok: false, category: "timeout" });
    assert.ok(Date.now() - started < 2000);
  });
});

/** Capture console output for the duration of fn. */
async function captureConsole<T>(fn: () => Promise<T>): Promise<{ result: T; lines: string[] }> {
  const lines: string[] = [];
  const methods = ["log", "info", "warn", "error", "debug"] as const;
  const saved = methods.map((m) => console[m]);
  for (const m of methods) console[m] = (...args: unknown[]) => void lines.push(`${m}: ${format(...args)}`);
  try {
    return { result: await fn(), lines };
  } finally {
    methods.forEach((m, i) => (console[m] = saved[i]));
  }
}

describe("delivery logging is operational evidence only", () => {
  const forbidden = [TOKEN, EMAIL_RAW, "fb.1.1596403881668"];

  test("success: one line with event id, status and received count", async () => {
    const f = fakeFetch(() => json(200, { events_received: 1 }));
    const { lines } = await captureConsole(() =>
      deliverLead(transport(), buildLeadRequest(facts()), { requestId: "req-1" }, { fetchImpl: f.impl }),
    );
    assert.equal(lines.length, 1);
    assert.match(lines[0], /^info: \[meta:capi\] Lead delivered/);
    assert.ok(lines[0].includes(EVENT_ID) && lines[0].includes("events_received: 1"));
    for (const s of forbidden) assert.ok(!lines.join("\n").includes(s), `log leaked ${s}`);
  });

  test("failure: one [meta:CAPI-FAILED] line with a category, nothing sensitive", async () => {
    const f = fakeFetch(() => json(400, { error: { message: `bad token ${TOKEN}`, code: 190 } }));
    const { result, lines } = await captureConsole(() =>
      deliverLead(transport(), buildLeadRequest(facts()), { requestId: "req-2" }, { fetchImpl: f.impl }),
    );
    assert.equal(result.ok, false);
    assert.equal(lines.length, 1);
    assert.match(lines[0], /^error: \[meta:CAPI-FAILED\]/);
    assert.ok(lines[0].includes("meta_error_190") && lines[0].includes(EVENT_ID));
    for (const s of [...forbidden, "bad token"]) assert.ok(!lines.join("\n").includes(s), `log leaked ${s}`);
  });

  test("never throws, even if the fetch implementation itself throws synchronously", async () => {
    const boom = (() => {
      throw new Error(`sync explosion ${TOKEN}`);
    }) as unknown as typeof fetch;
    const { result, lines } = await captureConsole(() =>
      deliverLead(transport(), buildLeadRequest(facts()), { requestId: "req-3" }, { fetchImpl: boom }),
    );
    assert.equal(result.ok, false);
    assert.ok(!lines.join("\n").includes(TOKEN));
  });

  test("a UAT send is flagged loudly on every event, without echoing the code", async () => {
    const f = fakeFetch(() => json(200, { events_received: 1 }));
    const { lines } = await captureConsole(() =>
      deliverLead(transport("TEST98765"), buildLeadRequest(facts(), "TEST98765"), { requestId: "req-4" }, { fetchImpl: f.impl }),
    );
    assert.ok(lines.some((l) => l.startsWith("warn: [meta:TEST-EVENTS]")));
    assert.ok(lines.some((l) => l.includes("test_event: true")));
    assert.ok(!lines.join("\n").includes("TEST98765"));
  });
});
