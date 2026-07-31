import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { cta as ctaRoutes } from "@/content/cta-routes";

interface CtaSpec {
  label: string;
  href: string;
  external?: boolean;
}

interface CtaBandProps {
  heading: string;
  body?: string;
  primary: CtaSpec;
  secondary?: CtaSpec;
  /** Show the "Open the Case Portal" utility link under the buttons. */
  showPortalLink?: boolean;
}

/**
 * Closing call-to-action on the controlled navy band. Replaces the flat white
 * page-ending CTAs so every page finishes on a strong brand-navy anchor rather
 * than empty white — part of shifting the balance to "navy clinical-tech with
 * controlled white space". Uses inverse buttons for AA contrast on navy.
 */
export function CtaBand({ heading, body, primary, secondary, showPortalLink = false }: CtaBandProps) {
  return (
    <Section tone="invert" width="narrow" className="text-center">
      <h2 className="text-white">{heading}</h2>
      {body && (
        <p className="mx-auto mt-4 max-w-xl text-[var(--text-on-invert)]">{body}</p>
      )}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href={primary.href} external={primary.external} variant="inverse">
          {primary.label}
        </ButtonLink>
        {secondary && (
          <ButtonLink href={secondary.href} external={secondary.external} variant="inverseOutline">
            {secondary.label}
          </ButtonLink>
        )}
      </div>
      {showPortalLink && (
        <p className="mt-5 text-sm">
          <a
            href={ctaRoutes.openPortal.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline underline-offset-4"
          >
            {ctaRoutes.openPortal.label}
          </a>
        </p>
      )}
    </Section>
  );
}
