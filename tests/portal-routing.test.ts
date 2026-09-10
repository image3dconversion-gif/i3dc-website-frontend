/**
 * Portal routing: which enquiries belong in the Case Portal rather than here.
 *
 * WHY THIS EXISTS: `PORTAL_TOPIC_RE` used to match the bare word "case". The
 * page is called "Discuss a Case" and asks the visitor to describe their case,
 * so virtually every genuine service enquiry was flagged Portal-Routed and
 * stamped "Portal Guidance Needed" — a live lead did exactly that. It also
 * matched "guide design", "production" and "delivery", which are services
 * I3DC sells.
 *
 * The rule these tests enforce: route on COMMERCIAL and CASE-STATUS intent,
 * never on vocabulary a normal service enquiry naturally uses.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry, mentionsPortalTopic } from "../src/lib/enquiry/validate.ts";
import { toZohoLead } from "../src/lib/zoho/mapping.ts";
import type { NormalisedEnquiry } from "../src/lib/enquiry/types.ts";

const AT = "2026-09-10T10:00:00.000Z";

const base = (over: Record<string, unknown> = {}) => ({
  inquiryType: "service-information",
  name: "Dr Test Person",
  organization: "Test Clinic",
  phone: "9876543210",
  email: "test@example.com",
  message: "A short generic question about your digital workflow.",
  consent: true,
  companyWebsite: "",
  pageSource: "/discuss-a-case/",
  ...over,
});

function lead(over: Record<string, unknown> = {}) {
  const r = validateEnquiry(base(over), AT);
  assert.ok(r.ok && r.value, `invalid payload: ${JSON.stringify(r.errors)}`);
  return toZohoLead(r.value as NormalisedEnquiry);
}

describe("normal service enquiries are NOT portal-routed", () => {
  const everydayWording = [
    ["the word 'case'", "I have a case coming up and want guided implant planning support."],
    ["plural 'cases'", "We handle several cases a month and want help planning them."],
    ["'guide design'", "Can you help with guide design for a full-arch situation?"],
    ["'production'", "What is your turnaround for production once the design is approved?"],
    ["'delivery'", "How does delivery work for practices outside India?"],
    ["all of them at once", "For this case, who handles guide design, production and delivery?"],
  ];

  for (const [label, message] of everydayWording) {
    test(`${label} stays a service enquiry`, () => {
      const record = lead({ message });
      assert.equal(record.Inquiry_Category, "Service-Info", `mis-routed: ${message}`);
      assert.equal(record.Journey_Stage, "New Website Inquiry");
      assert.equal(mentionsPortalTopic(message), false);
    });
  }

  test("service intent still lands alongside", () => {
    const record = lead({
      serviceKey: "guided-implant-planning",
      message: "I have a case coming up and want guided implant planning support.",
    });
    assert.equal(record.Service_Interest, "Guided Implant Planning");
    assert.equal(record.Inquiry_Category, "Service-Info");
    assert.equal(record.Journey_Stage, "New Website Inquiry");
  });
});

describe("genuine portal / commercial / status intent still routes", () => {
  const portalWording = [
    ["price", "What is the price for a surgical guide?"],
    ["pricing", "Could you share your pricing?"],
    ["cost", "How much does this cost per arch?"],
    ["quote", "Please send a quote."],
    ["quotation", "I would like a quotation for two arches."],
    ["quotation request", "This is a quotation request for an upcoming treatment."],
    ["case status", "Where is my case status right now?"],
    ["order status", "Can you check the order status?"],
    ["treatment plan", "Please review the treatment plan I submitted."],
    ["surgery plan", "I need the surgery plan updated."],
    ["implant system", "Which implant system do you support?"],
    ["implant brand", "Does it matter which implant brand I use?"],
  ];

  for (const [label, message] of portalWording) {
    test(`${label} → Portal-Routed`, () => {
      const record = lead({ message });
      assert.equal(mentionsPortalTopic(message), true, `should route: ${message}`);
      assert.equal(record.Inquiry_Category, "Portal-Routed");
      assert.equal(record.Journey_Stage, "Portal Guidance Needed");
    });
  }

  test("the advisory line stays in the Description where designed", () => {
    assert.match(
      lead({ message: "What is the price for a surgical guide?" }).Description,
      /Mentions a Case Portal topic/,
    );
  });

  test("a clean service enquiry carries no advisory line", () => {
    assert.ok(!/Mentions a Case Portal topic/.test(lead().Description));
  });
});

describe("routing signals other than message text are unchanged", () => {
  test("existingCustomer = true still routes to the portal", () => {
    const record = lead({ existingCustomer: true, message: "Just a quick workflow question." });
    assert.equal(record.Inquiry_Category, "Portal-Routed");
    assert.equal(record.Journey_Stage, "Portal Guidance Needed");
  });

  test("portal-owned enquiry types still route", () => {
    for (const type of ["portal-help", "existing-customer-support"]) {
      const record = lead({ inquiryType: type, message: "A neutral question." });
      assert.equal(record.Inquiry_Category, "Portal-Routed", type);
      assert.equal(record.Journey_Stage, "Portal Guidance Needed", type);
    }
  });
});

describe("isolation of the other two contracts is preserved", () => {
  test("portal launch interest is unaffected", () => {
    const record = lead({ formType: "portal-interest", pageSource: "/case-portal/", message: "" });
    assert.equal(record.Inquiry_Type, "General Enquiry");
    assert.equal(record.Inquiry_Category, "Portal-Routed");
    assert.equal(record.Page_Submitted_From, "/case-portal/");
    const r = record as unknown as Record<string, unknown>;
    assert.ok(!("Journey_Stage" in r), "portal interest must still omit Journey_Stage");
    assert.ok(record.Description.startsWith("Portal launch interest — pre-launch notification request"));
  });

  test("partnership still classifies as Collaboration", () => {
    assert.equal(lead({ serviceKey: "partnership" }).Inquiry_Category, "Collaboration");
  });

  test("partnership keeps Collaboration even with a genuine portal topic", () => {
    const record = lead({ serviceKey: "partnership", message: "What is the price for a partnership?" });
    assert.equal(record.Inquiry_Category, "Collaboration");
  });

  test("partnership does not overwrite a more specific enquiry type", () => {
    const record = lead({ serviceKey: "partnership", inquiryType: "lab-vendor" });
    assert.equal(record.Inquiry_Type, "Lab / Vendor Inquiry");
    assert.equal(record.Inquiry_Category, "Collaboration");
  });
});
