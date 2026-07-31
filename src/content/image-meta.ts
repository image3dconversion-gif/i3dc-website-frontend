/**
 * Image governance metadata layer (CMS-readiness).
 *
 * `images.ts` is the RENDER contract (src, dims, alt) the frontend consumes and
 * must not change shape. THIS file annotates each manifest key with the
 * governance schema from docs/handoff/NEXT_PHASE_IMAGE_BRIEF.md §4 and expresses
 * the publish-gate as a typed state machine, so a future CMS can enforce it.
 *
 * It is ADDITIVE: no component imports it yet; it documents provenance/consent
 * for the 10 approved assets and can back CMS validation later. Nothing here
 * contains patient data. See docs/handoff/CMS_READINESS_PLAN.md.
 */
import { img } from "@/content/images";

export type ImageCategory =
  | "planning"
  | "guide"
  | "implant"
  | "smile"
  | "lab"
  | "portal-ui"
  | "logo"
  | "partner"
  | "texture"
  | "icon";

export type BackgroundType = "opaque" | "transparent" | "needs-cutout";
export type ApprovalStatus =
  | "draft"
  | "in-review"
  | "approved"
  | "published"
  | "retired";
export type ConsentStatus = "not-required" | "pending" | "signed";
export type LicenseStatus = "owned" | "licensed" | "permission-pending";

export interface ImageMeta {
  /** Stable, code-facing slug — matches the key in `images.ts`. */
  key: string;
  title: string;
  category: ImageCategory;
  backgroundType: BackgroundType;
  /** Mobile-safe crop centre, 0..1. */
  focalPoint: { x: number; y: number };
  source: string;
  captureDate: string | null;
  license: LicenseStatus;
  /** Whether a person/patient is visible (drives the consent gate). */
  personVisible: boolean;
  consentStatus: ConsentStatus;
  consentRef: string | null;
  piiSafe: boolean;
  piiReviewer: string | null;
  piiDate: string | null;
  approvalStatus: ApprovalStatus;
  /** Pages/slots that consume this asset. */
  usageMap: string[];
  caption?: string;
}

/**
 * Publish gate (NEXT_PHASE_IMAGE_BRIEF.md §4). An asset may reach `published`
 * ONLY when: alt present AND license valid AND piiSafe AND (consent signed if a
 * person is visible) AND approvalStatus ≥ approved. Returns the blocking reasons
 * so a CMS/build step can fail loudly rather than ship a non-compliant asset.
 */
export function publishBlockers(meta: ImageMeta, alt: string): string[] {
  const blockers: string[] = [];
  if (!alt || alt.trim() === "") blockers.push("alt text is empty");
  if (meta.license === "permission-pending")
    blockers.push("license/permission not yet valid");
  if (!meta.piiSafe) blockers.push("piiSafe is not true");
  if (meta.personVisible && meta.consentStatus !== "signed")
    blockers.push("person visible but consent not signed");
  const order: ApprovalStatus[] = [
    "draft",
    "in-review",
    "approved",
    "published",
    "retired",
  ];
  if (order.indexOf(meta.approvalStatus) < order.indexOf("approved"))
    blockers.push("approvalStatus is below 'approved'");
  return blockers;
}

export function canPublish(meta: ImageMeta, alt: string): boolean {
  return publishBlockers(meta, alt).length === 0;
}

/**
 * Governance records for the 10 approved, shipping assets. All are
 * de-identified viewports / product shots with no visible patient identity;
 * EXIF stripped at the processing step. Provenance per IMAGE_ASSET_AUDIT.md §8.
 * Keyed by the manifest key in `images.ts`.
 */
export const imageMeta = {
  // ⚠ Founder review (2026-07-31): the shipped WebP appears to carry a WHITE
  // background, not true alpha. Until a verified transparent PNG/SVG + inverse
  // (white) variant are approved, use this raster logo ONLY on light surfaces
  // (Header). On navy/dark surfaces use ui/Wordmark. See
  // docs/handoff/DIGITAL_DENTISTRY_ASSET_REQUIREMENTS.md §Logo.
  logo: {
    key: "logo",
    title: "Image3DConversion master logo",
    category: "logo",
    // Marked transparent in the manifest, but treat as opaque/white-boxed until
    // re-verified (see warning above). Do not place on dark backgrounds.
    backgroundType: "transparent",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "08-logos-certificates/logo 1.png",
    captureDate: null,
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["header", "footer"],
  },
  planFrontal: {
    key: "planFrontal",
    title: "Guided implant plan (frontal)",
    category: "planning",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "02-3d-planning-screens/Screenshot 2026-01-27 194757.png",
    captureDate: "2026-01-27",
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["guided-implant-workflow", "home:workflows", "home:guide-deck"],
  },
  planAnterior: {
    key: "planAnterior",
    title: "Anterior implant plan over CBCT",
    category: "planning",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "02-3d-planning-screens/Screenshot 2026-01-27 194929.png",
    captureDate: "2026-01-27",
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["case-data-preparation", "global-practices"],
  },
  planRestorative: {
    key: "planRestorative",
    title: "Restoration-led implant plan",
    category: "planning",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "02-3d-planning-screens/Screenshot 2026-01-27 195008.png",
    captureDate: "2026-01-27",
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["home:hero", "case-requirements"],
  },
  segmentation: {
    key: "segmentation",
    title: "Colour-segmented maxillary anatomy with trajectories",
    category: "planning",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "02-3d-planning-screens/full arch.PNG",
    captureDate: null,
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["zygoma-pterygoid-planning", "home:workflows", "home:guide-deck"],
  },
  stackable: {
    key: "stackable",
    title: "Full-arch stackable guide sequence",
    category: "guide",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "04-full-arch-stackable/Screenshot 2025-11-11 130558.png",
    captureDate: "2025-11-11",
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["full-arch-stackable-workflow", "home:workflows", "home:complex-band"],
  },
  muaGuide: {
    key: "muaGuide",
    title: "Full-arch guide with multi-unit abutment positions",
    category: "guide",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "04-full-arch-stackable/Screenshot 2026-03-31 174150.png",
    captureDate: "2026-03-31",
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["immediate-loading-workflow", "home:workflows"],
  },
  printedGuideModel: {
    key: "printedGuideModel",
    title: "3D-printed surgical guide on model",
    category: "guide",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "03-surgical-guides/12.jpg",
    captureDate: null,
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["design-to-delivery", "home:hero-float", "home:guide-deck"],
  },
  printedGuideSleeves: {
    key: "printedGuideSleeves",
    title: "Printed full-arch guide with guided sleeves",
    category: "guide",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "03-surgical-guides/14.jpg",
    captureDate: null,
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["white-label-workflow-partner"],
  },
  stlMesh: {
    key: "stlMesh",
    title: "CAD mesh of a surgical guide design",
    category: "guide",
    backgroundType: "opaque",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "03-surgical-guides/Screenshot 2026-04-25 113528.png",
    captureDate: "2026-04-25",
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-29",
    approvalStatus: "published",
    usageMap: ["design-only-workflow", "home:hero-chip"],
  },
} as const satisfies Record<keyof typeof img, ImageMeta>;

export type ImageMetaKey = keyof typeof imageMeta;
