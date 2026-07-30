/**
 * Homepage content — visitor-facing copy only.
 * Source: Image3DConversion_Homepage_Content_Design_Psychology_v1.2.docx.
 * Internal handoff notes from the DOCX are NOT included here (implementation
 * discipline only, per Handoff Summary §7).
 *
 * Images reference the approved, PII-free manifest in src/content/images.ts.
 */
import { img, type Img } from "@/content/images";

export interface WorkflowCard {
  title: string;
  body: string;
  linkLabel: string;
  href: string;
  image: Img;
  /** Short label shown in the panel's software-window chrome bar. */
  panelLabel: string;
}

export interface Step {
  title: string;
  body: string;
}

export interface SupportMode {
  title: string;
  body: string;
  linkLabel: string;
  href: string;
}

export const home = {
  seo: {
    title: "Digital Implant Planning & Surgical Guides | Image3DConversion",
    description:
      "Plan routine and complex guided implant cases with expert digital planning, surgical guides, full-arch workflows and clinician review before production.",
    canonical: "https://www.image3dconversion.com/",
  },

  hero: {
    eyebrow: "DIGITAL IMPLANT PLANNING & SURGICAL GUIDE SERVICES",
    h1: "Plan the outcome. Guide the execution.",
    body: "Begin with the smile you intend to restore. Image3DConversion helps coordinate the aesthetic and prosthetic objective with function, biology, anatomy, implant planning, guide design and the approved route to delivery. Your treatment plan remains under your approval at every critical stage.",
    utility: "Already working with us? Open the Case Portal.",
    professionalNote:
      "Services are provided to dental professionals and authorised workflow partners.",
  },

  smile: {
    h2: "Start with the smile you intend to restore.",
    body: "The smile establishes the destination. Tooth position, proportion, display, lip support and prosthetic form shape the aesthetic objective. Function, occlusion, biology and available anatomy then determine how that objective can be supported responsibly.",
    designOrder: [
      "Smile and facial reference",
      "Aesthetic and prosthetic setup",
      "Function and biology",
      "Anatomy and implant plan",
      "Guided execution",
    ],
  },

  workflows: {
    h2: "Choose the workflow your case needs.",
    intro:
      "Start with the clinical situation. We will show you the records, planning path and deliverables that belong together.",
    cards: [
      {
        title: "Guided Implant Workflow",
        body: "Restoration-led planning and surgical guide support for single and multiple implant cases.",
        linkLabel: "Explore the Guided Implant Workflow",
        href: "/guided-implant-workflow/",
        image: img.planFrontal,
        panelLabel: "Guided implant plan",
      },
      {
        title: "Full-Arch Stackable Workflow",
        body: "A coordinated sequence for bone reduction, implant placement, MUA positioning and provisional delivery.",
        linkLabel: "Explore the Full-Arch Stackable Workflow",
        href: "/full-arch-stackable-workflow/",
        image: img.stackable,
        panelLabel: "Full-arch stackable sequence",
      },
      {
        title: "Zygoma & Pterygoid Planning",
        body: "Advanced planning support where anatomy, implant trajectory and prosthetic intent must be reviewed together.",
        linkLabel: "Review Zygoma & Pterygoid Planning",
        href: "/zygoma-pterygoid-planning/",
        image: img.segmentation,
        panelLabel: "Anatomy & trajectory review",
      },
      {
        title: "Immediate-Loading Workflow",
        body: "Align the approved plan, guide and provisional reference before the surgical appointment.",
        linkLabel: "Review the Immediate-Loading Workflow",
        href: "/immediate-loading-workflow/",
        image: img.muaGuide,
        panelLabel: "Plan · guide · provisional",
      },
    ] as WorkflowCard[],
  },

  differentiation: {
    h2: "The guide is one part of the workflow.",
    body: "A usable guide begins before guide design. The patient data must align. The planned restoration must be visible. The implant system and drilling protocol must be confirmed. The clinician must review the plan. We coordinate those steps before production begins.",
    pullLine: "The guide is the last step, not the point.",
    linkLabel: "See how the case workflow works",
    href: "/how-it-works/",
    layers: [
      "Planned restoration",
      "Anatomy and scan data",
      "Implant / component plan",
      "Guide / provisional design",
      "Approved delivery",
    ],
  },

  steps: {
    h2: "One case. Five visible steps.",
    items: [
      {
        title: "Submit securely",
        body: "Create a practice account and upload the prescription and required case records inside the Case Portal.",
      },
      {
        title: "Validate the data",
        body: "We check file completeness, scan alignment and the information needed for the selected workflow.",
      },
      {
        title: "Review the plan",
        body: "The proposed plan and relevant references are shared for clinician review.",
      },
      {
        title: "Approve production",
        body: "Production begins only after the required approval and scope confirmation.",
      },
      {
        title: "Track delivery",
        body: "Follow the case status and receive files, dispatch details or completion information in one place.",
      },
    ] as Step[],
    responsibilityNote:
      "The treating clinician remains responsible for diagnosis, treatment decisions and final approval.",
    linkLabel: "Review case requirements",
    href: "/case-requirements/",
  },

  support: {
    h2: "Choose how much support your practice needs.",
    modes: [
      {
        title: "Design Only",
        body: "Planning and ready-to-print files for teams with a validated local production workflow.",
        linkLabel: "Review Design-Only Support",
        href: "/design-only-workflow/",
      },
      {
        title: "Design to Delivery",
        body: "Planning, design, production coordination and delivery managed through one case.",
        linkLabel: "Review Design-to-Delivery Support",
        href: "/design-to-delivery/",
      },
      {
        title: "White-Label Workflow Partnership",
        body: "Specialist workflow capacity for laboratories, practice groups, implant companies and international partners.",
        linkLabel: "Discuss a Workflow Partnership",
        href: "/white-label-workflow-partner/",
      },
    ] as SupportMode[],
    sectionLink: "Compare ways to work with us",
    sectionHref: "/digital-implant-workflows/",
  },

  global: {
    h2: "Built to work with practices across borders.",
    body: "Use Image3DConversion as a design partner for validated local production, coordinate design and delivery through one case, or establish a white-label workflow for a practice group, laboratory or implant partner.",
    points: [
      {
        title: "Review without geography",
        body: "Versioned plans, named questions and recorded approvals allow clinical and technical teams to review the same case without sharing one location.",
      },
      {
        title: "Choose the production route",
        body: "Use ready-to-produce files with a validated local workflow or select coordinated production and delivery where the confirmed service scope supports it.",
      },
      {
        title: "Know the responsibility split",
        body: "File preparation, clinical decisions, design, manufacturing checks, shipping and local verification are assigned before work begins.",
      },
    ],
    primaryLink: { label: "Review Global Practice Workflows", href: "/global-practices/" },
    secondaryLink: { label: "Discuss a Workflow Partnership", href: "/white-label-workflow-partner/" },
  },

  complexCase: {
    h2: "Bring us the cases that need more than a template.",
    lead: "A full-arch case is not a collection of products. It is one sequence.",
    body: "Full-arch, immediate-loading, pterygoid and zygomatic cases involve more than implant coordinates. They require a shared understanding of the restorative goal, support strategy, surgical sequence and approval points.",
    sequence: [
      "Pin fixation",
      "Bone reduction",
      "Implant placement",
      "MUA positioning",
      "Prosthesis pickup",
    ],
    closingLine:
      "Discuss the workflow before uploading the complete case if the scope is still being defined.",
    linkLabel: "Explore the Full-Arch Stackable Workflow",
    href: "/full-arch-stackable-workflow/",
  },

  /**
   * Evidence section is gated. Per Homepage §9 NUMERIC PROOF GATE, publish no
   * scale numbers until each is defined + sourced. Release 1 may OMIT this
   * section entirely rather than fill it with stock or invented examples.
   */
  evidence: {
    h2: "Evidence, not adjectives.",
    body: "See what was received, what had to be decided, what the treating team approved and what was delivered. Each published case is de-identified and permission-cleared.",
    filters: ["Guided implant", "Full arch", "Immediate loading", "Zygoma & pterygoid"],
    linkLabel: "View case workflows",
    href: "/case-evidence/",
    releaseGate:
      "Hold until one approved, de-identified case is ready. Do not fill with stock or invented examples.",
  },

  requirements: {
    h2: "Send the right data before planning begins.",
    body: "Requirements change by workflow. Review the DICOM, intraoral scan, bite, prosthetic reference, implant system and supporting records before you submit.",
    checklist: [
      "CBCT DICOM dataset",
      "Intraoral or model scans",
      "Bite record and prosthetic setup where relevant",
      "Clinical photographs for aesthetic and immediate-loading workflows",
      "Implant system, components and drill-kit information",
      "Case prescription, planned surgery date and delivery location",
    ],
    privacyNotice:
      "Do not email or place patient-identifying information in a public enquiry form. Clinical files are submitted only through the Case Portal.",
  },

  /**
   * Case Portal presented as a SEPARATE secure system, not a website step.
   * The public site explains it and links in; no clinical files are handled here.
   */
  casePortal: {
    eyebrow: "A separate secure system",
    h2: "Real cases live in the Case Portal.",
    body: "Case submission, data validation, plan review, approval and tracking happen inside the authenticated Case Portal — a separate secure environment. The public website explains the workflow; the portal runs it. No clinical files are uploaded on this website.",
    threeQuestions: [
      "Where is my case?",
      "What is happening now?",
      "What do I need to do next?",
    ],
    // Neutral status chips illustrate the operational system (no decorative
    // colour; functional status colours stay inside the portal itself).
    statuses: [
      "Submitted",
      "Data check",
      "In planning",
      "Plan ready for review",
      "Approval required",
      "In production",
      "Dispatched / files ready",
    ],
  },

  /** Company positioning / trust — professional, not over-personal. */
  trust: {
    eyebrow: "Who we are",
    h2: "A digital workflow team for guided implantology.",
    body: "Image3DConversion coordinates the digital work that happens before surgery: restoration-led planning, implant and guide design, and the review and approval steps that keep the treating clinician in control. The dentist retains clinical authority; we manage the digital execution around the approved plan. As an India-based, remote-first workflow team, we support practices across India and international partner workflows.",
    points: [
      {
        title: "Planning and design",
        body: "Restoration-led implant planning, guide and provisional design across single, full-arch and advanced anchorage cases.",
      },
      {
        title: "Review and approval",
        body: "Versioned plans, recorded questions and documented approvals before anything moves to production.",
      },
      {
        title: "Production coordination",
        body: "Design-only files for your own workflow, or coordinated production and delivery where scope supports it.",
      },
    ],
  },

  finalAction: {
    h2: "Ready when the case is.",
    body: "Start the case when your records and scope are clear. If the workflow is still being defined, speak with the team first.",
  },
} as const;
