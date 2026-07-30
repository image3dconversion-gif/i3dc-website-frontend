import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { home } from "@/content/pages/home";
import { img } from "@/content/images";

/**
 * "The guide is one part of the workflow." A stacked deck of real panels
 * (anatomy → implant plan → produced guide) conveys the dependency layers with
 * physical depth, beside the five named layers. This is the page's primary
 * 3D-depth moment.
 */
export function GuideWorkflow() {
  const d = home.differentiation;
  const deck = [
    { image: img.segmentation, label: "Anatomy & scan data" },
    { image: img.planFrontal, label: "Implant & component plan" },
    { image: img.printedGuideModel, label: "Produced guide" },
  ];

  return (
    <Section tone="tint" aria-labelledby="diff-h">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <h2 id="diff-h">{d.h2}</h2>
          <p className="mt-4 max-w-xl text-ink">{d.body}</p>

          <ol className="mt-8 space-y-2">
            {d.layers.map((layer, i) => (
              <li key={layer} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong bg-white text-xs font-bold text-brand">
                  {i + 1}
                </span>
                <span className="font-semibold text-heading">{layer}</span>
              </li>
            ))}
          </ol>

          <p className="mt-8 font-display text-2xl font-semibold text-brand">
            {d.pullLine}
          </p>
          <p className="mt-4">
            <ButtonLink href={d.href} variant="utility">
              {d.linkLabel} →
            </ButtonLink>
          </p>
        </div>

        {/* Stacked panel deck on a blueprint workspace */}
        <div className="relative mx-auto h-[360px] w-full max-w-md sm:h-[420px]">
          <div
            aria-hidden
            className="blueprint pointer-events-none absolute -inset-4 -z-10 rounded-[var(--radius-card)] border border-line [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]"
          />
          {deck.map((panel, i) => {
            const offset = i * 44;
            return (
              <figure
                key={panel.image.src}
                className="media-frame absolute w-[74%]"
                style={{
                  top: `${offset}px`,
                  left: `${offset}px`,
                  zIndex: i + 1,
                }}
              >
                <div className="flex items-center gap-1.5 border-b border-line bg-white px-3 py-2">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-blue-200" />
                  <span aria-hidden className="h-2 w-2 rounded-full bg-blue-200" />
                  <span className="ml-1 truncate text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {panel.label}
                  </span>
                </div>
                <div className="relative aspect-[16/10] w-full bg-blue-900">
                  <Image
                    src={panel.image.src}
                    alt={panel.image.alt}
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                  <span aria-hidden className="panel-cohere" />
                </div>
              </figure>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
