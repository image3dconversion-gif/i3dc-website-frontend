import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { cta } from "@/content/cta-routes";

export default function NotFound() {
  return (
    <Section width="narrow" className="text-center">
      <p className="font-display text-5xl font-semibold text-brand">404</p>
      <h1 className="mt-4">This page isn’t here.</h1>
      <p className="mx-auto mt-4 max-w-md text-ink">
        The page may have moved. Return home to choose the workflow your case
        needs, or discuss a complex case with the team.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href={cta.discussCase.href} variant="secondary">
          {cta.discussCase.label}
        </ButtonLink>
      </div>
    </Section>
  );
}
