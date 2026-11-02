/**
 * Browser Pixel behaviour, exercised against a fake window.
 *
 * The rules: the I3DC dataset only; Automatic Events and advanced matching off;
 * exactly one PageView per distinct URL; a revoked Pixel sends nothing; and the
 * client has no way to report a Lead at all. The consent gate that decides when
 * install() may run is proven in real Chrome by tests/browser/meta-tracking.mjs.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import * as pixelModule from "../src/lib/meta/pixel.ts";
import { FBEVENTS_SRC, createPixelClient, pageKey, type PixelHost } from "../src/lib/meta/pixel.ts";

const LOCKED = "1788653802312623";
const LEGACY_SGE_PIXEL = "950428851390424";

function harness() {
  const win: PixelHost = {};
  const scripts: string[] = [];
  const client = createPixelClient({ win, insertScript: (src) => void scripts.push(src) });
  const calls = () => (win.fbq?.queue ?? []).map((args) => [...args]);
  return { win, scripts, client, calls };
}

describe("no Pixel until something explicitly installs it", () => {
  test("a fresh client has loaded nothing and tracks nothing", () => {
    const { win, scripts, client } = harness();
    assert.equal(client.pageView("/"), false);
    client.revoke();
    assert.equal(win.fbq, undefined);
    assert.deepEqual(scripts, []);
  });
});

describe("one dataset", () => {
  test("only the I3DC dataset can be installed", () => {
    for (const id of [LEGACY_SGE_PIXEL, "", "123", `${LOCKED}0`]) {
      const { win, scripts, client } = harness();
      assert.equal(client.install(id), false, id);
      assert.equal(win.fbq, undefined);
      assert.deepEqual(scripts, []);
    }
  });

  test("installing loads fbevents.js once, however often it is called", () => {
    const { scripts, client, calls } = harness();
    assert.equal(client.install(LOCKED), true);
    assert.equal(client.install(LOCKED), true);
    assert.deepEqual(scripts, [FBEVENTS_SRC]);
    assert.equal(calls().filter((c) => c[0] === "init").length, 1);
  });
});

describe("autoConfig and advanced matching", () => {
  test("autoConfig=false is set before init, and init carries the id only", () => {
    const { client, calls } = harness();
    client.install(LOCKED);
    assert.deepEqual(calls(), [
      ["set", "autoConfig", false, LOCKED],
      ["init", LOCKED],
    ]);
  });
});

describe("PageView", () => {
  test("one per distinct URL; a repeat is ignored", () => {
    const { client, calls } = harness();
    client.install(LOCKED);
    assert.equal(client.pageView("/a/"), true);
    assert.equal(client.pageView("/a/"), false);
    assert.equal(client.pageView("/b/"), true);
    assert.equal(calls().filter((c) => c[0] === "track" && c[1] === "PageView").length, 2);
  });

  test("the key is path plus query, never the hash", () => {
    assert.equal(pageKey("/x/", ""), "/x/");
    assert.equal(pageKey("/x/", "a=1"), "/x/?a=1");
  });
});

describe("withdrawing consent", () => {
  test("a revoked Pixel tells Meta to stop, and tracks nothing further", () => {
    const { client, calls } = harness();
    client.install(LOCKED);
    client.pageView("/a/");
    client.revoke();
    client.revoke();
    assert.equal(calls().filter((c) => c[0] === "consent" && c[1] === "revoke").length, 1);
    assert.equal(client.pageView("/b/"), false);
    assert.equal(calls().filter((c) => c[1] === "PageView").length, 1);
  });

  test("a later ALLOW grants again without a second load or init", () => {
    const { scripts, client, calls } = harness();
    client.install(LOCKED);
    client.revoke();
    client.install(LOCKED);
    assert.equal(calls().filter((c) => c[0] === "consent" && c[1] === "grant").length, 1);
    assert.equal(client.pageView("/b/"), true);
    assert.equal(scripts.length, 1);
    assert.equal(calls().filter((c) => c[0] === "init").length, 1);
  });
});

describe("BROWSER_LEAD = OFF", () => {
  test("the client exposes no way to send a Lead", () => {
    const { client } = harness();
    assert.deepEqual(Object.keys(client).sort(), ["install", "pageView", "revoke"]);
    for (const gone of ["trackLead", "leadEventIdFrom"]) assert.ok(!(gone in pixelModule), gone);
  });

  test("a full visit produces PageView and nothing else", () => {
    const { client, calls } = harness();
    client.install(LOCKED);
    client.pageView("/case-portal/");
    client.pageView("/discuss-a-case/");
    const tracked = calls().filter((c) => c[0] === "track" || c[0] === "trackCustom" || c[0] === "trackSingle");
    assert.ok(tracked.every((c) => c[0] === "track" && c[1] === "PageView"), JSON.stringify(tracked));
  });
});
