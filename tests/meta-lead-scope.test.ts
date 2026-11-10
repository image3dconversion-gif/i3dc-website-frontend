/**
 * The Meta Lead decision: acceptance, scope, consent, synthetic and spam rules.
 * Everything here is a pure decision; the full pipeline is in meta-intake.test.ts.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../src/lib/enquiry/validate.ts";
import type { NormalisedEnquiry } from "../src/lib/enquiry/types.ts";
import type { SubmitResult } from "../src/lib/zoho/client.ts";
import { decideMetaLead, hasMatchKeys, isAcceptedCreate, isCasePortalPath, leadFacts, metaLeadScope } from "../src/lib/meta/lead.ts";

const PORTAL_URL = "https://image3dconversion.com/case-portal/";
const DISCUSS_URL = "https://image3dconversion.com/discuss-a-case/";
const ACCEPTED: SubmitResult = { mode: "live", ok: true, id: "6607227000011189002" };
const FBP = "fb.1.1596403881668.1116446470";
const FBC = "fb.1.1757000000000.IwAR-cookie_click";

function enquiry(over: Record<string, unknown> = {}): NormalisedEnquiry {
  const r = validateEnquiry(
    {
      formType: "enquiry",
      inquiryType: "service-information",
      name: "Asha Rao",
      email: "doctor@clinic-sample.in",
      message: "We would like planning support for an upcoming procedure.",
      consent: true,
      pageSource: "/discuss-a-case/",
      professional_role: "dentist",
      organisation_type: "clinic",
      country: "IN",
      measurementConsent: "ALLOW",
      ...over,
    },
    "2026-11-02T10:00:00.000Z",
  );
  assert.ok(r.ok && r.value, JSON.stringify(r.errors));
  return r.value;
}

const invitation = (over: Record<string, unknown> = {}) =>
  enquiry({ formType: "portal-interest", message: "", pageSource: "/case-portal/", ...over });

const decide = (e: NormalisedEnquiry, over: Partial<Parameters<typeof decideMetaLead>[0]> = {}) =>
  decideMetaLead({ enquiry: e, sourceUrl: DISCUSS_URL, submit: ACCEPTED, synthetic: false, testEvents: false, ...over });

describe("Zoho acceptance", () => {
  test("a live create with SUCCESS and a Lead ID is accepted", () => {
    assert.equal(isAcceptedCreate(ACCEPTED), true);
  });

  test("everything else is not", () => {
    const refused: SubmitResult[] = [
      { mode: "dry-run", ok: true },
      { mode: "dry-run", ok: true, id: "leftover" },
      { mode: "live", ok: false, stage: "create", category: "http_500" },
      { mode: "live", ok: false, stage: "create", category: "INVALID_DATA", id: "6607" },
      { mode: "live", ok: true },
      { mode: "live", ok: true, id: "" },
      { mode: "live", ok: true, id: "   " },
    ];
    for (const s of refused) assert.equal(isAcceptedCreate(s), false, JSON.stringify(s));
  });
});

describe("Case Portal invitation", () => {
  test("a genuine accepted invitation under ALLOW is eligible", () => {
    assert.deepEqual(decide(invitation(), { sourceUrl: PORTAL_URL }), { eligible: true });
  });

  test("DENY, UNDECIDED and UNKNOWN are not", () => {
    assert.deepEqual(decide(invitation({ measurementConsent: "DENY" }), { sourceUrl: PORTAL_URL }), { eligible: false, reason: "consent-deny" });
    assert.deepEqual(decide(invitation({ measurementConsent: "UNDECIDED" }), { sourceUrl: PORTAL_URL }), { eligible: false, reason: "consent-undecided" });
    assert.deepEqual(decide(invitation({ measurementConsent: undefined }), { sourceUrl: PORTAL_URL }), { eligible: false, reason: "consent-unknown" });
    assert.deepEqual(decide(invitation({ measurementConsent: "yes" }), { sourceUrl: PORTAL_URL }), { eligible: false, reason: "consent-unknown" });
  });

  test("not accepted, synthetic or spam-suspected are not", () => {
    assert.deepEqual(decide(invitation(), { sourceUrl: PORTAL_URL, submit: { mode: "dry-run", ok: true } }), { eligible: false, reason: "not-accepted" });
    assert.deepEqual(decide(invitation(), { sourceUrl: PORTAL_URL, synthetic: true }), { eligible: false, reason: "synthetic" });
    const spam = invitation({ email: "x@mailinator.com" });
    assert.ok(spam.spamIndicators.length > 0);
    assert.deepEqual(decide(spam, { sourceUrl: PORTAL_URL }), { eligible: false, reason: "spam-suspected" });
  });

  test("the invitation form must really have come from /case-portal/", () => {
    assert.equal(metaLeadScope(invitation(), DISCUSS_URL), "portal-interest-off-page");
    assert.equal(metaLeadScope(invitation({ pageSource: "/faq/" }), PORTAL_URL), "portal-interest-off-page");
  });

  test("the standard form sent from /case-portal/ stays excluded", () => {
    assert.equal(metaLeadScope(enquiry({ pageSource: "/case-portal/" }), DISCUSS_URL), "case-portal-page");
    assert.equal(metaLeadScope(enquiry(), PORTAL_URL), "case-portal-page");
  });

  test("the path check ignores query, hash and case", () => {
    assert.equal(isCasePortalPath("/case-portal/?utm_source=x#request-invitation"), true);
    assert.equal(isCasePortalPath("/CASE-PORTAL"), true);
    assert.equal(isCasePortalPath("/case-portal-other/"), false);
  });
});

describe("standard enquiries keep the new-business scope", () => {
  test("a new service enquiry under ALLOW is eligible", () => {
    assert.deepEqual(decide(enquiry()), { eligible: true });
  });

  test("existing customers, partners and portal help are excluded", () => {
    assert.equal(metaLeadScope(enquiry({ existingCustomer: true }), DISCUSS_URL), "existing-customer");
    assert.equal(metaLeadScope(enquiry({ inquiryType: "existing-customer-support" }), DISCUSS_URL), "existing-customer");
    assert.equal(metaLeadScope(enquiry({ serviceKey: "partnership" }), DISCUSS_URL), "partnership-collaboration");
    assert.equal(metaLeadScope(enquiry({ inquiryType: "collaboration" }), DISCUSS_URL), "partnership-collaboration");
    assert.equal(metaLeadScope(enquiry({ inquiryType: "portal-help" }), DISCUSS_URL), "portal-support");
  });
});

describe("synthetic submissions", () => {
  test("never eligible for live delivery, whatever else is true", () => {
    assert.deepEqual(decide(enquiry(), { synthetic: true, testEvents: false }), { eligible: false, reason: "synthetic" });
  });

  test("may go only when delivery is in Test Events mode", () => {
    assert.deepEqual(decide(enquiry(), { synthetic: true, testEvents: true }), { eligible: true });
  });
});

describe("_fbp / _fbc are used only under ALLOW", () => {
  const req = (cookie?: string) =>
    new Request("https://image3dconversion.com/api/enquiry/", {
      method: "POST",
      headers: { "user-agent": "UA", ...(cookie ? { cookie } : {}) },
    });
  const facts = (e: NormalisedEnquiry, cookie?: string) =>
    leadFacts({ eventId: "i3dc_lead_x", enquiry: e, req: req(cookie), now: new Date("2026-11-02T10:00:00Z"), sourceUrl: DISCUSS_URL });
  const stale = `_fbp=${FBP}; _fbc=${FBC}`;

  test("ALLOW forwards well-formed cookies", () => {
    const f = facts(enquiry(), stale);
    assert.equal(f.fbp, FBP);
    assert.equal(f.fbc, FBC);
    assert.equal(hasMatchKeys(f), true);
  });

  test("cookies left from an earlier ALLOW are ignored in every other state", () => {
    for (const state of ["DENY", "UNDECIDED", undefined, "junk"]) {
      const f = facts(
        enquiry({
          measurementConsent: state,
          attribution: { fbclid: "IwAR-click", lastTouchIso: "2026-11-02T09:00:00.000Z" },
        }),
        stale,
      );
      assert.equal(f.fbp, undefined, String(state));
      assert.equal(f.fbc, undefined, String(state));
      assert.equal(hasMatchKeys(f), false);
    }
  });

  test("malformed cookies are dropped, and no match data is invented", () => {
    const f = facts(enquiry(), "_fbp=nonsense; _fbc=also-nonsense");
    assert.equal(hasMatchKeys(f), false);
    assert.equal(hasMatchKeys(facts(enquiry())), false);
  });

  test("the fbclid fallback runs under ALLOW only", () => {
    const f = facts(enquiry({ attribution: { fbclid: "IwAR-click", lastTouchIso: "2026-11-02T09:00:00.000Z" } }));
    assert.equal(f.fbc, `fb.1.${Date.parse("2026-11-02T09:00:00.000Z")}.IwAR-click`);
  });

  test("the facts have no field for contact details or an IP", () => {
    const keys = Object.keys(facts(enquiry({ phone: "98765 43210" }), stale)).sort();
    assert.deepEqual(keys, ["eventId", "eventSourceUrl", "eventTimeSec", "fbc", "fbp", "userAgent"]);
  });
});
