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
  // Updated 2026-07-31: now a verified TRUE-ALPHA transparent logo
  // (logo-transparent.png → i3dc-logo-transparent.webp). It is a single-colour
  // NAVY mark, so it has contrast on LIGHT surfaces only (Header ✓). On
  // navy/dark surfaces it is nearly invisible — keep ui/Wordmark there until a
  // WHITE/inverse variant is provided. See
  // docs/handoff/DIGITAL_DENTISTRY_ASSET_REQUIREMENTS.md §Logo.
  logo: {
    key: "logo",
    title: "Image3DConversion master logo",
    category: "logo",
    // True alpha now; navy ink → light backgrounds only. Do not place on navy.
    backgroundType: "transparent",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "10-logo-assets/logo-transparent.png",
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
  // White/inverse logo for DARK surfaces (extracted from "logo 2" white-on-blue
  // JPG → transparent white). Do NOT use on light surfaces (invisible). Not yet
  // placed — available for navy CTA bands/heroes.
  logoInverse: {
    key: "logoInverse",
    title: "Image3DConversion logo — white/inverse",
    category: "logo",
    backgroundType: "transparent",
    focalPoint: { x: 0.5, y: 0.5 },
    source: "10-logo-assets/logo 2.jpg",
    captureDate: null,
    license: "owned",
    personVisible: false,
    consentStatus: "not-required",
    consentRef: null,
    piiSafe: true,
    piiReviewer: "frontend-architect",
    piiDate: "2026-07-31",
    approvalStatus: "approved",
    usageMap: ["available:dark-surfaces"],
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

  // ── Wave 13 premium cut-outs. Transparent, de-identified renders / produced
  // output. Screened per IMAGE3DCONVERSION_PREMIUM_ASSET_DIRECTION.md §4 (no
  // face, no third-party UI, no clinic branding, no watermark, no burned-in
  // text). Gloved hands only — no identifiable person, so consent not required.
  // approvalStatus "approved" (approved-safe + integrated); founder sign-off
  // moves them to "published". EXIF stripped at the processing step.
  ...(() => {
    const base = {
      category: "guide" as ImageCategory,
      backgroundType: "transparent" as BackgroundType,
      focalPoint: { x: 0.5, y: 0.5 },
      captureDate: null,
      license: "owned" as LicenseStatus,
      personVisible: false,
      consentStatus: "not-required" as ConsentStatus,
      consentRef: null,
      piiSafe: true,
      piiReviewer: "frontend-architect",
      piiDate: "2026-07-31",
      approvalStatus: "approved" as ApprovalStatus,
    };
    return {
      pHeroImplantPlan: { ...base, key: "pHeroImplantPlan", title: "Translucent jaw anatomy with planned implants", category: "planning", source: "premium-images/03-implant-planning/3d implant planning .png", usageMap: ["available:home-hero-composition"] },
      pGuideCadMesh: { ...base, key: "pGuideCadMesh", title: "Surgical guide CAD mesh", source: "premium-images/02-stl-models/MESH-DESIGN-SURGICAL-GUIDE.png", usageMap: ["design-only-workflow:hero"] },
      pGuideFullArch: { ...base, key: "pGuideFullArch", title: "Metal full-arch surgical guide with sleeves", source: "premium-images/05-surgical-guide/METAL-GUUIDE-IMPLANT-PLACEMENT.png", usageMap: ["guided-implant-workflow:gallery"] },
      pGuideMetalArch: { ...base, key: "pGuideMetalArch", title: "Metal-reinforced full-arch guide with pins", source: "premium-images/05-surgical-guide/METALGUIDE.png", usageMap: ["immediate-loading-workflow:gallery"] },
      pGuideSingleScan: { ...base, key: "pGuideSingleScan", title: "Single-implant guide on a scan model", source: "premium-images/05-surgical-guide/single implant guide.png", usageMap: ["guided-implant-workflow:gallery"] },
      pGuideInHand: { ...base, key: "pGuideInHand", title: "Printed surgical guide in a gloved hand", source: "premium-images/05-surgical-guide/surgical-guide-hand.png", usageMap: ["guided-implant-workflow:gallery"] },
      pGuidePartInHand: { ...base, key: "pGuidePartInHand", title: "Printed guide component in gloved hands", source: "premium-images/05-surgical-guide/surgical-guide-hand-2.png", usageMap: ["white-label-workflow-partner:hero"] },
      pStackableGrey: { ...base, key: "pStackableGrey", title: "Stackable full-arch guide, exploded (grey)", source: "premium-images/06-full-arch-stackable/stackable system-black-white.png", usageMap: ["home:complex-band", "full-arch-stackable-workflow:gallery"] },
      pStackableMetalModel: { ...base, key: "pStackableMetalModel", title: "Stackable guide and framework on model", source: "premium-images/06-full-arch-stackable/METAL-GUIDE-IMMEDIATE-LOADING-STACKABLE-WORKFLOW.png", usageMap: ["full-arch-stackable-workflow:gallery", "design-to-delivery:gallery"] },
      pProsthesisInHand: { ...base, key: "pProsthesisInHand", title: "Full-arch prosthesis on bar, in a gloved hand", category: "implant", source: "premium-images/05-surgical-guide/METAL-GUIDE-STACKABLE+HAND.png", usageMap: ["design-to-delivery:gallery"] },
      pProsthesisOcclusion: { ...base, key: "pProsthesisOcclusion", title: "Full-arch prosthesis in occlusion on model", category: "implant", source: "premium-images/04-prosthetic-abutment/METAL-GUIDE-STACKABLE-WORKFLOW+PROSTHESIS+OCCLUSION.png", usageMap: ["full-arch-stackable-workflow:gallery", "immediate-loading-workflow:gallery"] },
      pImplantAbutment: { ...base, key: "pImplantAbutment", title: "Dental implant and multi-unit abutment", category: "implant", source: "premium-images/04-prosthetic-abutment/GUIDE_TEETH_IMPLANT.png", usageMap: ["available"] },
      pTemporaryProsthesis: { ...base, key: "pTemporaryProsthesis", title: "Printed temporary full-arch prosthesis", category: "implant", source: "premium-images/04-prosthetic-abutment/STRONG-TEMPORARY-PROSTHESIS.png", usageMap: ["immediate-loading-workflow:gallery"] },
      pImplantTitanium: { ...base, key: "pImplantTitanium", title: "Titanium dental implant (product view)", category: "implant", source: "premium-images/03-implant-planning/titanium implant-dental.png", usageMap: ["available"] },
      pImplantTitaniumGold: { ...base, key: "pImplantTitaniumGold", title: "Titanium implant with gold connection", category: "implant", source: "premium-images/99-review-unsorted/Untitled design.png", usageMap: ["available"], caption: "Passed a full-resolution + corner PII screen; distinct from the excluded 'Untitled design (3)' file." },
      pPrintedBoneModels: { ...base, key: "pPrintedBoneModels", title: "3D-printed anatomical bone models", category: "lab", source: "premium-images/02-stl-models/PRINTED-BONE-MODEL+ZYGOMA+GUIDE.png", usageMap: ["zygoma-pterygoid-planning:gallery", "design-to-delivery:gallery"] },
      pPrintedZygomaGuides: { ...base, key: "pPrintedZygomaGuides", title: "Printed zygomatic model with surgical guides", category: "lab", source: "premium-images/05-surgical-guide/ZYGOMAUIDE+STABILISATION+PIN+VERIFICATION+ACCURACY+ON+HAND.png", usageMap: ["digital-implant-workflows:production", "zygoma-pterygoid-planning:gallery"] },
      pZygomaImplantPlan: { ...base, key: "pZygomaImplantPlan", title: "Zygomatic implant plan render", category: "planning", backgroundType: "opaque", source: "premium-images/03-implant-planning/zygomatic-implant-planning.png", usageMap: ["zygoma-pterygoid-planning:hero"] },
      pStackableGuided: { ...base, key: "pStackableGuided", title: "Exploded full-arch stackable guide system", source: "premium-images/06-full-arch-stackable/stackable guided- 2.png", usageMap: ["full-arch-stackable-workflow:hero"], caption: "Founder-directed use of the §6-held graded (pink/purple/rainbow) stackable render; processed without colour-grade. Brand note: saturated grade is off the neutral-cool palette — neutral grey alternative is img.pStackableGrey." },
      pAboutImplantPlan: { ...base, key: "pAboutImplantPlan", title: "Digital implant planning render", category: "planning", backgroundType: "opaque", source: "premium-images/03-implant-planning/implant-planning-picture.png", usageMap: ["about:hero"] },
      pZygomaPlanning3d: { ...base, key: "pZygomaPlanning3d", title: "Zygomatic implant planning render", category: "planning", backgroundType: "opaque", source: "premium-images/03-implant-planning/ZYGOMA-PLANNING-3D.png", usageMap: ["home:workflows-card-zygoma"] },
    };
  })(),
} as const satisfies Record<keyof typeof img, ImageMeta>;

export type ImageMetaKey = keyof typeof imageMeta;
