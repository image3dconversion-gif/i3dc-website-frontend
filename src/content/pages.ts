/**
 * Page registry (CMS-readiness).
 *
 * A CMS-shaped map of the site's composed pages: route, SEO metadata and the
 * ordered section types each page is built from (see ./sections.ts). ADDITIVE —
 * pages still declare their own metadata in each route's `page.tsx` today; this
 * registry mirrors that as the `page` collection a CMS would populate, and makes
 * page composition inspectable in one place. See docs/handoff/CMS_READINESS_PLAN.md.
 *
 * The 10 workflow/support detail pages are NOT enumerated section-by-section
 * here: they are generated from `src/content/pages/workflows.ts` through the
 * shared `WorkflowPage` template, so their composition is defined once by that
 * template (see `workflowTemplateSections`).
 */
import type { SectionType } from "./sections";

export interface PageMeta {
  /** Route folder / stable slug. */
  slug: string;
  /** Canonical path (trailing slash to match the site style). */
  path: string;
  title: string;
  description: string;
  /** Ordered section composition (documentation of what the page renders). */
  sections: SectionType[];
  /** Whether the page's copy is intended to be CMS-editable. */
  editable: boolean;
  /** Governance-sensitive pages get extra review before any CMS edit ships. */
  governanceSensitive?: boolean;
}

/** Section order shared by every workflow/support detail page. */
export const workflowTemplateSections: SectionType[] = [
  "page-hero",
  "sticky-subnav",
  "prose",
  "reveal-steps",
  "feature-grid",
  "icon-list",
  "prose",
  "cta",
];

export const pages: PageMeta[] = [
  {
    slug: "home",
    path: "/",
    title: "Digital Implant Planning & Surgical Guides | Image3DConversion",
    description:
      "Plan routine and complex guided implant cases with expert digital planning, surgical guides, full-arch workflows and clinician review before production.",
    sections: [
      "page-hero",
      "image-or-slot",
      "workflow-cards",
      "guide-deck",
      "reveal-steps",
      "feature-grid",
      "feature-grid",
      "prose",
      "feature-grid",
      "portal-band",
      "icon-list",
      "cta",
    ],
    editable: true,
    governanceSensitive: true,
  },
  {
    slug: "about",
    path: "/about/",
    title: "About Image3DConversion | Digital Implant Workflow Company",
    description:
      "A digital implant workflow company supporting guided implant planning, surgical guide design, prosthetic coordination and global practice collaboration.",
    sections: ["page-hero", "prose", "prose", "feature-grid", "role-trust", "feature-grid", "cta"],
    editable: true,
    governanceSensitive: true,
  },
  {
    slug: "digital-implant-workflows",
    path: "/digital-implant-workflows/",
    title: "Digital Implant Workflow Solutions | Image3DConversion",
    description:
      "Choose the right digital implant workflow for guided placement, full-arch, immediate loading, advanced anchorage or design support.",
    sections: ["page-hero", "workflow-cards", "image-or-slot", "service-grid", "cta"],
    editable: true,
  },
  {
    slug: "how-it-works",
    path: "/how-it-works/",
    title: "How Image3DConversion Works | Guided Implant Workflow",
    description:
      "How Image3DConversion supports guided implant planning, case data preparation, design review, approval and delivery workflows.",
    sections: ["page-hero", "reveal-steps", "route-cards", "icon-list", "prose", "cta"],
    editable: true,
  },
  {
    slug: "case-portal",
    path: "/case-portal/",
    title: "Image3DConversion Case Portal | Login & Start a Case",
    description:
      "Access the Case Portal to start, review, approve and track your digital implant workflow.",
    sections: ["page-hero", "portal-mock", "prose", "feature-grid", "prose", "route-cards", "prose"],
    editable: true,
    governanceSensitive: true,
  },
];

/** Lookup by slug. */
export const pageBySlug: Record<string, PageMeta> = Object.fromEntries(
  pages.map((p) => [p.slug, p]),
);
