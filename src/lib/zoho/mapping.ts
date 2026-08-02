/**
 * Zoho CRM field mapping + journey routing for I3DC website enquiries.
 *
 * BOUNDARY: this is a GENERIC-INQUIRY funnel, not a case/service-order funnel.
 * The website never collects or handles case files, DICOM/STL/CBCT, quotations,
 * treatment/surgery plans, guide design, implant-system details, production, or
 * case status — those live only in the I3DC Case Portal. The CRM's job is to
 * educate, classify, nurture, and route (to the Portal or to partner review).
 *
 * Records target the existing `I3DC Website` Leads layout (id 6607227000004071789);
 * the layout is attached at the submission layer from ZOHO_LAYOUT_ID (no hardcoded id).
 * Mapping is data-only so it can be reviewed before live submission is enabled.
 */
import {
  BUSINESS_TAG,
  DEFAULT_JOURNEY_STAGE,
  INQUIRY_LABELS,
  LEAD_SOURCE,
  PORTAL_GUIDANCE_STAGE,
  PORTAL_ROUTED_CATEGORY,
  type InquiryType,
  type NormalisedEnquiry,
} from "../enquiry/types";
import { mentionsPortalTopic } from "../enquiry/validate";

/**
 * How each inquiry type is routed.
 *  - portal: true       → guide the user into the Case Portal (portal-owned topics)
 *  - partnerReview: true → collaboration / lab / vendor / partner pipeline
 */
export const PIPELINE_ROUTING: Record<
  InquiryType,
  { portal: boolean; partnerReview: boolean; label: string }
> = {
  general: { portal: false, partnerReview: false, label: "General enquiry" },
  "service-information": { portal: false, partnerReview: false, label: "Service information (category-level)" },
  collaboration: { portal: false, partnerReview: true, label: "Collaboration review" },
  "lab-vendor": { portal: false, partnerReview: true, label: "Lab / Vendor review" },
  "portal-help": { portal: true, partnerReview: false, label: "Portal guidance" },
  "existing-customer-support": { portal: true, partnerReview: false, label: "Existing customer → Portal" },
};

/**
 * True when the enquiry should be routed toward Case Portal guidance:
 * an existing customer, an explicit portal/existing-customer inquiry type, or a
 * message mentioning a Portal-owned case/commercial topic.
 */
export function needsPortalGuidance(e: NormalisedEnquiry): boolean {
  return (
    e.existingCustomer === true ||
    PIPELINE_ROUTING[e.inquiryType].portal ||
    mentionsPortalTopic(e.message)
  );
}

/**
 * A Zoho Leads record for the `I3DC Website` layout. Standard fields
 * (First/Last_Name, Email, Mobile, Clinic_Practice_Name, Lead_Source, Description)
 * are live today. `Business_Unit`, `Inquiry_Type`, `Existing_Customer`,
 * `Page_Submitted_From`, `Consent` were created on the layout. `Journey_Stage` and
 * `Inquiry_Category` are journey fields PENDING admin creation/approval in Zoho —
 * included here so the mapping is ready; harmless while dry-run.
 * `Clinic_Practice_Name` is used for organisation (NOT `Company`, inactive here).
 */
export interface ZohoLeadRecord {
  Last_Name: string;
  First_Name?: string;
  Email: string;
  Mobile?: string;
  Clinic_Practice_Name?: string;
  Lead_Source: string;
  Description: string;
  Business_Unit?: string;
  Inquiry_Type?: string;
  Journey_Stage?: string;
  Inquiry_Category?: string;
  Existing_Customer?: boolean;
  Page_Submitted_From?: string;
  Consent?: boolean;
  UTM_Source?: string;
  UTM_Medium?: string;
  UTM_Campaign?: string;
  UTM_Content?: string;
  /** Attached from ZOHO_LAYOUT_ID at submission time; omitted when unset. */
  Layout?: { id: string };
}

function splitName(full: string): { first?: string; last: string } {
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { last: full || "Enquiry" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/** Non-clinical context appended to Description. No case/service fields. */
function buildDescription(e: NormalisedEnquiry, portalRouted: boolean): string {
  const lines = [
    `Enquiry type: ${INQUIRY_LABELS[e.inquiryType]}`,
    `Existing customer: ${e.existingCustomer ? "Yes" : "No"}`,
    `Consent given: ${e.consent ? "Yes" : "No"}`,
    e.pageSource && `Submitted from: ${e.pageSource}`,
    portalRouted &&
      "⚠ Mentions a Case Portal topic (case/file/price/plan/status). Route to the I3DC Case Portal — do not handle here.",
    "",
    "Summary:",
    e.message,
  ].filter(Boolean);
  return lines.join("\n");
}

/** Classify a lead for reporting (Inquiry_Category picklist — pending in Zoho). */
function inquiryCategory(e: NormalisedEnquiry, portalRouted: boolean): string {
  if (portalRouted) return PORTAL_ROUTED_CATEGORY;
  if (PIPELINE_ROUTING[e.inquiryType].partnerReview) return "Collaboration";
  if (e.inquiryType === "service-information") return "Service-Info";
  return "Generic";
}

export function toZohoLead(e: NormalisedEnquiry): ZohoLeadRecord {
  const { first, last } = splitName(e.name);
  const portalRouted = needsPortalGuidance(e);
  return {
    Last_Name: last,
    First_Name: first,
    Email: e.email,
    Mobile: e.phone,
    // Organisation → Clinic_Practice_Name (Company is inactive on this layout).
    Clinic_Practice_Name: e.organization,
    Lead_Source: e.leadSource,
    Description: buildDescription(e, portalRouted),
    Business_Unit: e.businessTag,
    Inquiry_Type: INQUIRY_LABELS[e.inquiryType],
    Journey_Stage: portalRouted ? PORTAL_GUIDANCE_STAGE : DEFAULT_JOURNEY_STAGE,
    Inquiry_Category: inquiryCategory(e, portalRouted),
    Existing_Customer: e.existingCustomer,
    Page_Submitted_From: e.pageSource,
    Consent: e.consent,
    UTM_Source: e.utm?.source,
    UTM_Medium: e.utm?.medium,
    UTM_Campaign: e.utm?.campaign,
    UTM_Content: e.utm?.content,
  };
}
