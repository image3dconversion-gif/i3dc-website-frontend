/**
 * Approved image manifest. Every entry is a web-ready, PII-free asset produced
 * by scripts/process-images.mjs from a source vetted in
 * docs/handoff/IMAGE_ASSET_AUDIT.md. Dimensions are the real output sizes so
 * next/image can reserve space (no layout shift). Alt text is factual and
 * matches the actual image.
 *
 * NONE of these contain a patient name, age, clinic, DICOM/case ID or visible
 * patient identity — the PII-bearing and off-journey sources are excluded at
 * the processing step and never reach public/images.
 */
export interface Img {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const img = {
  logo: {
    src: "/images/logos/i3dc-logo-transparent.webp",
    width: 1000,
    height: 263,
    alt: "Image3DConversion",
  },

  // White/inverse logo (extracted from "logo 2" white-on-blue → transparent
  // white). For DARK surfaces only (navy CTA bands/heroes); invisible on light.
  logoInverse: {
    src: "/images/logos/i3dc-logo-white.webp",
    width: 1000,
    height: 250,
    alt: "Image3DConversion",
  },

  // Real 3D implant / anatomy planning views (de-identified viewports).
  planFrontal: {
    src: "/images/planning/implant-plan-frontal.webp",
    width: 1071,
    height: 771,
    alt: "3D implant plan showing guided implant positions against a prosthetic setup.",
  },
  planAnterior: {
    src: "/images/planning/implant-plan-anterior.webp",
    width: 1147,
    height: 790,
    alt: "Anterior 3D implant plan with restoration reference over CBCT anatomy.",
  },
  planRestorative: {
    src: "/images/planning/implant-plan-restorative.webp",
    width: 1143,
    height: 834,
    alt: "Restoration-led implant plan aligning tooth setup with implant positions.",
  },
  segmentation: {
    src: "/images/planning/full-arch-segmentation.webp",
    width: 964,
    height: 815,
    alt: "Colour-segmented maxillary anatomy with planned implant trajectories.",
  },

  // Full-arch stackable guide renders.
  stackable: {
    src: "/images/full-arch/stackable-sequence.webp",
    width: 875,
    height: 724,
    alt: "Stackable full-arch guide layers for reduction, implant placement and prosthetic reference.",
  },
  muaGuide: {
    src: "/images/full-arch/mua-guide.webp",
    width: 868,
    height: 534,
    alt: "Full-arch guide with multi-unit abutment positions and prosthetic teeth reference.",
  },

  // Physical guides + CAD.
  printedGuideModel: {
    src: "/images/guides/printed-guide-model.webp",
    width: 600,
    height: 600,
    alt: "3D-printed surgical guide with metal sleeves seated on an anatomical model.",
  },
  printedGuideSleeves: {
    src: "/images/guides/printed-guide-sleeves.webp",
    width: 600,
    height: 600,
    alt: "Close-up of a printed full-arch surgical guide with guided sleeves.",
  },
  stlMesh: {
    src: "/images/guides/guide-stl-mesh.webp",
    width: 1027,
    height: 739,
    alt: "CAD mesh of a surgical guide design ready for production.",
  },

  // ── Wave 13 premium cut-outs (transparent, from assets-source/premium-images) ──
  // Approved-safe per IMAGE3DCONVERSION_PREMIUM_ASSET_DIRECTION.md §3–7. Every
  // one is a de-identified render or produced-output cut-out: no patient face,
  // no third-party UI, no clinic branding, no watermark, no burned-in text.
  // Dimensions are the real trimmed output sizes. Show these with `contain` on a
  // brand ground (CutoutFrame) — never `cover` (would crop the subject).
  pHeroImplantPlan: {
    src: "/images/premium/hero-implant-planning.webp",
    width: 798,
    height: 667,
    alt: "Translucent jaw anatomy with planned implant positions and a prosthetic teeth reference.",
  },
  pGuideCadMesh: {
    src: "/images/premium/workflow-guide-cad-mesh.webp",
    width: 537,
    height: 362,
    alt: "CAD mesh of a full-arch surgical guide design in a shaded model view.",
  },
  pGuideFullArch: {
    src: "/images/premium/surgical-guide-full-arch.webp",
    width: 808,
    height: 518,
    alt: "Metal full-arch surgical guide with guided sleeves and fixation positions.",
  },
  pGuideMetalArch: {
    src: "/images/premium/surgical-guide-metal-arch.webp",
    width: 429,
    height: 363,
    alt: "Metal-reinforced full-arch surgical guide with stabilisation pins.",
  },
  pGuideSingleScan: {
    src: "/images/premium/surgical-guide-single-scan.webp",
    width: 594,
    height: 404,
    alt: "Single-implant surgical guide over a colour-mapped intraoral scan model.",
  },
  pGuideInHand: {
    src: "/images/premium/surgical-guide-in-hand.webp",
    width: 896,
    height: 629,
    alt: "3D-printed surgical guide held in a gloved hand.",
  },
  pGuidePartInHand: {
    src: "/images/premium/surgical-guide-part-in-hand.webp",
    width: 821,
    height: 526,
    alt: "Printed surgical guide component inspected in gloved hands.",
  },
  pStackableGrey: {
    src: "/images/premium/fullarch-stackable-grey.webp",
    width: 420,
    height: 386,
    alt: "Exploded view of a full-arch stackable guide system in neutral grey.",
  },
  pStackableMetalModel: {
    src: "/images/premium/fullarch-stackable-metal-model.webp",
    width: 611,
    height: 478,
    alt: "Full-arch stackable guide and metal framework seated on an anatomical model.",
  },
  pProsthesisInHand: {
    src: "/images/premium/fullarch-prosthesis-in-hand.webp",
    width: 608,
    height: 640,
    alt: "Full-arch implant prosthesis on a bar framework, held in a gloved hand.",
  },
  pProsthesisOcclusion: {
    src: "/images/premium/fullarch-prosthesis-occlusion.webp",
    width: 516,
    height: 464,
    alt: "Full-arch implant prosthesis in occlusion on an articulated model.",
  },
  pImplantAbutment: {
    src: "/images/premium/services-implant-abutment.webp",
    width: 1042,
    height: 403,
    alt: "Dental implant and multi-unit abutment shown as clean product views.",
  },
  pTemporaryProsthesis: {
    src: "/images/premium/services-temporary-prosthesis.webp",
    width: 519,
    height: 773,
    alt: "Printed temporary full-arch prosthesis held in a gloved hand.",
  },
  pImplantTitanium: {
    src: "/images/premium/implant-titanium.webp",
    width: 196,
    height: 601,
    alt: "Titanium dental implant, product view.",
  },
  pImplantTitaniumGold: {
    src: "/images/premium/implant-titanium-gold.webp",
    width: 135,
    height: 602,
    alt: "Titanium dental implant with a gold internal connection, product view.",
  },
  pPrintedBoneModels: {
    src: "/images/premium/production-printed-bone-models.webp",
    width: 708,
    height: 347,
    alt: "3D-printed anatomical bone models produced alongside a zygomatic guide.",
  },
  pPrintedZygomaGuides: {
    src: "/images/premium/production-printed-zygoma-guides.webp",
    width: 943,
    height: 792,
    alt: "3D-printed zygomatic anatomy model with surgical guides, held in gloved hands.",
  },

  // Opaque zygomatic planning render (dark ground baked in — shown via the
  // cover PlanningPanel, not CutoutFrame). Neutral cool tones; not the held
  // green/orange anatomy renders.
  pZygomaImplantPlan: {
    src: "/images/premium/zygomatic-implant-planning.webp",
    width: 1600,
    height: 900,
    alt: "Zygomatic implant plan: four zygomatic implants engaging the zygomatic buttress with a full-arch prosthesis, shown over translucent skull anatomy.",
  },

  // Transparent exploded stackable render (founder-directed; §6 graded-colour
  // asset — see image-meta note). Shown via CutoutFrame on a clean panel.
  pStackableGuided: {
    src: "/images/premium/fullarch-stackable-guided.webp",
    width: 819,
    height: 700,
    alt: "Exploded view of a prosthetic-driven full-arch stackable guide system, showing the stacked guide layers, connectors and prosthetic set.",
  },

  // Opaque implant-planning render (dark ground baked in — shown via cover
  // PlanningPanel). Neutral cool tones; About hero.
  pAboutImplantPlan: {
    src: "/images/premium/implant-planning-picture.webp",
    width: 1600,
    height: 900,
    alt: "Digital implant plan: dental implants and gold abutments supporting a full-arch prosthesis over translucent jaw anatomy.",
  },

  // Opaque zygomatic planning render (dark ground baked in — cover treatment).
  // Neutral cool tones; homepage Zygoma & Pterygoid workflow card.
  pZygomaPlanning3d: {
    src: "/images/premium/zygoma-planning-3d.webp",
    width: 1400,
    height: 788,
    alt: "Zygomatic implant plan: four zygomatic implants and multi-unit abutments supporting a full-arch prosthesis over translucent skull anatomy.",
  },
} as const satisfies Record<string, Img>;
