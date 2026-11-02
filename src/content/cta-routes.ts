/**
 * Canonical CTA definitions. One place to change label + destination so the
 * primary/secondary/utility action discipline stays consistent site-wide.
 *
 * CTA discipline (Homepage v1.2 §1): Primary = Request an Invitation,
 * Secondary = Discuss a Complex Case, Utility = Sign In to the Portal.
 * No fourth competing CTA above the footer.
 *
 * PUBLIC AVAILABILITY (MKT-04, 2026-09-22): the Case Portal is LIVE but
 * INVITE-ONLY. Public registration is not open, so the public site offers
 * exactly two portal paths and no third — request an invitation (reviewed by
 * the team), or sign in if the practice is already authorised. The startCase
 * key name is kept so every call site stays wired to one definition.
 */
import { portal } from "./site";
import type { ServiceKey } from "../lib/enquiry/types";

export type CtaVariant = "primary" | "secondary" | "utility";

/**
 * The service each service page offers, as an existing /discuss-a-case/ card key.
 * A page with no unambiguous card has no entry and keeps the plain link: a wrong
 * intent misroutes a lead more damagingly than an absent one.
 */
export const SERVICE_PAGE_KEYS: Readonly<Record<string, ServiceKey>> = {
  "/guided-implant-workflow/": "guided-implant-planning",
  "/full-arch-stackable-workflow/": "full-arch-stackable",
  "/zygoma-pterygoid-planning/": "advanced-case",
  "/immediate-loading-workflow/": "immediate-loading",
  "/design-only-workflow/": "design-only",
  "/design-to-delivery/": "design-to-delivery",
  "/white-label-workflow-partner/": "partnership",
  "/global-practices/": "global-practice",
};

export interface Cta {
  label: string;
  href: string;
  variant: CtaVariant;
  /** Analytics event name (no case/patient identifiers in payload). */
  event?: string;
  /** True when the target is the authenticated portal (separate app). */
  external?: boolean;
}

export const cta = {
  startCase: {
    label: "Request an Invitation",
    href: portal.requestInvitationUrl,
    variant: "primary",
    event: "home_start_case",
    // Same-site anchor now, so it must NOT open a new tab.
    external: false,
  },
  discussCase: {
    label: "Discuss a Complex Case",
    href: "/discuss-a-case/",
    variant: "secondary",
    event: "home_discuss_case",
  },
  openPortal: {
    label: "Sign In to the Portal",
    href: portal.loginUrl,
    variant: "utility",
    event: "home_open_portal",
    external: true,
  },
  reviewRequirements: {
    label: "Review Case Requirements",
    href: "/case-requirements/",
    variant: "secondary",
    event: "home_requirements",
  },
  compareWorkflows: {
    label: "Compare ways to work with us",
    href: "/digital-implant-workflows/",
    variant: "secondary",
  },
} as const satisfies Record<string, Cta>;

/** The Discuss a Case link for a page, carrying that page's service when it has one. */
export function discussCaseHref(pagePath?: string): string {
  const key = pagePath ? SERVICE_PAGE_KEYS[pagePath] : undefined;
  return key ? `${cta.discussCase.href}?service=${key}#form` : cta.discussCase.href;
}
