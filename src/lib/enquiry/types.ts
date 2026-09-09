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
  // Folded onto General Enquiry rather than "White-Label Inquiry": a
  // collaboration approach is not necessarily a white-label one, and
  // mis-labelling it would misroute the lead. The exact intent survives in
  // Inquiry_Category = "Collaboration" and in the Description.
  collaboration: "General Enquiry",
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
 * Controlled consent provenance, written to two separate CRM fields:
 * `Consent_Source` holds the controlled source value and
 * `Consent_Wording_Version` holds the wording version, so both stay queryable
 * on their own. Bump the version whenever the on-page consent wording changes —
 * never edit the wording without bumping it, or older consents become
 * unauditable.
 */
export const CONSENT_SOURCE = "i3dc-website-form" as const;
/**
 * Bumped from 2026-08-26.v1: the Case Portal pre-launch interest form adds new
 * consent wording, so consents captured from this build must be auditable
 * against a different wording set than the enquiry-only build.
 */
export const CONSENT_WORDING_VERSION = "2026-09-09.v2" as const;

/*
 * DELIBERATELY NOT DEFINED HERE — the CRM owns this state, not the website.
 *
 *   Journey_Engine_Version · V2_Journey_Stage · V2_Email_Normalized ·
 *   V2_Phone_Normalized · Duplicate_Status · Automation_Exception ·
 *   Nurture_Suppressed · Active_Nurture_Journey
 *
 * "V2 ING - I3DC Website Ingress" fires only while Journey_Engine_Version is
 * EMPTY, so writing it from the website would stop the ingress rule from
 * running at all. The shared V2 duplicate classifier computes and writes both
 * normalised identifiers itself. The website supplies FACTS; the CRM derives
 * STATE.
 */

/**
 * Service-intent cards on /discuss-a-case/.
 *
 * The website owns this intent — it is a fact about what the visitor clicked,
 * not a lifecycle state. Values below are EXACT `Service_Interest` /
 * `Workflow_Interest` picklist entries; nothing is invented. A card that maps
 * to no unambiguous picklist value leaves the field unset rather than guessing,
 * because a wrong intent misroutes the lead more damagingly than an absent one.
 */
export const SERVICE_KEYS = [
  "guided-implant-planning",
  "full-arch-stackable",
  "immediate-loading",
  "advanced-case",
  "design-only",
  "design-to-delivery",
  "global-practice",
  "partnership",
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

export interface ServiceIntent {
  /** Exact `Service_Interest` picklist value, or undefined when ambiguous. */
  service?: string;
  /** Exact `Workflow_Interest` picklist value, or undefined when ambiguous. */
  workflow?: string;
}

/** Card labels, so the form can confirm back what the visitor chose. */
export const SERVICE_LABELS: Record<ServiceKey, string> = {
  "guided-implant-planning": "Guided Implant Planning",
  "full-arch-stackable": "Full-Arch / Stackable",
  "immediate-loading": "Immediate Loading",
  "advanced-case": "Advanced Case",
  "design-only": "Design-Only",
  "design-to-delivery": "Design-to-Delivery",
  "global-practice": "Global Practice",
  partnership: "Partnership",
};

export const SERVICE_INTENT: Record<ServiceKey, ServiceIntent> = {
  "guided-implant-planning": { service: "Guided Implant Planning" },
  "full-arch-stackable": { service: "Full-Arch/Stackable Guide", workflow: "Full-Arch" },
  "immediate-loading": { service: "Guided Implant Planning", workflow: "Immediate Loading" },
  // Workflow deliberately UNSET: "Advanced Case" covers complex anatomy
  // generally, and inferring "Zygoma / Pterygoid" from it would assert an
  // anatomy the visitor never chose.
  "advanced-case": { service: "Guided Implant Planning" },
  "design-only": { service: "Digital Design Service", workflow: "Guide Design" },
  // "Other" rather than "3D Printing / Production": this route spans planning,
  // design AND production, so naming one stage would misdescribe it. The literal
  // website label is preserved in the Description so the intent is not lost.
  "design-to-delivery": { service: "Other" },
  // Geography/logistics intent, not a service — carried by Inquiry_Category.
  "global-practice": {},
  // Commercial intent, not a service. Routed via Inquiry_Type + Inquiry_Category
  // in toZohoLead() rather than by inventing a Service_Interest value.
  partnership: {},
};

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

/**
 * Campaign/entry attribution, all optional.
 *
 * Collected by lib/attribution and persisted across page views, because a paid
 * visitor rarely lands on the form page directly — before persistence existed,
 * every campaign value was lost the moment they navigated.
 */
export interface Attribution {
  /** Server-fixed origin site; client values are ignored. */
  sourceWebsite: string;
  /** EXTERNAL referrer for this acquisition touch (own-host referrers dropped). */
  referrer?: string;
  /** Google Ads click id, carried from the landing URL. */
  gclid?: string;
  /**
   * Meta click id. Carried for continuity only — there is NO Meta field on the
   * Leads module, so it travels in the Description. No Pixel, no CAPI here.
   */
  fbclid?: string;
  /** First URL of this acquisition touch (path + campaign query only). */
  landingUrl?: string;
  /** First time this browser was seen on the site (persisted locally). */
  firstTouchIso?: string;
  /** Start of the current acquisition touch. */
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

/**
 * Which website form produced this submission.
 *
 * `portal-interest` is the Case Portal PRE-LAUNCH notification capture. It is a
 * different fact, not a different lifecycle stage: the CRM still derives all
 * state from it. See toZohoLead() for exactly what differs.
 */
export const FORM_TYPES = ["enquiry", "portal-interest"] as const;
export type FormType = (typeof FORM_TYPES)[number];

export interface EnquiryPayload {
  /** Defaults to "enquiry" when absent, preserving the existing contract. */
  formType?: FormType;
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
  /**
   * Which service card the visitor chose. Only the KEY crosses the wire; the
   * server maps it to picklist values, so a client cannot inject a CRM value.
   */
  serviceKey?: ServiceKey;
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
  extends Omit<EnquiryPayload, "companyWebsite" | "attribution" | "formType"> {
  /** Always resolved server-side; never optional past validation. */
  formType: FormType;
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
  /** Resolved once, server-side, from `serviceKey` then the page path. */
  serviceIntent: ServiceIntent;
  /**
   * Advisory only — NOT sent to Zoho. The V2 duplicate classifier computes and
   * writes the authoritative V2_Email_Normalized / V2_Phone_Normalized itself;
   * these exist so the Description can record how the phone was read.
   */
  normalisedEmail?: string;
  normalisedPhone?: string;
  /** How the phone was interpreted, or why it could not be. */
  phoneBasis: string;
  attribution: Attribution;
  /** Advisory review signals. Never blocks — see lib/enquiry/spam.ts. */
  spamIndicators: string[];
}
