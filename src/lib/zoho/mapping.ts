/**
 * Zoho CRM field mapping + pipeline routing for I3DC website enquiries.
 *
 * Recommendation (see final report): route to the standard **Leads** module
 * with Lead_Source = "I3DC Website" and a business tag, UNLESS an existing Zoho
 * webform/endpoint is confirmed — in which case do not silently replace it.
 * The custom "Inquiries" module is only generically configured today and is not
 * yet purpose-built for website intake.
 *
 * Mapping is intentionally data-only so it can be reviewed and adjusted to the
 * real Zoho field API names before enabling live submission.
 */
import type { InquiryType, NormalisedEnquiry } from "../enquiry/types";
import { INQUIRY_LABELS } from "../enquiry/types";

/** Which CRM pipeline/owner an enquiry type should land in. */
export const PIPELINE_ROUTING: Record<
  InquiryType,
  { pipeline: string; tags: string[] }
> = {
  "discuss-a-case": { pipeline: "Case Enquiries", tags: ["Website", "Discuss a Case"] },
  "service-inquiry": { pipeline: "Service Enquiries", tags: ["Website", "Service"] },
  "white-label": { pipeline: "Partnerships", tags: ["Website", "White-Label"] },
  "lab-vendor": { pipeline: "Partnerships", tags: ["Website", "Lab/Vendor"] },
  // Existing customers are redirected to the Case Portal and do NOT create a lead.
  "existing-customer": { pipeline: "Portal Redirect", tags: ["Website", "Existing Customer"] },
};

/**
 * A Zoho Leads record for the `Image3DConversion Website Leads` layout.
 * Field API names match the approved mapping. Standard fields (First/Last_Name,
 * Email, Mobile, City, State, Country, Designation, Lead_Source, Description) are
 * live today; the custom fields below (Business_Unit, Inquiry_Type,
 * Service_Interest, Workflow_Interest, Case_Urgency, Preferred_Callback,
 * Existing_Customer, Page_Submitted_From, Consent) + the `Lead_Source` value +
 * the layout must be created by the Zoho admin before live submission succeeds.
 * `Clinic_Practice_Name` is used for organization (NOT `Company`, which is
 * inactive on this module). `Layout` is attached at the submission layer from
 * the ZOHO_LAYOUT_ID env var, so no layout id is hardcoded.
 */
export interface ZohoLeadRecord {
  Last_Name: string;
  First_Name?: string;
  Email: string;
  Mobile?: string;
  Clinic_Practice_Name?: string;
  City?: string;
  Designation?: string;
  Lead_Source: string;
  Description: string;
  // Custom fields (admin-created in the new layout; API names confirmed on re-audit):
  Business_Unit?: string;
  Inquiry_Type?: string;
  Service_Interest?: string;
  Workflow_Interest?: string;
  Case_Urgency?: string;
  Preferred_Callback?: string;
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

/** Human-readable context appended to Description so nothing is lost if a
 *  custom field is missing in the target CRM. */
function buildDescription(e: NormalisedEnquiry): string {
  const lines = [
    `Enquiry type: ${INQUIRY_LABELS[e.inquiryType]}`,
    e.role && `Role: ${e.role}`,
    e.city && `City: ${e.city}`,
    e.serviceInterest && `Service interest: ${e.serviceInterest}`,
    e.workflowInterest && `Workflow interest: ${e.workflowInterest}`,
    e.urgency && `Urgency: ${e.urgency}`,
    e.preferredCallback && `Preferred callback: ${e.preferredCallback}`,
    `Existing customer: ${e.existingCustomer ? "Yes" : "No"}`,
    `Consent given: ${e.consent ? "Yes" : "No"}`,
    e.pageSource && `Submitted from: ${e.pageSource}`,
    "",
    "Summary:",
    e.message,
  ].filter(Boolean);
  return lines.join("\n");
}

export function toZohoLead(e: NormalisedEnquiry): ZohoLeadRecord {
  const { first, last } = splitName(e.name);
  return {
    Last_Name: last,
    First_Name: first,
    Email: e.email,
    Mobile: e.phone,
    // Organization → Clinic_Practice_Name (Company is inactive on this layout).
    Clinic_Practice_Name: e.organization,
    City: e.city,
    Designation: e.role,
    Lead_Source: e.leadSource,
    Description: buildDescription(e),
    Business_Unit: e.businessTag,
    Inquiry_Type: INQUIRY_LABELS[e.inquiryType],
    Service_Interest: e.serviceInterest,
    Workflow_Interest: e.workflowInterest,
    Case_Urgency: e.urgency,
    Preferred_Callback: e.preferredCallback,
    Existing_Customer: e.existingCustomer,
    Page_Submitted_From: e.pageSource,
    Consent: e.consent,
    UTM_Source: e.utm?.source,
    UTM_Medium: e.utm?.medium,
    UTM_Campaign: e.utm?.campaign,
    UTM_Content: e.utm?.content,
  };
}
