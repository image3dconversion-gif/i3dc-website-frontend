/**
 * Public enquiry contract — shared by the client form and the server route.
 *
 * HARD BOUNDARY (governance): this carries professional context + a
 * NON-identifying workflow summary only. There is no file field and no
 * patient-data field. Clinical records are never accepted here — they go to the
 * authenticated Case Portal. The server re-asserts this on every submission.
 */

export const INQUIRY_TYPES = [
  "discuss-a-case",
  "service-inquiry",
  "white-label",
  "lab-vendor",
  "existing-customer",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INQUIRY_LABELS: Record<InquiryType, string> = {
  "discuss-a-case": "Discuss a Case",
  "service-inquiry": "Service Inquiry",
  "white-label": "White-Label Partnership",
  "lab-vendor": "Lab / Vendor Partnership",
  "existing-customer": "Existing Customer / Case Portal",
};

/** Fixed governance tags applied server-side (never trusted from the client). */
export const LEAD_SOURCE = "I3DC Website" as const;
export const BUSINESS_TAG = "Image3DConversion" as const;

export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

export interface EnquiryPayload {
  inquiryType: InquiryType;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  organization?: string;
  role?: string;
  serviceInterest?: string;
  workflowInterest?: string;
  urgency?: string;
  message: string;
  preferredCallback?: string;
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
