/**
 * Canonical CTA definitions. One place to change label + destination so the
 * primary/secondary/utility action discipline stays consistent site-wide.
 *
 * CTA discipline (Homepage v1.2 §1): Primary = the Case Portal route,
 * Secondary = Discuss a Complex Case, Utility = the Case Portal explainer.
 * No fourth competing CTA above the footer.
 *
 * PUBLIC AVAILABILITY (MKT-04): the Case Portal has NOT launched. Public labels
 * must state "coming soon" and must never imply open public case intake. The
 * startCase key is kept so every call site stays wired to one definition; its
 * label and destination are the pre-launch route until the portal is live.
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
    label: "Case Portal — Coming Soon",
    href: portal.startCaseUrl,
    variant: "primary",
    event: "home_start_case",
    external: true,
  },
  discussCase: {
    label: "Discuss a Complex Case",
    href: "/discuss-a-case/",
    variant: "secondary",
    event: "home_discuss_case",
  },
  openPortal: {
    label: "About the Case Portal",
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
