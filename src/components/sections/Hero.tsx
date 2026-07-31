import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PlanningPanel } from "@/components/ui/PlanningPanel";
import { cta } from "@/content/cta-routes";
import { home } from "@/content/pages/home";
import { img } from "@/content/images";

/**
 * Homepage hero. Copy ~42% / layered planning visual ~58% on desktop; on mobile
 * the copy + primary CTA come first, the visual follows. The visual is a real
 * de-identified planning panel with a floating printed-guide card overlapping
 * it — planning → product, with clinical depth (Homepage §3).
 */
export function Hero() {
  const { hero } = home;
  return (
    <section className="wash-blue border-b border-line">
      <Container className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[43fr_57fr]">
        <div>
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="text-[length:var(--fs-hero)] font-bold leading-[1.03] tracking-[-0.02em]">
            {hero.h1}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink">{hero.body}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={cta.startCase.href} external={cta.startCase.external}>
              {cta.startCase.label}
            </ButtonLink>
            <ButtonLink href={cta.discussCase.href} variant="secondary">
              {cta.discussCase.label}
            </ButtonLink>
          </div>

          <p className="mt-5 text-sm">
            <a
              href={cta.openPortal.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
            >
              {hero.utility}
            </a>
          </p>
          <p className="mt-6 text-xs text-muted">{hero.professionalNote}</p>
        </div>

        {/* Layered visual on a blueprint planning-workspace surface */}
        <div className="relative">
          {/* blueprint grid backdrop for a technical planning-surface feel */}
          <div
            aria-hidden
            className="blueprint pointer-events-none absolute -inset-5 -z-10 rounded-[var(--radius-card)] border border-line [mask-image:radial-gradient(85%_85%_at_60%_45%,black,transparent)]"
          />
          {/* brand-blue technical corner brackets */}
          <span
            aria-hidden
            className="absolute -left-2 -top-2 z-10 h-7 w-7 rounded-tl-[var(--radius-sm)] border-l-2 border-t-2 border-brand/50"
          />
          <span
            aria-hidden
            className="absolute -bottom-2 -right-2 z-10 h-7 w-7 rounded-br-[var(--radius-sm)] border-b-2 border-r-2 border-brand/50"
          />
          <PlanningPanel
            image={img.planRestorative}
            ratio="16/11"
            label="Restoration-led implant plan"
            priority
            sizes="(max-width: 1024px) 100vw, 620px"
          />

          {/* Floating printed-guide card — planning becomes a real product. */}
          <figure className="media-frame absolute -bottom-8 -left-6 w-40 sm:w-52">
            <div className="relative aspect-square w-full bg-blue-900">
              <Image
                src={img.printedGuideModel.src}
                alt={img.printedGuideModel.alt}
                fill
                sizes="200px"
                className="object-cover"
              />
              <span aria-hidden className="panel-cohere" />
            </div>
            <figcaption className="bg-white px-3 py-2 text-[11px] font-semibold text-muted">
              Guided surgical guide, produced from the plan
            </figcaption>
          </figure>

          {/* Small floating CAD-mesh chip, top-right — neutral, extra depth. */}
          <div className="media-frame absolute -right-4 -top-6 hidden w-32 sm:block">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={img.stlMesh.src}
                alt={img.stlMesh.alt}
                fill
                sizes="140px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
