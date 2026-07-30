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
    src: "/images/logos/i3dc-logo.webp",
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
} as const satisfies Record<string, Img>;
