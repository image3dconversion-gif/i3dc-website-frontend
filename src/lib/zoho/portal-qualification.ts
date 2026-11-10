import { normalizeCountry, ORGANISATION_TYPES, PROFESSIONAL_ROLES } from "../enquiry/qualification-intake";

const clinicianRoles = new Set<string>([
  PROFESSIONAL_ROLES.dentist,
  PROFESSIONAL_ROLES.specialist,
  PROFESSIONAL_ROLES.omfs,
]);
const clinicalOrganisations = new Set<string>([ORGANISATION_TYPES.clinic, ORGANISATION_TYPES.hospital]);

interface QualificationEvidence {
  // Trusted CRM evidence. Do not construct this from the public request.
  phaseOneIntake: boolean;
  validity: "genuine" | "test" | "confirmed-invalid" | "unknown";
  identity: "resolved" | "conflict" | "pending";
  role?: string;
  organisation?: string;
  country?: string;
  conflictingEvidence?: boolean;
}

// The CRM consumer calls this after ingress. Undefined means leave CRM unchanged.
export function qualifyPortalLead(evidence: QualificationEvidence):
  "Qualified" | "Needs Review" | "Not Eligible" | undefined {
  if (!evidence.phaseOneIntake) return;
  if (evidence.validity === "test" || evidence.validity === "confirmed-invalid") return "Not Eligible";

  if (
    evidence.validity !== "genuine" ||
    evidence.identity !== "resolved" ||
    evidence.conflictingEvidence ||
    !normalizeCountry(evidence.country) ||
    !clinicianRoles.has(evidence.role ?? "") ||
    !clinicalOrganisations.has(evidence.organisation ?? "")
  ) return "Needs Review";

  return "Qualified";
}
