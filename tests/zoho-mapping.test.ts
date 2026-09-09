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
  "Ad_GCLID", "Meta_FBCLID", "Automation_Test",
  "Consent_WA_Operational", "Consent_Email_Marketing", "Consent_WA_Marketing",
  "Consent_Captured_At", "Consent_Source", "Consent_Wording_Version",
  "Service_Interest", "Workflow_Interest", "Layout",
]);

/**
 * Fields the CRM owns. The website must never send these — writing
 * Journey_Engine_Version in particular would stop the live
 * "V2 ING - I3DC Website Ingress" rule firing, because it only runs while that
 * field is EMPTY.
 */
const CRM_OWNED_FIELDS = [
  "Journey_Engine_Version",
  "V2_Journey_Stage",
  "V2_Email_Normalized",
  "V2_Phone_Normalized",
  "Active_Nurture_Journey",
  "Nurture_Suppressed",
  "Duplicate_Status",
  "Automation_Exception",
];

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

  test("NEVER writes the four CRM-owned V2 fields, for any form or intent", () => {
    const records = [
      lead(),
      lead({ formType: "portal-interest" }),
      lead({ inquiryType: "portal-help" }),
      lead({ serviceKey: "full-arch-stackable" }),
    ];
    for (const record of records) {
      const r = record as unknown as Record<string, unknown>;
      for (const owned of CRM_OWNED_FIELDS) {
        assert.ok(!(owned in r), `${owned} is CRM-owned and must not be sent`);
      }
    }
  });

  test("Automation_Test is server-controlled false and cannot be set true by a client", () => {
    assert.equal(lead().Automation_Test, false);
    assert.equal(lead({ automationTest: true, Automation_Test: true }).Automation_Test, false);
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

  test("normalised identifiers are NOT sent — the CRM classifier computes them", () => {
    const r = lead() as unknown as Record<string, unknown>;
    assert.ok(!("V2_Email_Normalized" in r));
    assert.ok(!("V2_Phone_Normalized" in r));
  });

  test("an unnormalisable phone still delivers the raw value", () => {
    assert.equal(lead({ phone: "12345" }).Mobile, "12345");
  });

  test("how the phone was read is recorded for humans in the Description", () => {
    assert.match(lead({ phone: "+1 415 555 2671" }).Description, /Phone interpreted as: international/);
    assert.match(lead({ phone: "9876543210" }).Description, /Phone interpreted as: india-bare/);
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

describe("Case Portal pre-launch interest", () => {
  const portal = (over: Record<string, unknown> = {}) =>
    lead({ formType: "portal-interest", pageSource: "/case-portal/", message: "", ...over });

  test("sends the agreed acquisition facts", () => {
    const record = portal();
    assert.equal(record.Inquiry_Type, "General Enquiry");
    assert.equal(record.Inquiry_Category, "Portal-Routed");
    assert.equal(record.Page_Submitted_From, "/case-portal/");
    assert.equal(record.Lead_Source, "Website - Image 3D Conversion");
    assert.equal(record.Business_Unit, "Image3DConversion");
  });

  test("Description opens with the agreed marker", () => {
    assert.ok(
      portal().Description.startsWith("Portal launch interest — pre-launch notification request"),
      "the CRM contract requires this exact opening line",
    );
  });

  test("writes NO Journey_Stage — the CRM derives lifecycle state", () => {
    const r = portal() as unknown as Record<string, unknown>;
    assert.ok(!("Journey_Stage" in r), "Journey_Stage must be absent for portal interest");
  });

  test("an ordinary enquiry still DOES write Journey_Stage", () => {
    assert.equal(lead().Journey_Stage, "New Website Inquiry");
  });

  test("no message is required, and none is invented", () => {
    assert.ok(!/Summary:/.test(portal().Description));
  });

  test("carries consent exactly as ticked", () => {
    const record = portal({ consentEmailMarketing: true });
    assert.equal(record.Consent_Email_Marketing, true);
    assert.equal(record.Consent_WA_Marketing, false);
    assert.equal(record.Consent_WA_Operational, false);
    assert.equal(record.Consent, true);
  });

  test("carries no service intent", () => {
    const record = portal();
    assert.equal(record.Service_Interest, undefined);
    assert.equal(record.Workflow_Interest, undefined);
  });

  test("a client cannot unlock the portal contract with a bogus formType", () => {
    const record = lead({ formType: "not-a-form" });
    assert.equal(record.Journey_Stage, "New Website Inquiry", "falls back to the enquiry contract");
  });
});

describe("service intent survives the card click", () => {
  const matrix: Array<[string, string | undefined, string | undefined]> = [
    ["guided-implant-planning", "Guided Implant Planning", undefined],
    ["full-arch-stackable", "Full-Arch/Stackable Guide", "Full-Arch"],
    ["immediate-loading", "Guided Implant Planning", "Immediate Loading"],
    ["advanced-case", "Guided Implant Planning", undefined],
    ["design-only", "Digital Design Service", "Guide Design"],
    ["design-to-delivery", "Other", undefined],
    ["global-practice", undefined, undefined],
    ["partnership", undefined, undefined],
  ];

  for (const [key, service, workflow] of matrix) {
    test(`${key} → ${service ?? "no service"} / ${workflow ?? "no workflow"}`, () => {
      const record = lead({ serviceKey: key, pageSource: "/discuss-a-case/" });
      assert.equal(record.Service_Interest, service);
      assert.equal(record.Workflow_Interest, workflow);
    });
  }

  test("every mapped value is a real picklist entry", () => {
    for (const [key] of matrix) {
      const record = lead({ serviceKey: key }) as unknown as Record<string, string>;
      if (record.Service_Interest) {
        assert.ok(PICKLISTS.Service_Interest.includes(record.Service_Interest), key);
      }
      if (record.Workflow_Interest) {
        assert.ok(PICKLISTS.Workflow_Interest.includes(record.Workflow_Interest), key);
      }
    }
  });

  test("an unknown serviceKey is ignored, not passed through", () => {
    const record = lead({ serviceKey: "Surgical Guide", pageSource: "/discuss-a-case/" });
    assert.equal(record.Service_Interest, undefined, "a client must not inject a CRM value");
  });

  test("the literal website label AND key are recorded in the Description", () => {
    assert.ok(lead({ serviceKey: "design-only" }).Description.includes("Service selected: Design-Only (design-only)"));
    assert.ok(
      lead({ serviceKey: "design-to-delivery" }).Description.includes("Service selected: Design-to-Delivery (design-to-delivery)"),
      "Other loses the stage detail, so the literal label must survive",
    );
  });

  test("Advanced Case does NOT imply Zygoma / Pterygoid", () => {
    const record = lead({ serviceKey: "advanced-case" });
    assert.equal(record.Service_Interest, "Guided Implant Planning");
    assert.equal(record.Workflow_Interest, undefined, "anatomy must not be inferred from 'Advanced Case'");
  });

  test("the zygoma PAGE still states the anatomy explicitly", () => {
    const record = lead({ pageSource: "/zygoma-pterygoid-planning/" });
    assert.equal(record.Workflow_Interest, "Zygoma / Pterygoid", "the page subject is a stated fact, not an inference");
  });

  test("Design-to-Delivery maps to Other, not a single production stage", () => {
    const record = lead({ serviceKey: "design-to-delivery" });
    assert.equal(record.Service_Interest, "Other");
    assert.notEqual(record.Service_Interest, "3D Printing / Production");
    assert.equal(record.Workflow_Interest, undefined);
  });

  test("Partnership with no specific enquiry type → General Enquiry / Collaboration", () => {
    const record = lead({ serviceKey: "partnership", inquiryType: "general" });
    assert.equal(record.Inquiry_Type, "General Enquiry");
    assert.equal(record.Inquiry_Category, "Collaboration");
    assert.equal(record.Service_Interest, undefined);
    assert.equal(record.Workflow_Interest, undefined);
  });

  test("Partnership NEVER overwrites a more specific enquiry type", () => {
    // The visitor told us something more precise than "partnership" — keep it.
    const labVendor = lead({ serviceKey: "partnership", inquiryType: "lab-vendor" });
    assert.equal(labVendor.Inquiry_Type, "Lab / Vendor Inquiry");
    assert.equal(labVendor.Inquiry_Category, "Collaboration");

    const serviceInfo = lead({ serviceKey: "partnership", inquiryType: "service-information" });
    assert.equal(serviceInfo.Inquiry_Type, "Service Inquiry");
    assert.equal(serviceInfo.Inquiry_Category, "Collaboration");
  });

  test("Partnership sets Collaboration for every enquiry type", () => {
    for (const type of INQUIRY_TYPES) {
      const record = lead({ serviceKey: "partnership", inquiryType: type });
      assert.equal(record.Inquiry_Category, "Collaboration", `inquiryType=${type}`);
      assert.ok(
        PICKLISTS.Inquiry_Type.includes(record.Inquiry_Type as string),
        `inquiryType=${type} produced an off-picklist Inquiry_Type`,
      );
    }
  });

  test("Partnership keeps Collaboration even when a portal topic is mentioned", () => {
    const record = lead({ serviceKey: "partnership", message: "What is the price for this case?" });
    assert.equal(record.Inquiry_Category, "Collaboration");
  });

  test("without the Partnership card, portal topics still route as before", () => {
    const record = lead({ message: "What is the price for this case?" });
    assert.equal(record.Inquiry_Category, "Portal-Routed");
  });

  test("page-path derivation still works when no card was clicked", () => {
    const record = lead({ pageSource: "/full-arch-stackable-workflow/" });
    assert.equal(record.Service_Interest, "Full-Arch/Stackable Guide");
    assert.equal(record.Workflow_Interest, "Full-Arch");
  });
});

describe("attribution continuity", () => {
  test("fbclid maps to the structured Meta_FBCLID field", () => {
    const record = lead({
      attribution: { fbclid: "IwAR-test", landingUrl: "https://image3dconversion.com/guided-implant-workflow/?utm_source=meta" },
    });
    assert.equal(record.Meta_FBCLID, "IwAR-test", "the structured field is authoritative");
    assert.match(record.Description, /FBCLID: IwAR-test/, "human-readable copy retained");
    assert.ok((record.Description || "").includes("Landing URL: https://image3dconversion.com/guided-implant-workflow/"));
  });

  test("Meta_FBCLID is absent when no fbclid was captured", () => {
    assert.equal(lead().Meta_FBCLID, undefined);
  });

  test("no Meta campaign/adset/ad id logic is introduced in this step", () => {
    const r = lead({ attribution: { fbclid: "IwAR-test" } }) as unknown as Record<string, unknown>;
    for (const later of ["Meta_Campaign_ID", "Meta_Adset_ID", "Meta_Ad_ID"]) {
      assert.ok(!(later in r), later + " belongs to the later tracking gate");
    }
  });
});
