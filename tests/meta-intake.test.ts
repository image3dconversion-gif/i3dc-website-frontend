/**
 * Fake-Zoho + fake-Graph integration of the REAL enquiry pipeline.
 *
 * handleEnquiry() runs exactly as /api/enquiry does in production, with the real
 * validator, mapping, Zoho client and CAPI sender. Only the far ends are fakes,
 * both on loopback. Nothing real is contacted — the Meta dev guard would refuse
 * any non-loopback Graph host anyway, and every credential here is a fake.
 */
import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { format } from "node:util";
import { handleEnquiry } from "../src/lib/enquiry/intake.ts";
import { isMetaEventId } from "../src/lib/meta/constants.ts";
import { deriveMetaEventId } from "../src/lib/meta/identity.ts";

const LOCKED = "1788653802312623";
const TOKEN = "FAKE-TEST-TOKEN-not-a-real-credential-0123456789";
const SECRET = "fake-i3dc-event-id-secret-0123456789abcdef";
const EMAIL = "Asha.Rao@Clinic-Sample.in";
const PHONE = "98765 43210";
const LEAD_ID = "6607000000000000001";
const FBP = "fb.1.1596403881668.1116446470";
const FBC = "fb.1.1757000000000.IwAR-cookie_click";
const UA = "Mozilla/5.0 (I3DC intake test)";
const IP = "198.51.100.77";
const MESSAGE = "I would like planning support for an upcoming procedure.";
const COOKIES = `theme=light; _fbp=${FBP}; _fbc=${FBC}`;
const REF_RE = /i3dc_ref_[0-9a-f]{32}/;

/** Strings that must never appear in any response body or log line. */
const NEVER_EXPOSED = [TOKEN, SECRET, EMAIL, EMAIL.toLowerCase(), PHONE, "9876543210", MESSAGE, "ZZ Meta Intake", FBP];

// ── fakes ───────────────────────────────────────────────────────────────────
type ZohoMode = "ok" | "http-500" | "non-success" | "no-lead-id" | "empty-lead-id" | "not-json" | "auth-fail";
let zohoMode: ZohoMode = "ok";
let graphMode: "ok" | "http500" | "hang" = "ok";
const zohoCreates: Array<{ data: Array<Record<string, unknown>> }> = [];
const graphRequests: Array<{ url?: string; headers: http.IncomingHttpHeaders; body: any }> = [];

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => resolve(raw));
  });
}

const reply = (res: http.ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

const zoho = http.createServer(async (req, res) => {
  const raw = await readBody(req);
  if (req.url?.startsWith("/oauth/v2/token")) {
    if (zohoMode === "auth-fail") return reply(res, 401, { error: "invalid_client" });
    return reply(res, 200, { access_token: "FAKE-ZOHO-ACCESS" });
  }
  zohoCreates.push(JSON.parse(raw));
  switch (zohoMode) {
    case "http-500":
      return reply(res, 500, { data: [{ code: "SUCCESS", details: { id: LEAD_ID } }] });
    case "non-success":
      return reply(res, 202, { data: [{ code: "INVALID_DATA", details: { id: LEAD_ID } }] });
    case "no-lead-id":
      return reply(res, 201, { data: [{ code: "SUCCESS", details: {} }] });
    case "empty-lead-id":
      return reply(res, 201, { data: [{ code: "SUCCESS", details: { id: "  " } }] });
    case "not-json":
      res.writeHead(200);
      return res.end("<html>gateway</html>");
    default:
      return reply(res, 201, { data: [{ code: "SUCCESS", details: { id: LEAD_ID } }] });
  }
});

const graph = http.createServer(async (req, res) => {
  const raw = await readBody(req);
  graphRequests.push({ url: req.url, headers: req.headers, body: JSON.parse(raw || "null") });
  if (graphMode === "hang") return;
  if (graphMode === "http500") return reply(res, 500, { error: { message: `Unavailable ${TOKEN}`, code: 2 } });
  reply(res, 200, { events_received: 1, fbtrace_id: "FAKE-TRACE" });
});

let zohoUrl = "";
let graphUrl = "";
const listen = (s: http.Server) =>
  new Promise<string>((resolve) => s.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${(s.address() as AddressInfo).port}`)));

const ENV_SNAPSHOT = { ...process.env };
function setEnv(vars: Record<string, string | undefined>) {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("META_") || key.startsWith("ZOHO_") || key === "NEXT_PUBLIC_META_PIXEL_ID") delete process.env[key];
  }
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

const liveEnv = (over: Record<string, string | undefined> = {}) => ({
  NODE_ENV: "test",
  ZOHO_SUBMIT_ENABLED: "true",
  ZOHO_ALLOW_LOCAL_LIVE: "true",
  ZOHO_ACCOUNTS_URL: zohoUrl,
  ZOHO_API_DOMAIN: zohoUrl,
  ZOHO_CLIENT_ID: "fake",
  ZOHO_CLIENT_SECRET: "fake",
  ZOHO_REFRESH_TOKEN: "fake",
  ZOHO_MODULE: "Leads",
  META_TRACKING_ENABLED: "true",
  NEXT_PUBLIC_META_PIXEL_ID: LOCKED,
  META_ALLOW_LOCAL_TRACKING: "true",
  META_GRAPH_API_BASE: graphUrl,
  META_CAPI_DELIVERY: "LIVE",
  META_CAPI_ACCESS_TOKEN: TOKEN,
  META_EVENT_ID_SECRET: SECRET,
  ...over,
});

before(async () => {
  zohoUrl = await listen(zoho);
  graphUrl = await listen(graph);
});

after(() => {
  for (const key of Object.keys(process.env)) if (!(key in ENV_SNAPSHOT)) delete process.env[key];
  Object.assign(process.env, ENV_SNAPSHOT);
  zoho.closeAllConnections();
  graph.closeAllConnections();
  zoho.close();
  graph.close();
});

beforeEach(() => {
  zohoMode = "ok";
  graphMode = "ok";
  zohoCreates.length = 0;
  graphRequests.length = 0;
  setEnv(liveEnv());
});

// ── helpers ─────────────────────────────────────────────────────────────────
const enquiry = (over: Record<string, unknown> = {}) => ({
  formType: "enquiry",
  inquiryType: "service-information",
  name: "ZZ Meta Intake",
  organization: "ZZ Clinic",
  phone: PHONE,
  email: EMAIL,
  message: MESSAGE,
  consent: true,
  companyWebsite: "",
  serviceKey: "design-only",
  pageSource: "/discuss-a-case/",
  measurementConsent: "ALLOW",
  ...over,
});

const invitation = (over: Record<string, unknown> = {}) =>
  enquiry({ formType: "portal-interest", inquiryType: "general", message: "", serviceKey: undefined, pageSource: "/case-portal/", ...over });

const PORTAL_REFERER = "http://127.0.0.1:3001/case-portal/?utm_source=meta#request-invitation";

let ipSeq = 0;
function request(payload: unknown, opts: { referer?: string; cookie?: string; headers?: Record<string, string> } = {}) {
  return new Request("http://127.0.0.1:3001/api/enquiry/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "127.0.0.1:3001",
      referer: opts.referer ?? "http://127.0.0.1:3001/discuss-a-case/?service=design-only&utm_source=meta#form",
      "user-agent": UA,
      "x-forwarded-for": `${IP.slice(0, -2)}${(++ipSeq % 90) + 10}`,
      cookie: opts.cookie ?? COOKIES,
      ...opts.headers,
    },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

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

async function submit(payload: unknown, opts: Parameters<typeof request>[1] = {}) {
  const deferred: Array<() => Promise<unknown>> = [];
  const started = Date.now();
  const { result: res, lines } = await captureConsole(() =>
    handleEnquiry(request(payload, opts), { defer: (task) => void deferred.push(task) }),
  );
  const elapsedMs = Date.now() - started;
  const body = (await res.json()) as Record<string, unknown>;
  return { res, body, deferred, lines, elapsedMs };
}

const flush = (deferred: Array<() => Promise<unknown>>) => captureConsole(() => Promise.all(deferred.map((t) => t())));

/** Submit and run the deferred work; returns the Graph events that resulted. */
async function deliver(payload: unknown, opts: Parameters<typeof request>[1] = {}) {
  const r = await submit(payload, opts);
  const { lines } = await flush(r.deferred);
  return { ...r, deliveryLines: lines, events: graphRequests.flatMap((g) => g.body?.data ?? []) };
}

function assertNothingExposed(texts: string[]) {
  const all = texts.join("\n");
  for (const secret of NEVER_EXPOSED) assert.ok(!all.includes(secret), `exposed: ${secret}`);
}

const outcome = (lines: string[]) => lines.find((l) => l.includes("[meta:lead]")) ?? "";
const description = () => String(zohoCreates.at(-1)?.data[0].Description ?? "");

// ── tests ───────────────────────────────────────────────────────────────────
describe("consent", () => {
  test("ALLOW: exactly one server Lead", async () => {
    const r = await deliver(enquiry());
    assert.equal(r.res.status, 200);
    assert.equal(zohoCreates.length, 1);
    assert.equal(r.events.length, 1);
    assert.equal(r.events[0].event_name, "Lead");
  });

  for (const [state, reason] of [
    ["DENY", "consent-deny"],
    ["UNDECIDED", "consent-undecided"],
    [undefined, "consent-unknown"],
    ["allow", "consent-unknown"],
  ] as const) {
    test(`${state ?? "missing"}: CRM create succeeds, zero Meta, stale cookies untouched`, async () => {
      const r = await deliver(enquiry({ measurementConsent: state }));
      assert.equal(r.res.status, 200);
      assert.equal(zohoCreates.length, 1);
      assert.equal(graphRequests.length, 0);
      assert.equal(r.deferred.length, 0);
      assert.ok(outcome(r.lines).includes(`not_eligible:${reason}`), outcome(r.lines));
      assertNothingExposed(r.lines);
    });
  }
});

describe("the CAPI payload is the frozen one", () => {
  test("only the agreed fields, and no contact detail in any form", async () => {
    const r = await deliver(enquiry());
    const ev = r.events[0];
    assert.deepEqual(Object.keys(ev).sort(), ["action_source", "event_id", "event_name", "event_source_url", "event_time", "user_data"]);
    assert.deepEqual(ev.user_data, { fbp: FBP, fbc: FBC, client_user_agent: UA });
    assert.equal(ev.action_source, "website");
    assert.equal(ev.event_source_url, "http://127.0.0.1:3001/discuss-a-case/");
    const raw = JSON.stringify(graphRequests[0].body);
    for (const banned of ["em", "ph", "client_ip_address", "external_id", "custom_data", "test_event_code"]) {
      assert.ok(!raw.includes(`"${banned}"`), banned);
    }
    for (const value of [EMAIL, EMAIL.toLowerCase(), PHONE, "919876543210", MESSAGE, "ZZ Meta Intake", "ZZ Clinic", "198.51.100."]) {
      assert.ok(!raw.includes(value), value);
    }
    assert.ok(!REF_RE.test(raw), "website_ref must never reach Meta");
  });

  test("the token is sent only in the Authorization header", async () => {
    await deliver(enquiry());
    const g = graphRequests[0];
    assert.equal(g.url, `/v26.0/${LOCKED}/events`);
    assert.equal(g.headers.authorization, `Bearer ${TOKEN}`);
    assert.ok(!JSON.stringify(g.body).includes(TOKEN));
  });
});

describe("no valid _fbp or _fbc", () => {
  test("nothing is invented and nothing is sent; the outcome is explicit", async () => {
    for (const cookie of ["", "_fbp=nonsense; _fbc=nonsense"]) {
      const r = await deliver(enquiry(), { cookie });
      assert.equal(graphRequests.length, 0, cookie);
      assert.ok(outcome(r.lines).includes("not_sent:no_match_keys"), outcome(r.lines));
      assert.equal(r.res.status, 200);
    }
  });

  test("either key alone is enough", async () => {
    const r = await deliver(enquiry(), { cookie: `_fbp=${FBP}` });
    assert.deepEqual(r.events[0].user_data, { fbp: FBP, client_user_agent: UA });
  });
});

describe("identity", () => {
  test("website_ref goes to the Description, and to no response", async () => {
    const r = await deliver(enquiry());
    const match = description().match(REF_RE);
    assert.ok(match, description());
    assert.ok(!REF_RE.test(JSON.stringify(r.body)));
    assert.deepEqual(Object.keys(r.body).sort(), ["action", "message", "mode", "ok", "pipeline"]);
  });

  test("no event id ever reaches the browser", async () => {
    const r = await deliver(enquiry());
    const text = JSON.stringify(r.body);
    assert.ok(!text.includes("metaEventId") && !text.includes("i3dc_lead_"));
  });

  test("the event id is derived from that enquiry's reference", async () => {
    const r = await deliver(enquiry());
    const ref = description().match(REF_RE)![0];
    assert.equal(r.events[0].event_id, deriveMetaEventId(ref, SECRET));
    assert.ok(isMetaEventId(r.events[0].event_id));
  });

  test("each enquiry gets its own reference and its own id", async () => {
    await deliver(enquiry());
    await deliver(enquiry());
    const ids = graphRequests.map((g) => g.body.data[0].event_id);
    assert.equal(new Set(ids).size, 2);
    assert.notEqual(zohoCreates[0].data[0].Description, zohoCreates[1].data[0].Description);
  });

  test("the Lead ID and reference are recorded together, with no enquirer data", async () => {
    const r = await deliver(enquiry());
    const accepted = r.lines.find((l) => l.includes("[enquiry:ACCEPTED]")) ?? "";
    assert.ok(accepted.includes(LEAD_ID) && REF_RE.test(accepted), accepted);
    assertNothingExposed([...r.lines, ...r.deliveryLines, JSON.stringify(r.body)]);
  });

  test("the CRM record gains no new field", async () => {
    await deliver(enquiry());
    const fields = Object.keys(zohoCreates[0].data[0]);
    for (const banned of ["Website_Ref", "website_ref", "event_id", "Meta_Event_ID"]) assert.ok(!fields.includes(banned));
    assert.equal(zohoCreates[0].data[0].Automation_Test, false);
  });
});

describe("Zoho acceptance", () => {
  for (const mode of ["http-500", "non-success", "not-json", "auth-fail"] as const) {
    test(`${mode}: 503 fallback, zero Meta`, async () => {
      zohoMode = mode;
      const r = await deliver(enquiry());
      assert.equal(r.res.status, 503);
      assert.equal(r.body.action, "fallback");
      assert.equal(graphRequests.length, 0);
      assert.equal(r.deferred.length, 0);
    });
  }

  for (const mode of ["no-lead-id", "empty-lead-id"] as const) {
    test(`${mode}: the visitor is not told to resubmit, but it is not accepted`, async () => {
      zohoMode = mode;
      const r = await deliver(enquiry());
      assert.equal(r.res.status, 200);
      assert.equal(graphRequests.length, 0);
      assert.ok(r.lines.some((l) => l.includes("[enquiry:ACCEPTANCE-INCOMPLETE]")));
      assert.ok(outcome(r.lines).includes("not_eligible:not-accepted"), outcome(r.lines));
    });
  }

  test("dry-run is never accepted", async () => {
    setEnv(liveEnv({ ZOHO_SUBMIT_ENABLED: "false", ZOHO_ALLOW_LOCAL_LIVE: "false" }));
    const r = await deliver(enquiry());
    assert.equal(r.res.status, 200);
    assert.equal(r.body.mode, "dry-run");
    assert.equal(zohoCreates.length, 0);
    assert.equal(graphRequests.length, 0);
    assert.ok(!r.lines.some((l) => l.includes("[enquiry:ACCEPTED]")));
  });

  test("genuine SUCCESS + Lead ID is accepted", async () => {
    const r = await deliver(enquiry());
    assert.ok(r.lines.some((l) => l.includes("[enquiry:ACCEPTED]")));
    assert.equal(graphRequests.length, 1);
  });

  test("validation failure, honeypot and a malformed request: no create, zero Meta", async () => {
    for (const bad of [enquiry({ email: "" }), enquiry({ companyWebsite: "bot" }), "{not json"]) {
      const r = await deliver(bad);
      assert.ok(r.res.status === 422 || r.res.status === 400);
      assert.equal(zohoCreates.length, 0);
      assert.equal(graphRequests.length, 0);
    }
  });
});

describe("Case Portal invitation", () => {
  test("accepted invitation + ALLOW = one server Lead", async () => {
    const r = await deliver(invitation(), { referer: PORTAL_REFERER });
    assert.equal(r.res.status, 200);
    assert.equal(r.events.length, 1);
    assert.equal(r.events[0].event_source_url, "http://127.0.0.1:3001/case-portal/");
  });

  test("the CRM mapping for an invitation is unchanged", async () => {
    await deliver(invitation(), { referer: PORTAL_REFERER });
    const record = zohoCreates[0].data[0];
    assert.equal(record.Inquiry_Category, "Portal-Routed");
    assert.ok(!("Journey_Stage" in record));
    assert.ok(String(record.Description).startsWith("Portal launch interest"));
  });

  test("DENY or UNKNOWN: CRM create, zero Meta", async () => {
    for (const state of ["DENY", undefined]) {
      const r = await deliver(invitation({ measurementConsent: state }), { referer: PORTAL_REFERER });
      assert.equal(r.res.status, 200);
      assert.equal(graphRequests.length, 0, String(state));
    }
    assert.equal(zohoCreates.length, 2);
  });

  test("posted from another page: CRM create, zero Meta", async () => {
    await deliver(invitation());
    assert.equal(zohoCreates.length, 1);
    assert.equal(graphRequests.length, 0);
  });

  test("a rejected create: zero Meta", async () => {
    zohoMode = "non-success";
    await deliver(invitation(), { referer: PORTAL_REFERER });
    assert.equal(graphRequests.length, 0);
  });

  test("a spam-suspected invitation: CRM create, zero Meta", async () => {
    const r = await deliver(invitation({ email: "x@mailinator.com" }), { referer: PORTAL_REFERER });
    assert.equal(zohoCreates.length, 1);
    assert.equal(graphRequests.length, 0);
    assert.ok(outcome(r.lines).includes("not_eligible:spam-suspected"), outcome(r.lines));
  });
});

describe("synthetic submissions", () => {
  test("never delivered in LIVE mode, even with ALLOW", async () => {
    for (const email of ["qa@example.com", "doctor+test@clinic-sample.in"]) {
      const r = await deliver(enquiry({ email }));
      assert.equal(r.res.status, 200);
      assert.ok(outcome(r.lines).includes("not_eligible:synthetic"), outcome(r.lines));
    }
    assert.equal(zohoCreates.length, 2);
    assert.equal(graphRequests.length, 0);
    assert.ok(description().includes("Synthetic/test submission"));
  });

  test("the header classifies only with the server key", async () => {
    setEnv(liveEnv({ META_SYNTHETIC_KEY: "server-held-key" }));
    await deliver(enquiry(), { headers: { "x-i3dc-synthetic": "server-held-key" } });
    assert.equal(graphRequests.length, 0);
    await deliver(enquiry(), { headers: { "x-i3dc-synthetic": "guess" } });
    assert.equal(graphRequests.length, 1);
  });

  test("a client cannot classify itself from the request body", async () => {
    await deliver(enquiry({ synthetic: true, websiteRef: "i3dc_ref_00112233445566778899aabbccddeeff" }));
    assert.equal(graphRequests.length, 1);
    assert.ok(!description().includes("00112233445566778899aabbccddeeff"));
    assert.ok(!description().includes("Synthetic/test submission"));
  });

  test("Test Events mode may carry a synthetic submission, marked as a Test Event", async () => {
    setEnv(liveEnv({ META_CAPI_DELIVERY: "TEST_EVENTS", META_TEST_EVENT_CODE: "TEST12345" }));
    const r = await deliver(enquiry({ email: "qa@example.com" }));
    assert.equal(graphRequests.length, 1);
    assert.equal(graphRequests[0].body.test_event_code, "TEST12345");
    assert.ok(r.deliveryLines.some((l) => l.startsWith("warn: [meta:TEST-EVENTS]")));
  });
});

describe("delivery is off until chosen", () => {
  test("delivery unset: CRM create succeeds, nothing is scheduled", async () => {
    setEnv(liveEnv({ META_CAPI_DELIVERY: undefined }));
    const r = await deliver(enquiry());
    assert.equal(r.res.status, 200);
    assert.equal(zohoCreates.length, 1);
    assert.equal(graphRequests.length, 0);
    assert.ok(outcome(r.lines).includes("not_sent:capi_inactive"), outcome(r.lines));
  });

  test("tracking off: inert, with the same response shape", async () => {
    setEnv(liveEnv({ META_TRACKING_ENABLED: undefined }));
    const r = await deliver(enquiry());
    assert.deepEqual(Object.keys(r.body).sort(), ["action", "message", "mode", "ok", "pipeline"]);
    assert.equal(graphRequests.length, 0);
    assert.equal(outcome(r.lines), "");
  });
});

describe("Meta can never break or delay the CRM enquiry", () => {
  test("a failed send leaves the response unchanged, is classified, and is not retried", async () => {
    graphMode = "http500";
    const r = await submit(enquiry());
    assert.equal(r.res.status, 200);
    assert.equal(r.body.ok, true);
    const { lines } = await flush(r.deferred);
    assert.equal(graphRequests.length, 1);
    assert.ok(lines.some((l) => l.startsWith("error: [meta:CAPI-FAILED]")));
    assertNothingExposed(lines);
  });

  test("the response does not wait for Meta", async () => {
    graphMode = "hang";
    const r = await submit(enquiry());
    assert.equal(r.res.status, 200);
    assert.equal(graphRequests.length, 0, "delivery is deferred until after the response");
    assert.ok(r.elapsedMs < 2000, `${r.elapsedMs}ms`);
    r.deferred.length = 0;
  });

  test("broken Meta preparation cannot turn a CRM success into an error", async () => {
    const r = await captureConsole(() =>
      handleEnquiry(request(enquiry()), {
        defer: () => {
          throw new Error("scheduler exploded");
        },
      }),
    );
    assert.equal(r.result.status, 200);
    assert.ok(r.lines.some((l) => l.includes("not_scheduled")));
  });
});

describe("attribution reaches the CRM", () => {
  test("UTMs and fbclid in their fields; ad identifiers in the Description", async () => {
    await deliver(
      enquiry({
        utm: { source: "facebook", medium: "paid_social", campaign: "c", content: "ad", term: "t" },
        attribution: { fbclid: "IwAR-x", utmId: "u1", campaignId: "c1", adsetId: "s1", adId: "a1" },
      }),
    );
    const record = zohoCreates[0].data[0];
    assert.equal(record.UTM_Source, "facebook");
    assert.equal(record.UTM_Term, "t");
    assert.equal(record.Meta_FBCLID, "IwAR-x");
    for (const line of ["UTM id: u1", "Campaign id: c1", "Ad set id: s1", "Ad id: a1"]) {
      assert.ok(String(record.Description).includes(line), line);
    }
    for (const invented of ["Campaign_ID", "Adset_ID", "Ad_ID", "UTM_ID", "Meta_Campaign_ID"]) assert.ok(!(invented in record), invented);
  });

  test("the measurement choice is recorded for review", async () => {
    await deliver(enquiry({ measurementConsent: "DENY" }));
    assert.ok(description().includes("Measurement consent: DENY"));
  });
});
