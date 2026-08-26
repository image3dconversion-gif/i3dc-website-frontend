/**
 * Public enquiry contract — shared by the client form and the server route.
 *
 * HARD BOUNDARY (governance): the website form is a GENERIC-INQUIRY funnel only.
 * It is NOT a case/service-order funnel. It collects generic questions, portal
 * guidance, collaboration, lab/vendor, existing-customer support, and
 * service-information-at-category-level only. There is no file field and no
 * patient-data field. All case-specific work — case discussion, file upload,
 * DICOM/STL/CBCT review, quotation/pricing, treatment/surgery planning, guide
 * design, production, and delivery/status — lives ONLY in the I3DC Case Portal.
 * The server re-asserts this boundary on every submission.
 */

export const INQUIRY_TYPES = [
  "general",
  "portal-help",
  "service-information",
  "collaboration",
  "lab-vendor",
  "existing-customer-support",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

/**
 * Display labels. These strings are ALSO sent as the Zoho `Inquiry_Type` picklist
 * value, so they MUST match the six approved Zoho `actual_value`s exactly on the
 * `I3DC Website` layout (id 6607227000004071789):
 *   General Enquiry · Portal Help · Service Information ·
 *   Collaboration Inquiry · Lab / Vendor Inquiry · Existing Customer Support
 */
export const INQUIRY_LABELS: Record<InquiryType, string> = {
  general: "General Enquiry",
  "portal-help": "Portal Help",
  "service-information": "Service Information",
  collaboration: "Collaboration Inquiry",
  "lab-vendor": "Lab / Vendor Inquiry",
  "existing-customer-support": "Existing Customer Support",
};

/**
 * Zoho `Inquiry_Type` picklist values — the ONLY strings accepted by the CRM.
 *
 * These are intentionally separate from INQUIRY_LABELS. The website offers six
 * intents; the CRM picklist defines five values, and four of the website labels
 * ("Portal Help", "Service Information", "Collaboration Inquiry", "Existing
 * Customer Support") are not among them. Sending a label that is not on the
 * picklist writes unusable data at best and is rejected at worst, so every
 * website intent is folded onto a real picklist value here.
 *
 * Nothing is lost: the precise website intent is still carried by
 * `Inquiry_Category`, `Journey_Stage` and the Description block.
 */
export const INQUIRY_ZOHO_VALUES: Record<InquiryType, string> = {
  general: "General Enquiry",
  // No "Portal Help" value exists; Inquiry_Category=Portal-Routed carries it.
  "portal-help": "General Enquiry",
  "service-information": "Service Inquiry",
  collaboration: "White-Label Inquiry",
  "lab-vendor": "Lab / Vendor Inquiry",
  // No "Existing Customer Support" value exists; Journey_Stage carries it.
  "existing-customer-support": "General Enquiry",
};

/** Fixed governance values applied server-side (never trusted from the client).
 *  LEAD_SOURCE must match the Zoho `Lead_Source` picklist value exactly; until
 *  that value exists in Zoho, live submission is rejected — fine while dry-run. */
export const LEAD_SOURCE = "Website - Image 3D Conversion" as const;
export const BUSINESS_TAG = "Image3DConversion" as const;

/** The public site this enquiry originated from. Server-fixed, never client-supplied. */
export const SOURCE_WEBSITE = "https://www.image3dconversion.com" as const;

/**
 * Controlled consent provenance. `Consent_Source` is written as
 * `${CONSENT_SOURCE}@${CONSENT_WORDING_VERSION}` so every stored permission
 * records WHICH wording the person agreed to. Bump the version whenever the
 * on-page consent wording changes — never edit the wording without bumping it,
 * or older consents become unauditable.
 */
export const CONSENT_SOURCE = "i3dc-website-form" as const;
export const CONSENT_WORDING_VERSION = "2026-08-26.v1" as const;

/** CRM V2 control values (verified against the live Leads picklists). */
export const JOURNEY_ENGINE_VERSION = "V2" as const;
export const V2_NEW_ENQUIRY_STAGE = "New Enquiry" as const;

/** Journey routing values written to Zoho (fields pending admin creation/approval). */
export const DEFAULT_JOURNEY_STAGE = "New Website Inquiry" as const;
export const PORTAL_GUIDANCE_STAGE = "Portal Guidance Needed" as const;
export const PORTAL_ROUTED_CATEGORY = "Portal-Routed" as const;

export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

/** Campaign/entry attribution collected on the client, all optional. */
export interface Attribution {
  /** Server-fixed origin site; client values are ignored. */
  sourceWebsite: string;
  /** document.referrer at submit time, when the browser exposes one. */
  referrer?: string;
  /** Google Ads click id from the landing URL. */
  gclid?: string;
  /** First time this browser was seen on the site (persisted locally). */
  firstTouchIso?: string;
  /** Start of the visit this enquiry was sent in. */
  lastTouchIso?: string;
}

/**
 * The four permissions, each captured independently.
 *
 * `processing` is the required lawful basis for handling the enquiry at all.
 * It is NOT marketing permission and must never be read as such — the three
 * marketing/operational opt-ins below are the only permission signals.
 */
export interface ConsentSelections {
  processing: boolean;
  operationalWhatsApp: boolean;
  emailMarketing: boolean;
  whatsAppMarketing: boolean;
}

export interface EnquiryPayload {
  inquiryType: InquiryType;
  name: string;
  /** Clinic / organisation. */
  organization?: string;
  /** Mobile / WhatsApp. */
  phone?: string;
  email: string;
  message: string;
  existingCustomer?: boolean;
  /**
   * Required processing consent (the legacy bundled checkbox).
   * COMPATIBILITY ONLY — it means "you may handle my enquiry". It grants NO
   * marketing permission; do not derive one from it.
   */
  consent: boolean;
  /** Optional, unticked by default: operational WhatsApp about this enquiry. */
  consentWhatsAppOperational?: boolean;
  /** Optional, unticked by default: marketing email. */
  consentEmailMarketing?: boolean;
  /** Optional, unticked by default: marketing WhatsApp. */
  consentWhatsAppMarketing?: boolean;
  /** Route the form was submitted from (e.g. /discuss-a-case/). */
  pageSource?: string;
  utm?: Utm;
  /** Referrer, click id and touch timestamps captured by the client. */
  attribution?: Partial<Attribution>;
  /** Honeypot — must be empty for a human submission. */
  companyWebsite?: string;
}

/** Server-normalised enquiry: governance fields fixed, inputs trimmed. */
export interface NormalisedEnquiry
  extends Omit<EnquiryPayload, "companyWebsite" | "attribution"> {
  leadSource: typeof LEAD_SOURCE;
  businessTag: typeof BUSINESS_TAG;
  receivedAtIso: string;
  /** The four permissions, resolved independently of each other. */
  consentSelections: ConsentSelections;
  /** Server clock at receipt — the auditable moment consent was captured. */
  consentCapturedAtIso: string;
  /** Controlled provenance: `i3dc-website-form@<wording-version>`. */
  consentSource: string;
  consentWordingVersion: typeof CONSENT_WORDING_VERSION;
  /** Duplicate-matching keys. Raw email/phone above are left untouched. */
  normalisedEmail?: string;
  normalisedPhone?: string;
  /** How the phone was interpreted, or why it could not be. */
  phoneBasis: string;
  attribution: Attribution;
  /** Advisory review signals. Never blocks — see lib/enquiry/spam.ts. */
  spamIndicators: string[];
}
