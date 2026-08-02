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

/** Fixed governance values applied server-side (never trusted from the client).
 *  LEAD_SOURCE must match the Zoho `Lead_Source` picklist value exactly; until
 *  that value exists in Zoho, live submission is rejected — fine while dry-run. */
export const LEAD_SOURCE = "Website - Image 3D Conversion" as const;
export const BUSINESS_TAG = "Image3DConversion" as const;

/** Journey routing values written to Zoho (fields pending admin creation/approval). */
export const DEFAULT_JOURNEY_STAGE = "New Website Inquiry" as const;
export const PORTAL_GUIDANCE_STAGE = "Portal Guidance Needed" as const;
export const PORTAL_ROUTED_CATEGORY = "Portal-Routed" as const;

export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
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
  consent: boolean;
  /** Route the form was submitted from (e.g. /discuss-a-case/). */
  pageSource?: string;
  utm?: Utm;
  /** Honeypot — must be empty for a human submission. */
  companyWebsite?: string;
}

/** Server-normalised enquiry: governance fields fixed, inputs trimmed. */
export interface NormalisedEnquiry
  extends Omit<EnquiryPayload, "companyWebsite"> {
  leadSource: typeof LEAD_SOURCE;
  businessTag: typeof BUSINESS_TAG;
  receivedAtIso: string;
}
