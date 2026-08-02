/**
 * Server-side validation + normalisation for public enquiries.
 * Hand-rolled (no runtime dep). Enforces required fields, email shape, consent,
 * honeypot, length caps, and the no-clinical-data / no-file boundary.
 */
import {
  BUSINESS_TAG,
  INQUIRY_TYPES,
  LEAD_SOURCE,
  type EnquiryPayload,
  type InquiryType,
  type NormalisedEnquiry,
  type Utm,
} from "./types";

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  value?: NormalisedEnquiry;
}

const MAX = {
  short: 160,
  message: 4000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * HARD REJECT guard — patient-identifying info or a pasted clinical file. These
 * must never be stored in the CRM; the submission is bounced back to the portal.
 * (Strengthened: adds CBCT and NIfTI/zip file references.)
 */
const CLINICAL_LEAK_RE =
  /\b(dicom|cbct|\.stl\b|\.dcm\b|\.nii\b|\.zip\b|patient name|date of birth|\bdob\b|medical record|\bmrn\b|aadhaar|passport no)\b/i;

/**
 * SOFT ROUTE signal — commercial/case terms that are NOT patient PII but must be
 * handled in the Case Portal, not this form. A match does not reject; it flags
 * the lead for `Journey_Stage = Portal Guidance Needed` (see mapping.ts).
 */
const PORTAL_TOPIC_RE =
  /\b(case|cases|price|pricing|cost|quote|quotation|treatment plan|surgery plan|guide design|implant system|implant brand|production|delivery|case status|order status|quotation request)\b/i;

/** True when the message mentions a case/commercial topic that the Case Portal owns. */
export function mentionsPortalTopic(message: string): boolean {
  return PORTAL_TOPIC_RE.test(message);
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function clean(v: unknown, max: number): string {
  return str(v).slice(0, max);
}

function cleanUtm(u: unknown): Utm | undefined {
  if (!u || typeof u !== "object") return undefined;
  const o = u as Record<string, unknown>;
  const out: Utm = {
    source: clean(o.source, MAX.short) || undefined,
    medium: clean(o.medium, MAX.short) || undefined,
    campaign: clean(o.campaign, MAX.short) || undefined,
    content: clean(o.content, MAX.short) || undefined,
  };
  return Object.values(out).some(Boolean) ? out : undefined;
}

export function validateEnquiry(
  raw: unknown,
  receivedAtIso: string,
): ValidationResult {
  const errors: Record<string, string> = {};
  const body = (raw ?? {}) as Partial<EnquiryPayload>;

  // Honeypot: a filled hidden field means a bot. Report generic to not tip off.
  if (str(body.companyWebsite)) {
    return { ok: false, errors: { form: "Submission rejected." } };
  }

  const inquiryType = str(body.inquiryType) as InquiryType;
  if (!INQUIRY_TYPES.includes(inquiryType)) {
    errors.inquiryType = "Select an enquiry type.";
  }

  const name = clean(body.name, MAX.short);
  if (!name) errors.name = "Name is required.";

  const email = clean(body.email, MAX.short);
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email.";

  const message = clean(body.message, MAX.message);
  if (!message) errors.message = "A short summary of your question is required.";
  else if (CLINICAL_LEAK_RE.test(message)) {
    errors.message =
      "Please remove patient identifiers or clinical file references. Case files, planning, and case-specific help go through the I3DC Case Portal, not this form.";
  }

  if (body.consent !== true) {
    errors.consent = "Please confirm you agree before sending.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const value: NormalisedEnquiry = {
    inquiryType,
    name,
    email,
    phone: clean(body.phone, MAX.short) || undefined,
    organization: clean(body.organization, MAX.short) || undefined,
    message,
    existingCustomer: body.existingCustomer === true,
    consent: true,
    pageSource: clean(body.pageSource, MAX.short) || undefined,
    utm: cleanUtm(body.utm),
    // Governance fields are FIXED server-side, never trusted from the client.
    leadSource: LEAD_SOURCE,
    businessTag: BUSINESS_TAG,
    receivedAtIso,
  };

  return { ok: true, errors: {}, value };
}
