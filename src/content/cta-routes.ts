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

export type CtaVariant = "primary" | "secondary" | "utility";

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
