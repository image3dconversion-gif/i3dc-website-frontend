import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PlanningPanel } from "@/components/ui/PlanningPanel";
import type { Img } from "@/content/images";

interface CtaSpec {
  label: string;
  href: string;
  external?: boolean;
}

interface PageHeroProps {
  eyebrow: string;
  h1: string;
  body: string;
  note?: string;
  primary: CtaSpec;
  secondary?: CtaSpec;
  /** Optional planning-panel visual on the right (app-window framed). */
  image?: Img;
  imageLabel?: string;
}

/**
 * Standard interior-page hero on the accepted visual system: white-led wash,
 * blueprint backdrop + brand-blue corner brackets around an app-window planning
 * panel when an image is supplied. Copy-first on mobile.
 */
export function PageHero({
  eyebrow,
  h1,
  body,
  note,
  primary,
  secondary,
  image,
  imageLabel,
}: PageHeroProps) {
  return (
    <section className="wash-blue border-b border-line">
      <Container
        className={
          "py-14 md:py-20 " +
          (image ? "grid items-center gap-12 lg:grid-cols-[46fr_54fr]" : "max-w-[var(--content-narrow)]")
        }
      >
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1>{h1}</h1>
          <p className="mt-5 max-w-xl text-lg text-ink">{body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primary.href} external={primary.external}>
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink href={secondary.href} variant="secondary" external={secondary.external}>
                {secondary.label}
              </ButtonLink>
            )}
          </div>
          {note && <p className="mt-6 max-w-xl text-xs leading-relaxed text-muted">{note}</p>}
        </div>

        {image && (
          <div className="relative">
            <div
              aria-hidden
              className="blueprint pointer-events-none absolute -inset-5 -z-10 rounded-[var(--radius-card)] border border-line [mask-image:radial-gradient(85%_85%_at_55%_45%,black,transparent)]"
            />
            <span aria-hidden className="absolute -left-2 -top-2 z-10 h-7 w-7 rounded-tl-[var(--radius-sm)] border-l-2 border-t-2 border-brand/50" />
            <span aria-hidden className="absolute -bottom-2 -right-2 z-10 h-7 w-7 rounded-br-[var(--radius-sm)] border-b-2 border-r-2 border-brand/50" />
            <PlanningPanel image={image} ratio="16/11" label={imageLabel} priority sizes="(max-width: 1024px) 100vw, 560px" />
          </div>
        )}
      </Container>
    </section>
  );
}
