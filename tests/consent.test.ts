/**
 * Consent independence.
 *
 * The governing rule: the required processing consent grants permission to
 * HANDLE the enquiry and nothing else. Each of the three channel permissions
 * must be earned by its own ticked box. Any test here failing means the site is
 * claiming a marketing permission the person did not give.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../src/lib/enquiry/validate.ts";
import { CONSENT_SOURCE, CONSENT_WORDING_VERSION } from "../src/lib/enquiry/types.ts";

const AT = "2026-08-26T10:00:00.000Z";

const base = (over: Record<string, unknown> = {}) => ({
  inquiryType: "general",
  name: "Dr Test Person",
  organization: "Test Clinic",
  phone: "9876543210",
  email: "test@example.com",
  message: "A short generic question about your digital workflow.",
  existingCustomer: false,
  consent: true,
  companyWebsite: "",
  pageSource: "/discuss-a-case/",
  ...over,
});

function ok(payload: Record<string, unknown>) {
  const r = validateEnquiry(payload, AT);
  assert.ok(r.ok && r.value, `expected valid, got ${JSON.stringify(r.errors)}`);
  return r.value;
}

describe("marketing permission is never inherited", () => {
  test("processing consent alone grants NO marketing permission", () => {
    const v = ok(base());
    assert.equal(v.consentSelections.processing, true);
    assert.equal(v.consentSelections.operationalWhatsApp, false);
    assert.equal(v.consentSelections.emailMarketing, false);
    assert.equal(v.consentSelections.whatsAppMarketing, false);
  });

  test("absent keys are refusals, not defaults", () => {
    const payload = base();
    delete (payload as Record<string, unknown>).consentEmailMarketing;
    const v = ok(payload);
    assert.equal(v.consentSelections.emailMarketing, false);
  });

  test("only truthy-but-not-true values are rejected as opt-ins", () => {
    for (const sneaky of ["on", "true", 1, "yes", {}, []]) {
      const v = ok(base({ consentEmailMarketing: sneaky }));
      assert.equal(v.consentSelections.emailMarketing, false, `${JSON.stringify(sneaky)} must not count`);
    }
  });
});

describe("each permission is independent", () => {
  const channels = [
    ["consentWhatsAppOperational", "operationalWhatsApp"],
    ["consentEmailMarketing", "emailMarketing"],
    ["consentWhatsAppMarketing", "whatsAppMarketing"],
  ] as const;

  for (const [field, key] of channels) {
    test(`ticking ${field} grants only ${key}`, () => {
      const v = ok(base({ [field]: true }));
      assert.equal(v.consentSelections[key], true);
      for (const [, other] of channels) {
        if (other === key) continue;
        assert.equal(v.consentSelections[other], false, `${other} must remain refused`);
      }
    });
  }

  test("all three can be granted together", () => {
    const v = ok(
      base({
        consentWhatsAppOperational: true,
        consentEmailMarketing: true,
        consentWhatsAppMarketing: true,
      }),
    );
    assert.deepEqual(v.consentSelections, {
      processing: true,
      operationalWhatsApp: true,
      emailMarketing: true,
      whatsAppMarketing: true,
    });
  });

  test("marketing opt-ins do not substitute for the required processing consent", () => {
    const r = validateEnquiry(base({ consent: false, consentEmailMarketing: true }), AT);
    assert.equal(r.ok, false);
    assert.ok(r.errors.consent, "processing consent must still be required");
  });
});

describe("consent provenance is auditable and server-controlled", () => {
  test("records source and wording version as separate values", () => {
    const v = ok(base());
    assert.equal(v.consentSource, CONSENT_SOURCE);
    assert.equal(v.consentWordingVersion, CONSENT_WORDING_VERSION);
  });

  test("timestamp comes from the server clock, not the client", () => {
    const v = ok(base({ consentCapturedAtIso: "1999-01-01T00:00:00.000Z" }));
    assert.equal(v.consentCapturedAtIso, AT, "a client-supplied timestamp must be ignored");
  });

  test("source and version cannot be overridden by the client", () => {
    const v = ok(base({ consentSource: "attacker-supplied", consentWordingVersion: "9.9" }));
    assert.equal(v.consentSource, CONSENT_SOURCE);
    assert.equal(v.consentWordingVersion, CONSENT_WORDING_VERSION);
  });
});
