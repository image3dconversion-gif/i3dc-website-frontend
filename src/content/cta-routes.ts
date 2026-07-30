/**
 * Canonical CTA definitions. One place to change label + destination so the
 * primary/secondary/utility action discipline stays consistent site-wide.
 *
 * CTA discipline (Homepage v1.2 §1): Primary = Start a Case,
 * Secondary = Discuss a Complex Case, Utility = Open the Case Portal.
 * No fourth competing CTA above the footer.
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
    label: "Start a Case",
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
    label: "Open the Case Portal",
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
