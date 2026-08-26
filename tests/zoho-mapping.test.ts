/**
 * Zoho CRM V2 mapping safety.
 *
 * Production submission is LIVE, so a bad field name or an off-picklist value is
 * not a cosmetic problem — it can make the CRM reject the record, which the site
 * surfaces as a 503 and a lost lead. The allowlists below are transcribed from
 * the live Leads module metadata; if the CRM schema changes, update them here
 * deliberately rather than letting the mapping drift.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../src/lib/enquiry/validate.ts";
import { toZohoLead } from "../src/lib/zoho/mapping.ts";
import {
  CONSENT_SOURCE,
  CONSENT_WORDING_VERSION,
  INQUIRY_TYPES,
  type NormalisedEnquiry,
} from "../src/lib/enquiry/types.ts";

const AT = "2026-08-26T10:00:00.000Z";

/** Every field API name that exists on the live Leads module and that we may write. */
const ALLOWED_FIELDS = new Set([
  "Last_Name", "First_Name", "Email", "Mobile", "Clinic_Practice_Name",
  "Lead_Source", "Description", "Lead_Status", "Business_Unit", "Inquiry_Type",
  "Journey_Stage", "Inquiry_Category", "Existing_Customer", "Page_Submitted_From",
  "Consent", "UTM_Source", "UTM_Medium", "UTM_Campaign", "UTM_Content", "UTM_Term",
  "Ad_GCLID", "Journey_Engine_Version", "V2_Journey_Stage", "Automation_Test",
  "Consent_WA_Operational", "Consent_Email_Marketing", "Consent_WA_Marketing",
  "Consent_Captured_At", "Consent_Source", "Consent_Wording_Version",
  "V2_Email_Normalized", "V2_Phone_Normalized",
  "Service_Interest", "Workflow_Interest", "Layout",
]);

/** Live picklist values, transcribed from the Leads module metadata. */
const PICKLISTS: Record<string, string[]> = {
  Inquiry_Type: ["Discuss a Case", "Service Inquiry", "White-Label Inquiry", "Lab / Vendor Inquiry", "General Enquiry"],
  Inquiry_Category: ["Generic", "Service-Info", "Collaboration", "Portal-Routed"],
  Journey_Stage: [
    "New Website Inquiry", "Portal Guidance Needed", "Inquiry Classified", "Information Shared",
    "Portal Invitation Shared", "Collab / Partner Review", "Nurture / Follow-up",
    "Converted-Portal/Partner", "Closed - Generic Resolved", "Closed - Not Relevant",
  ],
  Business_Unit: ["Image3DConversion"],
  Lead_Status: [
    "Attempted to Contact", "Contact in Future", "Contacted", "Junk Lead", "Lost Lead",
    "Not Contacted", "Pre-Qualified", "Not Qualified", "Cancelled / Refunded", "Program Active",
    "Preparation", "No Show", "Completed", "Interested / In Discussion", "Payment Pending",
    "Future Prospect", "Alumni", "Registered", "Fake Leads",
  ],
  Lead_Source: ["Website - Image 3D Conversion"],
  Journey_Engine_Version: ["LEGACY", "V2"],
  V2_Journey_Stage: [
    "New Enquiry", "Engaged", "Qualified", "Programme Selected", "Suitability Review",
    "Payment Pending", "Registered", "Onboarding", "Attended / Completed", "Alumni",
    "Case Discussion", "Data Awaited", "Quotation / Decision", "Active Customer",
    "Delivered", "Repeat Customer", "Nurture", "Lost", "Details Delivered", "Acknowledged",
  ],
  Service_Interest: [
    "CBCT / Radiology Report", "Guided Implant Planning", "Surgical Guide",
    "Full-Arch/Stackable Guide", "Smile Design", "Digital Design Service",
    "3D Printing / Production", "Other",
  ],
  Workflow_Interest: [
    "Single Implant", "Multiple Implants", "Full-Arch", "Zygoma / Pterygoid",
    "Immediate Loading", "Prosthetic Planning", "Guide Design", "Not Sure",
  ],
};

const base = (over: Record<string, unknown> = {}) => ({
  inquiryType: "general",
  name: "Dr Test Person",
  organization: "Test Clinic",
  phone: "9876543210",
  email: "  Dr.Test+CRM@Example.COM ",
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

describe("the record only contains fields that exist in the CRM", () => {
  test("no unknown field API names are emitted", () => {
    const record = lead({
      consentEmailMarketing: true,
      utm: { source: "google", medium: "cpc", campaign: "c", content: "x", term: "t" },
      attribution: { gclid: "abc", referrer: "https://g.example/" },
    });
    const unknown = Object.keys(record).filter((k) => !ALLOWED_FIELDS.has(k));
    assert.deepEqual(unknown, [], `unknown Zoho fields would break the create call: ${unknown.join(", ")}`);
  });

  test("every picklist value sent is a real option", () => {
    for (const type of INQUIRY_TYPES) {
      const record = lead({ inquiryType: type }) as unknown as Record<string, string>;
      for (const [field, allowed] of Object.entries(PICKLISTS)) {
        const value = record[field];
        if (value === undefined) continue;
        assert.ok(allowed.includes(value), `${field}="${value}" is not on the ${field} picklist (inquiryType=${type})`);
      }
    }
  });

  test("collaboration folds onto General Enquiry but keeps its intent", () => {
    const record = lead({ inquiryType: "collaboration" });
    assert.equal(record.Inquiry_Type, "General Enquiry");
    assert.notEqual(record.Inquiry_Type, "White-Label Inquiry");
    assert.equal(record.Inquiry_Category, "Collaboration", "intent must survive in the category");
    assert.match(record.Description, /Enquiry type: Collaboration Inquiry/);
  });

  test("Inquiry_Type is mapped for ALL six website intents", () => {
    // Regression guard: four website labels have no matching picklist value and
    // must be folded onto one that exists.
    for (const type of INQUIRY_TYPES) {
      const record = lead({ inquiryType: type });
      assert.ok(
        PICKLISTS.Inquiry_Type.includes(record.Inquiry_Type as string),
        `inquiryType=${type} produced an off-picklist Inquiry_Type`,
      );
    }
  });
});

describe("purpose separation", () => {
  test("never writes education-business-unit or location fields", () => {
    const record = lead() as unknown as Record<string, unknown>;
    for (const forbidden of [
      "Location", "Workshop_City", "Workshop_Location", "Venue", "PI_Venue",
      "Program_Type", "Program_Batch", "Programme_Instance", "Form_Type",
    ]) {
      assert.equal(record[forbidden], undefined, `${forbidden} belongs to the education BU`);
    }
  });

  test("never writes CRM-owned control fields", () => {
    const record = lead() as unknown as Record<string, unknown>;
    // Duplicate_Status is set by "V2 SYS - Duplicate Classification";
    // Automation_Exception gates the acknowledgement rule;
    // Acquisition_Channel is classified by the existing "AC – …" rules.
    for (const owned of ["Duplicate_Status", "Automation_Exception", "Automation_Exception_Note", "Acquisition_Channel"]) {
      assert.equal(record[owned], undefined, `${owned} is owned by CRM automation, not the website`);
    }
  });

  test("marks the lead as V2 from creation", () => {
    const record = lead();
    assert.equal(record.Journey_Engine_Version, "V2");
    assert.equal(record.V2_Journey_Stage, "New Enquiry");
    assert.equal(record.Automation_Test, false);
  });
});

describe("consent reaches the CRM as three independent flags", () => {
  test("nothing ticked → all three false, legacy Consent still true", () => {
    const record = lead();
    assert.equal(record.Consent_WA_Operational, false);
    assert.equal(record.Consent_Email_Marketing, false);
    assert.equal(record.Consent_WA_Marketing, false);
    assert.equal(record.Consent, true, "legacy processing consent is preserved for compatibility");
  });

  test("one ticked → only that flag is true", () => {
    const record = lead({ consentWhatsAppMarketing: true });
    assert.equal(record.Consent_WA_Marketing, true);
    assert.equal(record.Consent_Email_Marketing, false);
    assert.equal(record.Consent_WA_Operational, false);
  });

  test("captured-at is a Zoho-safe datetime", () => {
    const record = lead();
    assert.match(record.Consent_Captured_At as string, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/);
  });

  test("source and wording version are stored in their own fields", () => {
    const record = lead();
    assert.equal(record.Consent_Source, CONSENT_SOURCE);
    assert.equal(record.Consent_Wording_Version, CONSENT_WORDING_VERSION);
    assert.ok(
      !(record.Consent_Source as string).includes("@"),
      "the version must no longer be smuggled into the source value",
    );
    assert.ok((record.Consent_Wording_Version as string).length <= 120, "Zoho field limit");
  });
});

describe("identifiers: raw preserved, normalised added", () => {
  test("raw email and phone are untouched", () => {
    const record = lead();
    assert.equal(record.Email, "Dr.Test+CRM@Example.COM", "the typed address must survive");
    assert.equal(record.Mobile, "9876543210");
  });

  test("normalised keys are populated for the duplicate classifier", () => {
    const record = lead();
    assert.equal(record.V2_Email_Normalized, "dr.test+crm@example.com");
    assert.equal(record.V2_Phone_Normalized, "+919876543210");
  });

  test("an unnormalisable phone leaves the key empty but keeps the raw value", () => {
    const record = lead({ phone: "12345" });
    assert.equal(record.V2_Phone_Normalized, undefined);
    assert.equal(record.Mobile, "12345");
  });

  test("international numbers are not re-coded to +91", () => {
    const record = lead({ phone: "+1 415 555 2671" });
    assert.equal(record.V2_Phone_Normalized, "+14155552671");
  });
});

describe("attribution reaches the CRM", () => {
  test("UTM term and GCLID are mapped to their own fields", () => {
    const record = lead({
      utm: { source: "google", medium: "cpc", campaign: "guided", content: "a", term: "surgical guide" },
      attribution: { gclid: "Cj0KCQtest" },
    });
    assert.equal(record.UTM_Source, "google");
    assert.equal(record.UTM_Term, "surgical guide");
    assert.equal(record.Ad_GCLID, "Cj0KCQtest");
  });

  test("referrer and touch timestamps survive in the Description", () => {
    const record = lead({
      attribution: {
        referrer: "https://www.google.com/",
        firstTouchIso: "2026-08-01T09:00:00.000Z",
        lastTouchIso: "2026-08-26T09:55:00.000Z",
      },
    });
    assert.match(record.Description, /Referrer: https:\/\/www\.google\.com\//);
    assert.match(record.Description, /First touch: 2026-08-01T09:00:00\.000Z/);
    assert.match(record.Description, /Last touch: 2026-08-26T09:55:00\.000Z/);
  });
});

describe("derived intent, without any city value", () => {
  const expectations: Array<[string, string | undefined, string | undefined]> = [
    ["/full-arch-stackable-workflow/", "Full-Arch/Stackable Guide", "Full-Arch"],
    ["/zygoma-pterygoid-planning/", "Guided Implant Planning", "Zygoma / Pterygoid"],
    ["/immediate-loading-workflow/", "Guided Implant Planning", "Immediate Loading"],
    ["/design-only-workflow/", "Digital Design Service", "Guide Design"],
    ["/guided-implant-workflow/", "Guided Implant Planning", undefined],
    ["/discuss-a-case/", undefined, undefined],
    ["/faq/", undefined, undefined],
  ];
  for (const [page, service, workflow] of expectations) {
    test(`${page} → ${service ?? "no service"} / ${workflow ?? "no workflow"}`, () => {
      const record = lead({ pageSource: page });
      assert.equal(record.Service_Interest, service);
      assert.equal(record.Workflow_Interest, workflow);
    });
  }
});

describe("spam indicators are retained but never block", () => {
  test("a spammy-looking enquiry still produces a valid lead", () => {
    const record = lead({
      email: "someone@mailinator.com",
      message: "GREAT OFFER!!! visit https://spam.example and https://spam2.example NOWWWWWWWWWW",
    });
    assert.ok(record.Email, "the enquiry must still be delivered");
    assert.match(record.Description, /Review signals \(advisory, did NOT block\)/);
    assert.match(record.Description, /disposable-email-domain/);
    assert.match(record.Description, /links:2/);
  });

  test("a clean enquiry carries no review-signal line", () => {
    const record = lead();
    assert.ok(!/Review signals/.test(record.Description));
  });
});
