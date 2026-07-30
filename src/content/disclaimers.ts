/**
 * Caption & disclaimer system (CMS-readiness + consistency).
 *
 * One typed source for the standard governance disclaimers, image captions and
 * placeholder-slot wording used across the site. Centralising them keeps wording
 * consistent, makes the governance language reviewable in one place, and gives a
 * future CMS a `disclaimer` collection to manage. ADDITIVE — existing inline
 * copy still works; components can adopt these keys incrementally.
 *
 * These are governance-locked in spirit: edits should pass the same review as
 * any claim (see docs/handoff/CMS_READINESS_PLAN.md §4). No wording here makes an
 * outcome, guarantee, accuracy or superiority claim.
 */

export const disclaimers = {
  /** Audience gate — who the services are for. */
  professionalAudience:
    "Services are provided to dental professionals and authorised workflow partners.",
  /** Clinical responsibility — appears near planning/workflow claims. */
  clinicianAuthority:
    "The treating clinician remains responsible for diagnosis, treatment decisions and final approval.",
  /** Fuller responsibility statement for page footers / hero notes. */
  clinicianAuthorityLong:
    "Diagnosis, treatment indication, patient consent, surgical execution and final clinical approval remain with the treating clinician or responsible professional team. Image3DConversion supports the digital planning and workflow environment around the case.",
  /** Privacy — never put PII in public forms. */
  noPublicPii:
    "Do not place patient-identifying information, DICOM, STL or clinical photographs in a public enquiry form. Clinical records are submitted only through the authenticated Case Portal.",
  /** Radiology boundary — data prep is not interpretation. */
  notRadiology:
    "Technical data preparation is separate from radiology interpretation, which remains a clinical responsibility of the treating or reporting professional.",
} as const;

export const captions = {
  /** Use on any schematic/illustrative graphic that is not a real case. */
  illustrative: "Illustrative — not a patient case.",
  /** Badge for synthetic UI mocks (portal etc.). */
  sampleData: "Sample data",
  /** Neutral label for the synthetic portal window (never a real URL). */
  portalIllustrative: "Case Portal · illustrative",
} as const;

/**
 * Rules for image slots that have no approved asset yet. A placeholder must:
 * (1) never imply a real clinical outcome; (2) carry the FINAL alt text so the
 * slot is self-documenting; (3) state the asset spec + gating priority; (4) be
 * swapped for the real asset with the SAME alt when approved. Encoded so a CMS /
 * reviewer can enforce it. See ui/ImageOrSlot + MASTER_IMAGE_ASSET_CHECKLIST.md.
 */
export const placeholderRules = {
  mustNotImplyClinicalOutcome: true,
  requiresFinalAltText: true,
  requiresAssetSpec: true,
  swapKeepsSameAlt: true,
} as const;

export type DisclaimerKey = keyof typeof disclaimers;
export type CaptionKey = keyof typeof captions;
