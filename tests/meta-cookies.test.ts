/**
 * `_fbp` / `_fbc` handling.
 *
 * The rule: forward what the Pixel issued, exactly; drop anything malformed;
 * never invent a value. The documented server-side `fbc` construction is
 * enabled (controller amendment) strictly as a fallback: only when a complete,
 * non-truncated fbclid and its first-touch timestamp are both available.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  CONSTRUCT_FBC_FROM_FBCLID,
  constructFbc,
  readCookie,
  resolveFbc,
  validFbc,
  validFbp,
} from "../src/lib/meta/cookies.ts";

const FBP = "fb.1.1596403881668.1116446470";
const FBC = "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"; // Meta's documented example
const OBSERVED = "2026-09-11T10:00:00.000Z";
const OBSERVED_MS = 1789120800000;

describe("reading cookies from the request", () => {
  const header = `theme=light; _fbp=${FBP}; _fbc=${FBC}; x_fbp=decoy`;

  test("reads each cookie by exact name", () => {
    assert.equal(readCookie(header, "_fbp"), FBP);
    assert.equal(readCookie(header, "_fbc"), FBC);
  });

  test("a similarly named cookie is not mistaken for _fbp", () => {
    assert.equal(readCookie("x_fbp=decoy", "_fbp"), undefined);
  });

  test("missing, empty and absent headers yield nothing", () => {
    assert.equal(readCookie("theme=light", "_fbp"), undefined);
    assert.equal(readCookie("_fbp=", "_fbp"), undefined);
    assert.equal(readCookie(null, "_fbp"), undefined);
    assert.equal(readCookie(undefined, "_fbp"), undefined);
    assert.equal(readCookie("", "_fbp"), undefined);
  });

  test("the first occurrence wins", () => {
    assert.equal(readCookie(`_fbp=${FBP}; _fbp=fb.1.1596403881668.999`, "_fbp"), FBP);
  });
});

describe("_fbp is forwarded only when well-formed", () => {
  test("accepts the documented shape, any subdomain index, and a trailing appendix", () => {
    for (const ok of [FBP, "fb.0.1596403881668.1116446470", "fb.2.1596403881668.1116446470", `${FBP}.AQ`]) {
      assert.equal(validFbp(ok), ok, ok);
    }
  });

  test("rejects anything malformed rather than repairing it", () => {
    for (const bad of [
      undefined,
      "",
      "fb.1.abc.1116446470",
      "fb..1596403881668.1116446470",
      "xx.1.1596403881668.1116446470",
      "fb.1.1596403881668.",
      "fb.1.1596403881668.1116446470<script>",
      "fb.1.1596403881668.11164 46470",
      `fb.1.1596403881668.${"1".repeat(1200)}`,
    ]) {
      assert.equal(validFbp(bad), undefined, JSON.stringify(bad)?.slice(0, 60));
    }
  });
});

describe("_fbc is forwarded only when well-formed, and never altered", () => {
  test("accepts Pixel-issued values, preserving the click id's case", () => {
    const live = "fb.1.1757000000000.IwAR2F4-dbP0l7Mn1IawQQGCINEz7PYXQvwjNwB_qa2ofrHyiLjcbCRxTDMgk";
    assert.equal(validFbc(FBC), FBC);
    assert.equal(validFbc(live), live);
  });

  test("rejects malformed values", () => {
    for (const bad of [
      undefined,
      "",
      "fb.1.1757000000000.",
      "fb.1.notatime.IwAR",
      "fb.1.1757000000000.Iw AR",
      "fb.1.1757000000000.IwAR\";alert(1)",
      "IwAR2F4-dbP0l7Mn1IawQQ",
      `fb.1.1757000000000.${"a".repeat(2000)}`,
    ]) {
      assert.equal(validFbc(bad), undefined, JSON.stringify(bad)?.slice(0, 60));
    }
  });
});

describe("fbclid without _fbc: the documented construction, enabled as a safe fallback", () => {
  /** Server clock at the enquiry: ten minutes after the click was first observed. */
  const NOW = OBSERVED_MS + 10 * 60_000;
  const DAY = 24 * 60 * 60_000;

  test("enabled by the controller amendment", () => {
    assert.equal(CONSTRUCT_FBC_FROM_FBCLID, true);
  });

  test("complete fbclid + first-touch timestamp → fb.1.{first-touch ms}.{fbclid}", () => {
    // fb.{subdomainIndex=1}.{first-observed ms}.{fbclid as received}
    assert.equal(constructFbc("IwAR-Test_1", OBSERVED, NOW), `fb.1.${OBSERVED_MS}.IwAR-Test_1`);
    assert.equal(
      resolveFbc({ fbclid: "IwAR-Test_1", fbclidObservedAtIso: OBSERVED }, { nowMs: NOW }),
      `fb.1.${OBSERVED_MS}.IwAR-Test_1`,
    );
  });

  test("the Pixel's own well-formed cookie always wins", () => {
    assert.equal(resolveFbc({ cookie: FBC, fbclid: "IwAR-other", fbclidObservedAtIso: OBSERVED }, { nowMs: NOW }), FBC);
  });

  test("a malformed cookie is never repaired — the construction is built from the captured fbclid instead", () => {
    const fbc = resolveFbc({ cookie: "fb.1.garbage", fbclid: "IwAR-test_1", fbclidObservedAtIso: OBSERVED }, { nowMs: NOW });
    assert.equal(fbc, `fb.1.${OBSERVED_MS}.IwAR-test_1`);
    assert.equal(resolveFbc({ cookie: "fb.1.garbage" }, { nowMs: NOW }), undefined, "and with no fbclid: nothing");
  });

  test("it remains a single switch", () => {
    assert.equal(resolveFbc({ fbclid: "IwAR-test_1", fbclidObservedAtIso: OBSERVED }, { allowConstruction: false, nowMs: NOW }), undefined);
  });

  test("the click id is never case-folded or otherwise modified", () => {
    assert.ok((constructFbc("IwARmixedCASE", OBSERVED, NOW) ?? "").endsWith(".IwARmixedCASE"));
  });

  test("an incomplete or possibly truncated click id → no fbc", () => {
    assert.equal(constructFbc(undefined, OBSERVED, NOW), undefined, "no click id");
    assert.equal(constructFbc("", OBSERVED, NOW), undefined, "empty click id");
    assert.equal(constructFbc("IwAR.test", OBSERVED, NOW), undefined, "unexpected character");
    assert.equal(constructFbc("Iw AR", OBSERVED, NOW), undefined, "whitespace");
    assert.equal(constructFbc("a".repeat(160), OBSERVED, NOW), undefined, "at the storage cap — may be truncated");
    assert.ok(constructFbc("a".repeat(159), OBSERVED, NOW), "provably under the cap");
  });

  test("no usable first-touch timestamp → no fbc", () => {
    assert.equal(constructFbc("IwAR-test", undefined, NOW), undefined, "missing");
    assert.equal(constructFbc("IwAR-test", "yesterday", NOW), undefined, "unparseable");
    assert.equal(constructFbc("IwAR-test", new Date(NOW + 1).toISOString(), NOW), undefined, "in the future of the server clock");
    assert.equal(constructFbc("IwAR-test", new Date(NOW - 91 * DAY).toISOString(), NOW), undefined, "older than the _fbc cookie lifetime");
    assert.ok(constructFbc("IwAR-test", new Date(NOW - 89 * DAY).toISOString(), NOW), "within the cookie lifetime");
    assert.ok(constructFbc("IwAR-test", new Date(NOW).toISOString(), NOW), "observed at the enquiry itself");
  });
});
