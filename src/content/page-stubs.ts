/**
 * Metadata for pages that are routed and navigable but whose full content is
 * not yet built. Titles / H1s / meta come from Website Strategy Blueprint v1.2
 * §6–7. Each stub renders a real, crawlable page with one primary action so
 * the information architecture is testable end-to-end before copy lands.
 *
 * Building a page = replace its <StubPage> with a real composition and remove
 * the entry here. Release order per Blueprint §14.
 */
import { cta, type Cta } from "./cta-routes";

export interface PageStub {
  slug: string;
  seoTitle: string;
  h1: string;
  eyebrow: string;
  intro: string;
  primaryCta: Cta;
  release: 1 | 2 | 3;
}

export const pageStubs: Record<string, PageStub> = {
  "digital-implant-workflows": {
    slug: "/digital-implant-workflows/",
    seoTitle: "Digital Implant Workflow Solutions | Image3DConversion",
    h1: "Choose the workflow your case needs.",
    eyebrow: "Clinical workflow solutions",
    intro:
      "Start with the clinical objective. Four implant workflows plus four ways of working, grouped by what your case actually needs.",
    primaryCta: cta.compareWorkflows,
    release: 1,
  },
  "guided-implant-workflow": {
    slug: "/guided-implant-workflow/",
    seoTitle: "Dental Implant Planning & Surgical Guide Design | I3DC",
    h1: "Guided implant planning built around the planned restoration.",
    eyebrow: "Guided implant workflow",
    intro:
      "Restoration-led planning and surgical guide support for single and multiple implant cases, with clinician review before production.",
    primaryCta: cta.startCase,
    release: 1,
  },
  "full-arch-stackable-workflow": {
    slug: "/full-arch-stackable-workflow/",
    seoTitle: "Full-Arch Stackable Surgical Guide Workflow | I3DC",
    h1: "One planned sequence for full-arch surgery and provisional delivery.",
    eyebrow: "Full-arch stackable workflow",
    intro:
      "Coordinate bone reduction, implant placement, MUA positioning and provisional delivery through a planned full-arch stackable guide sequence.",
    primaryCta: cta.discussCase,
    release: 1,
  },
  "zygoma-pterygoid-planning": {
    slug: "/zygoma-pterygoid-planning/",
    seoTitle: "Zygomatic & Pterygoid Implant Planning | I3DC",
    h1: "Advanced implant planning where anatomy and restoration must agree.",
    eyebrow: "Zygoma & pterygoid planning",
    intro:
      "Advanced digital planning support for zygomatic and pterygoid implant cases, coordinated around anatomy, restorative intent and clinician approval.",
    primaryCta: cta.discussCase,
    release: 1,
  },
  "immediate-loading-workflow": {
    slug: "/immediate-loading-workflow/",
    seoTitle: "Immediate-Loading Implant & Prosthetic Workflow | I3DC",
    h1: "Align the plan, the guide and the provisional before surgery.",
    eyebrow: "Immediate-loading workflow",
    intro:
      "Coordinate the implant plan, surgical guide and immediate provisional references before the planned loading appointment.",
    primaryCta: cta.reviewRequirements,
    release: 2,
  },
  "case-data-preparation": {
    slug: "/case-data-preparation/",
    seoTitle: "DICOM to STL, CBCT Segmentation & Case Preparation | I3DC",
    h1: "Reliable planning begins with usable case data.",
    eyebrow: "Case data & diagnostic preparation",
    intro:
      "Prepare dental case data with DICOM-to-STL conversion, CBCT segmentation, scan alignment and diagnostic support for digital workflows.",
    primaryCta: cta.reviewRequirements,
    release: 2,
  },
  "design-only-workflow": {
    slug: "/design-only-workflow/",
    seoTitle: "Dental Surgical Guide Design & Ready-to-Print STL | I3DC",
    h1: "Expert design files for your own production workflow.",
    eyebrow: "Design-only workflow",
    intro:
      "Receive reviewed, ready-to-print dental planning and guide files for production through your own validated printing workflow.",
    primaryCta: cta.startCase,
    release: 2,
  },
  "design-to-delivery": {
    slug: "/design-to-delivery/",
    seoTitle: "Implant Planning, Guide Design & Delivery | I3DC",
    h1: "One coordinated path from case data to surgery-ready delivery.",
    eyebrow: "Design-to-delivery workflow",
    intro:
      "Coordinate digital implant planning, guide design, production checks and delivery through one visible case workflow.",
    primaryCta: cta.startCase,
    release: 2,
  },
  "white-label-workflow-partner": {
    slug: "/white-label-workflow-partner/",
    seoTitle: "White-Label Dental Implant Planning Services | I3DC",
    h1: "Add workflow capacity without losing your customer relationship.",
    eyebrow: "White-label workflow partnership",
    intro:
      "Add digital implant planning, guide design and production capacity behind your laboratory, DSO, implant system or international practice network.",
    primaryCta: cta.discussCase,
    release: 2,
  },
  "global-practices": {
    slug: "/global-practices/",
    seoTitle: "Global Practice Workflows | Image3DConversion",
    h1: "Built to work with practices across borders.",
    eyebrow: "Global practice workflows",
    intro:
      "Review, production and responsibility options for international practices — shown through operating detail, not flags or worldwide claims.",
    primaryCta: cta.compareWorkflows,
    release: 2,
  },
  "how-it-works": {
    slug: "/how-it-works/",
    seoTitle: "How Our Digital Implant Workflow Works | I3DC",
    h1: "A visible workflow from case submission to delivery.",
    eyebrow: "How it works",
    intro:
      "See how a case moves from secure submission and data validation to plan review, approval, production and delivery.",
    primaryCta: cta.reviewRequirements,
    release: 1,
  },
  "case-requirements": {
    slug: "/case-requirements/",
    seoTitle: "Dental Implant Case Submission Requirements | I3DC",
    h1: "Send the right data before planning begins.",
    eyebrow: "Case requirements",
    intro:
      "Check the DICOM, intraoral scan, prosthetic reference and case details needed before submitting a guided implant workflow.",
    primaryCta: cta.startCase,
    release: 1,
  },
  "case-evidence": {
    slug: "/case-evidence/",
    seoTitle: "Guided Implant Workflow Case Evidence | Image3DConversion",
    h1: "See the workflow, not only the finished guide.",
    eyebrow: "Case workflows",
    intro:
      "Review anonymised digital implant workflows showing the case objective, records, planning decisions, approvals and delivered components.",
    primaryCta: cta.startCase,
    release: 2,
  },
  about: {
    slug: "/about/",
    seoTitle: "About Image3DConversion | Digital Implant Workflow Team",
    h1: "Built around the work that happens before surgery.",
    eyebrow: "About Image3DConversion",
    intro:
      "The digital workflow team supporting dental professionals with implant planning, surgical guides and complex case coordination.",
    primaryCta: cta.compareWorkflows,
    release: 1,
  },
  "discuss-a-case": {
    slug: "/discuss-a-case/",
    seoTitle: "Discuss a Complex Implant Case | Image3DConversion",
    h1: "Discuss the workflow before you submit the full case.",
    eyebrow: "Discuss a complex case",
    intro:
      "Tell us the workflow you are considering for a full-arch, immediate-loading, zygomatic, pterygoid or other complex implant case. Do not include patient-identifying information or clinical files here.",
    primaryCta: cta.startCase,
    release: 1,
  },
  "case-portal": {
    slug: "/case-portal/",
    seoTitle: "Image3DConversion Case Portal | Secure Case Workflow",
    h1: "Where is my case, what is happening now, and what do I do next?",
    eyebrow: "Case Portal",
    intro:
      "The Case Portal is the secure, authenticated environment for case submission, validation, plan review, approval and tracking. This public page explains its value only — no clinical files are uploaded here.",
    primaryCta: cta.startCase,
    release: 1,
  },
  privacy: {
    slug: "/privacy/",
    seoTitle: "Privacy | Image3DConversion",
    h1: "Privacy notice.",
    eyebrow: "Legal",
    intro: "Public privacy notice. Content pending legal/privacy owner sign-off.",
    primaryCta: cta.discussCase,
    release: 1,
  },
  terms: {
    slug: "/terms/",
    seoTitle: "Terms | Image3DConversion",
    h1: "Terms of service.",
    eyebrow: "Legal",
    intro: "Service terms. Content pending legal owner sign-off.",
    primaryCta: cta.discussCase,
    release: 1,
  },
};
