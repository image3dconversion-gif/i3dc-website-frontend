/**
 * Service data model (CMS-readiness).
 *
 * A normalised, CMS-shaped view of the services/workflows the site offers.
 * It DERIVES from the existing authored content (`workflows.ts`, `home.ts`) and
 * is ADDITIVE — pages continue to render from their current modules. Its purpose
 * is to give a future CMS a single `service` collection to populate, and to let
 * new UI (e.g. a Solutions comparison/selector) read one typed source instead of
 * re-deriving from page copy. See docs/handoff/CMS_READINESS_PLAN.md §3.
 *
 * No claims, numbers, or patient data. Slugs/routes mirror the existing routes
 * and are treated as locked (not CMS-editable).
 */
import type { ImageMetaKey } from "@/content/image-meta";

/** How much of the workflow the practice hands to I3DC. */
export type EngagementModel = "design-only" | "design-to-delivery" | "white-label";

/** Where a service sits in the information architecture. */
export type ServiceGroup = "implant-workflow" | "way-to-work" | "capability";

export interface Service {
  /** Stable slug — matches the route folder; locked. */
  slug: string;
  /** Route path (trailing slash to match existing canonical style). */
  href: string;
  name: string;
  /** One-line summary for cards / menus (no claims). */
  summary: string;
  group: ServiceGroup;
  /** Who the service is primarily for. */
  audience: string[];
  /** Engagement models this service supports. */
  engagement: EngagementModel[];
  /** Manifest key for the primary supporting visual (or null → labelled slot). */
  imageKey: ImageMetaKey | null;
  /** Primary CTA intent — resolved to a concrete CTA in `cta-routes.ts`. */
  primaryCta: "start-case" | "discuss-case" | "review-requirements";
  /** Related service slugs (cross-linking / "you might also need"). */
  related: string[];
}

export const services: Service[] = [
  {
    slug: "guided-implant-workflow",
    href: "/guided-implant-workflow/",
    name: "Guided Implant Workflow",
    summary:
      "Restoration-led planning and surgical guide support for single and multiple implant cases.",
    group: "implant-workflow",
    audience: ["General & implant dentists", "Practices placing single & multiple implants"],
    engagement: ["design-only", "design-to-delivery"],
    imageKey: "planFrontal",
    primaryCta: "start-case",
    related: ["case-data-preparation", "design-only-workflow", "design-to-delivery"],
  },
  {
    slug: "full-arch-stackable-workflow",
    href: "/full-arch-stackable-workflow/",
    name: "Full-Arch Stackable Workflow",
    summary:
      "One planned sequence for bone reduction, implant placement, MUA positioning and provisional delivery.",
    group: "implant-workflow",
    audience: ["Full-arch surgeons", "Implant & prosthodontic teams"],
    engagement: ["design-to-delivery", "white-label"],
    imageKey: "stackable",
    primaryCta: "discuss-case",
    related: ["immediate-loading-workflow", "zygoma-pterygoid-planning", "design-to-delivery"],
  },
  {
    slug: "zygoma-pterygoid-planning",
    href: "/zygoma-pterygoid-planning/",
    name: "Zygoma & Pterygoid Planning",
    summary:
      "Advanced anchorage planning where anatomy, implant trajectory and prosthetic intent must agree.",
    group: "implant-workflow",
    audience: ["Advanced full-arch & zygomatic surgeons"],
    engagement: ["design-to-delivery"],
    imageKey: "segmentation",
    primaryCta: "discuss-case",
    related: ["full-arch-stackable-workflow", "case-data-preparation"],
  },
  {
    slug: "immediate-loading-workflow",
    href: "/immediate-loading-workflow/",
    name: "Immediate-Loading Workflow",
    summary:
      "Align the approved plan, guide and provisional reference before the loading appointment.",
    group: "implant-workflow",
    audience: ["Teams delivering immediate provisionals"],
    engagement: ["design-to-delivery"],
    imageKey: "muaGuide",
    primaryCta: "review-requirements",
    related: ["full-arch-stackable-workflow", "case-requirements"],
  },
  {
    slug: "case-data-preparation",
    href: "/case-data-preparation/",
    name: "Case Data & Diagnostic Preparation",
    summary: "DICOM handling, CBCT segmentation, scan alignment — a clean planning starting point.",
    group: "capability",
    audience: ["Any practice submitting CBCT/IOS records"],
    engagement: ["design-only", "design-to-delivery"],
    imageKey: "planAnterior",
    primaryCta: "review-requirements",
    related: ["guided-implant-workflow", "case-requirements"],
  },
  {
    slug: "design-only-workflow",
    href: "/design-only-workflow/",
    name: "Design-Only Workflow",
    summary: "Reviewed, ready-to-print planning and guide files for your own validated production.",
    group: "way-to-work",
    audience: ["Practices & labs with local printing"],
    engagement: ["design-only"],
    imageKey: "stlMesh",
    primaryCta: "start-case",
    related: ["guided-implant-workflow", "design-to-delivery"],
  },
  {
    slug: "design-to-delivery",
    href: "/design-to-delivery/",
    name: "Design-to-Delivery Workflow",
    summary: "Planning, design, production checks and delivery coordinated through one visible case.",
    group: "way-to-work",
    audience: ["Practices wanting an end-to-end route"],
    engagement: ["design-to-delivery"],
    imageKey: "printedGuideModel",
    primaryCta: "start-case",
    related: ["guided-implant-workflow", "full-arch-stackable-workflow"],
  },
  {
    slug: "white-label-workflow-partner",
    href: "/white-label-workflow-partner/",
    name: "White-Label Workflow Partnership",
    summary:
      "Workflow capacity behind your brand — for laboratories, DSOs, implant systems and networks.",
    group: "way-to-work",
    audience: ["Laboratories", "DSOs & practice groups", "Implant systems & distributors"],
    engagement: ["white-label", "design-only", "design-to-delivery"],
    imageKey: "printedGuideSleeves",
    primaryCta: "discuss-case",
    related: ["design-to-delivery", "global-practices"],
  },
  {
    slug: "global-practices",
    href: "/global-practices/",
    name: "Global Practice Workflows",
    summary:
      "Review, production and responsibility options for practices across borders — shown through operating detail.",
    group: "capability",
    audience: ["International & multi-location practices"],
    engagement: ["design-only", "design-to-delivery", "white-label"],
    imageKey: "planAnterior",
    primaryCta: "discuss-case",
    related: ["white-label-workflow-partner", "design-to-delivery"],
  },
];

/** Lookup by slug for cross-linking. */
export const serviceBySlug: Record<string, Service> = Object.fromEntries(
  services.map((s) => [s.slug, s]),
);

export const implantWorkflows = services.filter((s) => s.group === "implant-workflow");
export const waysToWork = services.filter((s) => s.group === "way-to-work");
