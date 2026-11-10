import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../src/lib/enquiry/validate";
import { COUNTRY_CODES, normalizeCountry, ORGANISATION_TYPES as org, PROFESSIONAL_ROLES as role } from "../src/lib/enquiry/qualification-intake";
import { toZohoLead } from "../src/lib/zoho/mapping";
import { qualifyPortalLead } from "../src/lib/zoho/portal-qualification";

const evidence = {
  phaseOneIntake: true,
  validity: "genuine",
  identity: "resolved",
  role: role.dentist,
  organisation: org.clinic,
  country: "IN",
} as const;

for (const [name, changes, expected] of [
  ["Dentist + Clinic", {}, "Qualified"],
  ["Specialist + Hospital", { role: role.specialist, organisation: org.hospital }, "Qualified"],
  ["OMFS + Clinic", { role: role.omfs }, "Qualified"],
  ...Object.entries(org).filter(([key]) => key !== "clinic" && key !== "hospital")
    .map(([key, organisation]) => [key, { organisation }, "Needs Review"] as const),
  ...Object.entries(role).slice(3).map(([key, label]) => [key, { role: label }, "Needs Review"] as const),
  ["missing role", { role: undefined }, "Needs Review"],
  ["missing organisation", { organisation: undefined }, "Needs Review"],
  ["missing country", { country: undefined }, "Needs Review"],
  ["invalid country", { country: "ZZ" }, "Needs Review"],
  ["unresolved duplicate", { identity: "conflict" }, "Needs Review"],
  ["duplicate check pending", { identity: "pending" }, "Needs Review"],
  ["contradiction", { conflictingEvidence: true }, "Needs Review"],
  ["unknown authenticity", { validity: "unknown" }, "Needs Review"],
  ["trusted test", { validity: "test" }, "Not Eligible"],
  ["confirmed spam/fake", { validity: "confirmed-invalid" }, "Not Eligible"],
  ["historical Lead", { phaseOneIntake: false, role: undefined, country: undefined }, undefined],
] as const) {
  test(name, () => assert.equal(qualifyPortalLead({ ...evidence, ...changes }), expected));
}

const payload = {
  name: "Example Dentist", email: "test@example.invalid", organization: "Example Clinic",
  inquiryType: "general", message: "I would like information.", consent: true,
  pageSource: "/discuss-a-case/", professional_role: "dentist", organisation_type: "clinic", country: " in ",
  consentWhatsAppOperational: true, consentEmailMarketing: false, consentWhatsAppMarketing: true,
  utm: { campaign: "campaign" }, attribution: { fbclid: "example-click" },
  serviceKey: "guided-implant-planning", existingCustomer: true,
};

function validate(changes: Record<string, unknown> = {}) {
  return validateEnquiry({ ...payload, ...changes }, "2026-11-10T10:00:00Z");
}

test("intake maps validated labels and ISO-2, preserves provenance and permissions, and starts Pending", () => {
  const result = validate({ Portal_Qualification_Status: "Qualified", Automation_Test: true });
  assert.ok(result.value);
  const record = toZohoLead(result.value);
  assert.equal(record.Designation, role.dentist);
  assert.equal(record.Industry, org.clinic);
  assert.equal(record.Country, "IN");
  assert.equal(record.Portal_Qualification_Status, "Pending");
  assert.equal(record.Automation_Test, false);
  assert.equal(record.Consent, true);
  assert.equal(record.Consent_WA_Operational, true);
  assert.equal(record.Consent_Email_Marketing, false);
  assert.equal(record.Consent_WA_Marketing, true);
  assert.equal(record.Existing_Customer, true);
  assert.equal(record.UTM_Campaign, "campaign");
  assert.equal(record.Meta_FBCLID, "example-click");
  assert.equal(record.Service_Interest, "Guided Implant Planning");
  for (const key of ["Portal_Invitation_Status", "Portal_User_ID", "Portal_Practice_ID", "Email_Opt_Out", "Nurture_Suppressed"]) {
    assert.equal(Object.hasOwn(record, key), false);
  }
});

for (const [field, value] of [
  ["professional_role", "constructor"], ["organisation_type", "toString"], ["country", "UK"],
  ["professional_role", undefined], ["organisation_type", undefined], ["country", undefined],
] as const) {
  test("rejects invalid or missing " + field + " (" + value + ")", () => {
    const result = validate({ [field]: value });
    assert.equal(result.ok, false);
    assert.ok(result.errors[field]);
    assert.equal(result.value, undefined);
  });
}

test("Portal request keeps its original mapping and ignores injected qualification intake", () => {
  const result = validate({ formType: "portal-interest", pageSource: "/case-portal/" });
  assert.ok(result.value);
  const record = toZohoLead(result.value);
  assert.equal(Object.hasOwn(record, "Portal_Qualification_Status"), false);
  assert.equal(Object.hasOwn(record, "Designation"), false);
});

test("country selector data contains 249 distinct assigned ISO-2 codes", () => {
  assert.equal(new Set(COUNTRY_CODES).size, 249);
  assert.equal(normalizeCountry("gb"), "GB");
  assert.equal(normalizeCountry("XK"), undefined);
  assert.equal(normalizeCountry("India"), undefined);
});
