/**
 * Page-section model (CMS-readiness).
 *
 * The vocabulary of section types the site composes pages from. It documents —
 * as types — how a future CMS would drive page composition (a page is an ordered
 * list of typed sections). ADDITIVE: the app still renders sections directly in
 * JSX today; this registry is the contract a CMS `section` collection maps to.
 * See docs/handoff/CMS_READINESS_PLAN.md §3.
 */

export type SectionType =
  | "page-hero"
  | "feature-grid"
  | "service-grid"
  | "workflow-cards"
  | "route-cards"
  | "icon-list"
  | "image-or-slot"
  | "guide-deck"
  | "reveal-steps"
  | "portal-band"
  | "portal-mock"
  | "role-trust"
  | "prose"
  | "sticky-subnav"
  | "cta";

export interface SectionMeta {
  type: SectionType;
  /** Human label for a CMS editor. */
  label: string;
  /** True if the section renders imagery (subject to the asset publish gate). */
  usesImages: boolean;
  /** Rendering component (documentation pointer, not an import). */
  component: string;
}

export const sectionRegistry: Record<SectionType, SectionMeta> = {
  "page-hero": { type: "page-hero", label: "Page hero", usesImages: true, component: "sections/PageHero + sections/Hero" },
  "feature-grid": { type: "feature-grid", label: "Feature card grid", usesImages: false, component: "ui/FeatureGrid" },
  "service-grid": { type: "service-grid", label: "Service card grid", usesImages: false, component: "sections/ServiceGrid" },
  "workflow-cards": { type: "workflow-cards", label: "Workflow image cards", usesImages: true, component: "sections/WorkflowCards" },
  "route-cards": { type: "route-cards", label: "Route selector cards", usesImages: false, component: "sections/RouteCards" },
  "icon-list": { type: "icon-list", label: "Icon list", usesImages: false, component: "ui/IconList" },
  "image-or-slot": { type: "image-or-slot", label: "Image or labelled slot", usesImages: true, component: "ui/ImageOrSlot" },
  "guide-deck": { type: "guide-deck", label: "Layered planning deck", usesImages: true, component: "sections/GuideWorkflow" },
  "reveal-steps": { type: "reveal-steps", label: "Numbered step cards (reveal)", usesImages: false, component: "inline (.reveal-up)" },
  "portal-band": { type: "portal-band", label: "Case Portal explainer band", usesImages: false, component: "sections/CasePortalBand" },
  "portal-mock": { type: "portal-mock", label: "Synthetic portal UI (DeviceFrame)", usesImages: false, component: "sections/PortalMock + ui/DeviceFrame" },
  "role-trust": { type: "role-trust", label: "Role/function trust block", usesImages: false, component: "sections/RoleTrust" },
  prose: { type: "prose", label: "Prose block", usesImages: false, component: "ui/Section + markup" },
  "sticky-subnav": { type: "sticky-subnav", label: "In-page section nav", usesImages: false, component: "ui/StickySubnav" },
  cta: { type: "cta", label: "Call-to-action block", usesImages: false, component: "ui/Section + ui/Button" },
};

export const sectionTypes = Object.keys(sectionRegistry) as SectionType[];
