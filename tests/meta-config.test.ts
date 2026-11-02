/**
 * The enable gate: delivery defaults OFF, one dataset, Test Events separated from
 * Production, and secrets that cannot leak through a config object.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { format } from "node:util";
import { resolveBrowserPixelId, resolveMetaTracking, SecretValue } from "../src/lib/meta/config.ts";
import { metaBuildProblems } from "../src/lib/meta/build-gate.ts";

const LOCKED = "1788653802312623";
const TOKEN = "FAKE-TEST-TOKEN-not-a-real-credential-0123456789";
const SECRET = "fake-i3dc-event-id-secret-0123456789abcdef";
const SINK = "http://127.0.0.1:4373";

const on = (over: Record<string, string | undefined> = {}) => ({
  NODE_ENV: "production",
  META_TRACKING_ENABLED: "true",
  NEXT_PUBLIC_META_PIXEL_ID: LOCKED,
  ...over,
});
const live = (over: Record<string, string | undefined> = {}) =>
  on({ VERCEL_ENV: "production", META_CAPI_DELIVERY: "LIVE", META_CAPI_ACCESS_TOKEN: TOKEN, META_EVENT_ID_SECRET: SECRET, ...over });
const uat = (over: Record<string, string | undefined> = {}) =>
  on({ VERCEL_ENV: "preview", META_CAPI_DELIVERY: "TEST_EVENTS", META_TEST_EVENT_CODE: "TEST12345", META_CAPI_ACCESS_TOKEN: TOKEN, META_EVENT_ID_SECRET: SECRET, ...over });

describe("Meta delivery defaults OFF", () => {
  test("nothing configured: no Pixel, no CAPI", () => {
    const r = resolveMetaTracking({ NODE_ENV: "production", VERCEL_ENV: "production" });
    assert.equal(r.pixelId, null);
    assert.equal(r.capi, null);
  });

  test("only the literal `true` opens the master switch", () => {
    for (const v of ["TRUE", "1", "yes", "", undefined]) {
      assert.equal(resolveBrowserPixelId(on({ META_TRACKING_ENABLED: v })), null, String(v));
    }
  });

  test("tracking on with a token still sends nothing until delivery is chosen", () => {
    const r = resolveMetaTracking(on({ VERCEL_ENV: "production", META_CAPI_ACCESS_TOKEN: TOKEN, META_EVENT_ID_SECRET: SECRET }));
    assert.equal(r.pixelId, LOCKED);
    assert.equal(r.capi, null);
    assert.deepEqual(r.notes, ["capi-delivery-off"]);
  });

  test("an unrecognised delivery mode is off", () => {
    const r = resolveMetaTracking(live({ META_CAPI_DELIVERY: "on" }));
    assert.equal(r.capi, null);
    assert.deepEqual(r.notes, ["capi-delivery-unrecognised"]);
  });
});

describe("one locked dataset", () => {
  test("any other Pixel id keeps everything off", () => {
    for (const id of ["950428851390424", "", "123"]) {
      const r = resolveMetaTracking(live({ NEXT_PUBLIC_META_PIXEL_ID: id }));
      assert.equal(r.pixelId, null, id);
      assert.equal(r.capi, null, id);
    }
  });

  test("CAPI posts to that dataset on the Graph API", () => {
    assert.equal(resolveMetaTracking(live()).capi?.endpoint, `https://graph.facebook.com/v26.0/${LOCKED}/events`);
  });

  test("a production build cannot be pointed at another host", () => {
    const r = resolveMetaTracking(live({ META_GRAPH_API_BASE: "https://evil.example" }));
    assert.ok(r.capi?.endpoint.startsWith("https://graph.facebook.com/"));
    assert.ok(r.notes.includes("graph-base-override-ignored-in-production"));
  });
});

describe("Test Events are separate from Production", () => {
  test("a Test Events code on Production fails closed: no Pixel, no CAPI", () => {
    for (const mode of ["LIVE", "TEST_EVENTS", "OFF", undefined]) {
      const r = resolveMetaTracking(live({ META_CAPI_DELIVERY: mode, META_TEST_EVENT_CODE: "TEST12345" }));
      assert.equal(r.pixelId, null, String(mode));
      assert.equal(r.capi, null, String(mode));
      assert.deepEqual(r.notes, ["test-event-code-forbidden-in-production"]);
    }
  });

  test("the browser half fails closed too", () => {
    assert.equal(resolveBrowserPixelId(live({ META_TEST_EVENT_CODE: "TEST12345" })), null);
  });

  test("the Production build itself refuses the code, naming the variable only", () => {
    const problems = metaBuildProblems({ VERCEL_ENV: "production", META_TEST_EVENT_CODE: "TEST12345" });
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes("META_TEST_EVENT_CODE") && !problems[0].includes("TEST12345"));
    assert.deepEqual(metaBuildProblems({ VERCEL_ENV: "preview", META_TEST_EVENT_CODE: "TEST12345" }), []);
    assert.deepEqual(metaBuildProblems({ VERCEL_ENV: "production" }), []);
    assert.deepEqual(metaBuildProblems({ VERCEL_ENV: "production", META_TEST_EVENT_CODE: "  " }), []);
  });

  test("Preview may run Test Events, carrying the code", () => {
    const c = resolveMetaTracking(uat()).capi;
    assert.equal(c?.mode, "TEST_EVENTS");
    assert.equal(c?.testEventCode, "TEST12345");
  });

  test("Test Events need a valid code", () => {
    for (const code of [undefined, "", "bad code!"]) {
      const r = resolveMetaTracking(uat({ META_TEST_EVENT_CODE: code }));
      assert.equal(r.capi, null, String(code));
      assert.deepEqual(r.notes, ["capi-test-events-need-valid-code"]);
    }
  });

  test("LIVE is refused anywhere but Production, and with any code present", () => {
    assert.deepEqual(resolveMetaTracking(live({ VERCEL_ENV: "preview" })).notes, ["capi-live-refused-outside-production"]);
    assert.deepEqual(resolveMetaTracking(live({ VERCEL_ENV: undefined })).notes, ["capi-live-refused-outside-production"]);
    assert.deepEqual(resolveMetaTracking(live({ VERCEL_ENV: "preview", META_TEST_EVENT_CODE: "TEST12345" })).notes, ["capi-live-refused-test-code-present"]);
  });

  test("Test Events are refused on an unrecognised deployment", () => {
    assert.deepEqual(resolveMetaTracking(uat({ VERCEL_ENV: undefined })).notes, ["capi-test-events-refused-outside-preview"]);
  });

  test("LIVE on Production carries no code", () => {
    const c = resolveMetaTracking(live()).capi;
    assert.equal(c?.mode, "LIVE");
    assert.ok(!("testEventCode" in (c ?? {})));
  });
});

describe("secrets", () => {
  test("delivery needs the token and a strong event id secret", () => {
    assert.deepEqual(resolveMetaTracking(live({ META_CAPI_ACCESS_TOKEN: undefined })).notes, ["capi-no-access-token"]);
    assert.deepEqual(resolveMetaTracking(live({ META_EVENT_ID_SECRET: undefined })).notes, ["capi-no-event-id-secret"]);
    assert.deepEqual(resolveMetaTracking(live({ META_EVENT_ID_SECRET: "short" })).notes, ["capi-no-event-id-secret"]);
  });

  test("no serialisation of the config exposes either secret", () => {
    const r = resolveMetaTracking(live());
    for (const text of [JSON.stringify(r), format("%O", r), String(r.capi?.accessToken), String(r.capi?.eventIdSecret)]) {
      assert.ok(!text.includes(TOKEN) && !text.includes(SECRET), text.slice(0, 80));
    }
    assert.equal(r.capi?.accessToken.reveal(), TOKEN);
    assert.ok(new SecretValue("x") instanceof SecretValue);
  });
});

describe("a local dev server never reaches Meta", () => {
  const dev = (over: Record<string, string | undefined> = {}) =>
    on({ NODE_ENV: "development", META_ALLOW_LOCAL_TRACKING: "true", META_CAPI_DELIVERY: "LIVE", META_CAPI_ACCESS_TOKEN: TOKEN, META_EVENT_ID_SECRET: SECRET, ...over });

  test("no Pixel without the local flag", () => {
    assert.equal(resolveBrowserPixelId(dev({ META_ALLOW_LOCAL_TRACKING: undefined })), null);
  });

  test("CAPI goes to a loopback sink or nowhere", () => {
    assert.equal(resolveMetaTracking(dev({ META_GRAPH_API_BASE: `${SINK}/x` })).capi?.endpoint, `${SINK}/v26.0/${LOCKED}/events`);
    for (const base of [undefined, "https://graph.facebook.com", "https://evil.example", "file:///x"]) {
      assert.equal(resolveMetaTracking(dev({ META_GRAPH_API_BASE: base })).capi, null, String(base));
    }
  });
});
