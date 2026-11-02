/**
 * The measurement-consent states: what is stored, what the server accepts, and
 * that anything unreadable falls to UNKNOWN rather than to a permission.
 */
import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  MEASUREMENT_CONSENT_VERSION,
  normaliseConsent,
  parseStoredConsent,
  readMeasurementConsent,
  serialiseConsent,
  setMeasurementConsent,
} from "../src/lib/meta/consent.ts";

const AT = "2026-11-02T10:00:00.000Z";

describe("what the server accepts", () => {
  test("the three explicit states pass through exactly", () => {
    for (const s of ["ALLOW", "DENY", "UNDECIDED"]) assert.equal(normaliseConsent(s), s);
  });

  test("anything else is UNKNOWN, never a permission", () => {
    for (const junk of [undefined, null, "", "allow", "Allow", " ALLOW", "true", true, 1, {}, ["ALLOW"]]) {
      assert.equal(normaliseConsent(junk), "UNKNOWN", JSON.stringify(junk));
    }
  });
});

describe("what is stored", () => {
  test("no record yet is UNDECIDED: nothing is preselected", () => {
    assert.equal(parseStoredConsent(null), "UNDECIDED");
    assert.equal(parseStoredConsent(undefined), "UNDECIDED");
  });

  test("a stored answer round-trips", () => {
    assert.equal(parseStoredConsent(serialiseConsent("ALLOW", AT)), "ALLOW");
    assert.equal(parseStoredConsent(serialiseConsent("DENY", AT)), "DENY");
  });

  test("damaged, foreign or stale records are UNKNOWN", () => {
    const old = JSON.stringify({ state: "ALLOW", version: "1999-01-01.v0", at: AT });
    const odd = JSON.stringify({ state: "MAYBE", version: MEASUREMENT_CONSENT_VERSION });
    for (const raw of ["", "not json", "null", "[]", "{}", old, odd]) {
      assert.equal(parseStoredConsent(raw), "UNKNOWN", raw);
    }
  });
});

describe("the browser layer", () => {
  const g = globalThis as unknown as { window?: unknown; document?: unknown };
  afterEach(() => {
    delete g.window;
    delete g.document;
  });

  function fakeBrowser(storage: Partial<Storage>) {
    const cookies: string[] = [];
    g.window = {
      localStorage: storage,
      location: { hostname: "image3dconversion.com" },
      dispatchEvent: () => true,
    };
    g.document = {
      set cookie(value: string) {
        cookies.push(value);
      },
    };
    return cookies;
  }

  test("outside a browser the state is UNKNOWN", () => {
    assert.equal(readMeasurementConsent(), "UNKNOWN");
  });

  test("unreadable storage is UNKNOWN", () => {
    fakeBrowser({
      getItem: () => {
        throw new Error("blocked");
      },
    });
    assert.equal(readMeasurementConsent(), "UNKNOWN");
  });

  test("DENY expires the Pixel's cookies; ALLOW does not", () => {
    const values = new Map<string, string>();
    const cookies = fakeBrowser({
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => void values.set(k, v),
    });
    setMeasurementConsent("ALLOW");
    assert.equal(readMeasurementConsent(), "ALLOW");
    assert.equal(cookies.length, 0);
    setMeasurementConsent("DENY");
    assert.equal(readMeasurementConsent(), "DENY");
    for (const name of ["_fbp", "_fbc"]) {
      assert.ok(cookies.some((c) => c.startsWith(`${name}=;`) && c.includes("Max-Age=0") && c.includes("Domain=.image3dconversion.com")), name);
    }
  });
});
