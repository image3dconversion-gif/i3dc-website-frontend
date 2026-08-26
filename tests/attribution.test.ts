/**
 * Attribution capture and malformed-input handling.
 *
 * Attribution is advisory: it must never be able to reject a genuine enquiry,
 * and it must never let the client dictate a governance value.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../src/lib/enquiry/validate.ts";
import { SOURCE_WEBSITE } from "../src/lib/enquiry/types.ts";

const AT = "2026-08-26T10:00:00.000Z";

const base = (over: Record<string, unknown> = {}) => ({
  inquiryType: "general",
  name: "Dr Test Person",
  email: "test@example.com",
  message: "A short generic question about your digital workflow.",
  consent: true,
  companyWebsite: "",
  ...over,
});

function ok(payload: Record<string, unknown>) {
  const r = validateEnquiry(payload, AT);
  assert.ok(r.ok && r.value, `expected valid, got ${JSON.stringify(r.errors)}`);
  return r.value;
}

describe("campaign attribution", () => {
  test("captures all five UTM parameters including term", () => {
    const v = ok(
      base({
        utm: {
          source: "google",
          medium: "cpc",
          campaign: "guided-implants",
          content: "ad-a",
          term: "surgical guide india",
        },
      }),
    );
    assert.deepEqual(v.utm, {
      source: "google",
      medium: "cpc",
      campaign: "guided-implants",
      content: "ad-a",
      term: "surgical guide india",
    });
  });

  test("captures gclid, referrer and both touch timestamps", () => {
    const v = ok(
      base({
        attribution: {
          gclid: "Cj0KCQtest123",
          referrer: "https://www.google.com/",
          firstTouchIso: "2026-08-01T09:00:00.000Z",
          lastTouchIso: "2026-08-26T09:55:00.000Z",
        },
      }),
    );
    assert.equal(v.attribution.gclid, "Cj0KCQtest123");
    assert.equal(v.attribution.referrer, "https://www.google.com/");
    assert.equal(v.attribution.firstTouchIso, "2026-08-01T09:00:00.000Z");
    assert.equal(v.attribution.lastTouchIso, "2026-08-26T09:55:00.000Z");
  });

  test("source website is server-fixed and not client-overridable", () => {
    const v = ok(base({ attribution: { sourceWebsite: "https://evil.example" } }));
    assert.equal(v.attribution.sourceWebsite, SOURCE_WEBSITE);
  });
});

describe("malformed attribution degrades quietly", () => {
  test("missing attribution block still yields the fixed source website", () => {
    const v = ok(base());
    assert.equal(v.attribution.sourceWebsite, SOURCE_WEBSITE);
    assert.equal(v.attribution.referrer, undefined);
  });

  test("unparseable timestamps are dropped, not stored as Invalid Date", () => {
    const v = ok(base({ attribution: { firstTouchIso: "yesterday", lastTouchIso: "" } }));
    assert.equal(v.attribution.firstTouchIso, undefined);
    assert.equal(v.attribution.lastTouchIso, undefined);
  });

  test("non-object attribution does not throw", () => {
    for (const junk of [null, "string", 42, []]) {
      const v = ok(base({ attribution: junk }));
      assert.equal(v.attribution.sourceWebsite, SOURCE_WEBSITE);
    }
  });

  test("over-long values are trimmed to the Zoho field limit", () => {
    const v = ok(base({ attribution: { referrer: "https://x.example/" + "a".repeat(500) } }));
    assert.ok((v.attribution.referrer ?? "").length <= 255);
  });

  test("non-object utm does not throw", () => {
    const v = ok(base({ utm: "not-an-object" }));
    assert.equal(v.utm, undefined);
  });
});

describe("malformed enquiry inputs are rejected cleanly", () => {
  const cases: Array<[string, Record<string, unknown>, string]> = [
    ["invalid email", base({ email: "nope" }), "email"],
    ["missing email", base({ email: "" }), "email"],
    ["missing name", base({ name: "   " }), "name"],
    ["missing message", base({ message: "" }), "message"],
    ["unknown inquiry type", base({ inquiryType: "not-a-type" }), "inquiryType"],
    ["consent withheld", base({ consent: false }), "consent"],
  ];
  for (const [label, payload, field] of cases) {
    test(`${label} → 422-shaped error on ${field}`, () => {
      const r = validateEnquiry(payload, AT);
      assert.equal(r.ok, false);
      assert.ok(r.errors[field], `expected an error on ${field}, got ${JSON.stringify(r.errors)}`);
      assert.equal(r.value, undefined);
    });
  }

  test("honeypot submissions are rejected generically", () => {
    const r = validateEnquiry(base({ companyWebsite: "bot" }), AT);
    assert.equal(r.ok, false);
    assert.ok(r.errors.form);
  });

  test("completely absent payload does not throw", () => {
    for (const junk of [undefined, null, "", 0, []]) {
      const r = validateEnquiry(junk, AT);
      assert.equal(r.ok, false);
    }
  });

  test("over-long message is truncated, not rejected", () => {
    const v = ok(base({ message: "workflow ".repeat(2000) }));
    assert.ok(v.message.length <= 4000);
  });
});
