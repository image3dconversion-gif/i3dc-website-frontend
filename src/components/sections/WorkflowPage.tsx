import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { IconList } from "@/components/ui/IconList";
import { StickySubnav, type SubnavItem } from "@/components/ui/StickySubnav";
import { PageHero } from "@/components/sections/PageHero";
import { Accordion, type QA } from "@/components/ui/Accordion";
import { cta } from "@/content/cta-routes";
import type { Img } from "@/content/images";

export interface DetailList {
  title: string;
  items: string[];
}

export interface WorkflowContent {
  eyebrow: string;
  h1: string;
  heroBody: string;
  note?: string;
  primary: { label: string; href: string; external?: boolean };
  image?: Img;
  imageLabel?: string;
  /** Optional short intro above the detail grid. */
  intro?: { h2: string; body: string };
  /** Optional visual sequence (rendered as numbered chips on a tint band). */
  sequence?: { h2: string; body?: string; steps: string[] };
  /** Titled bullet lists rendered as a responsive card grid. */
  lists?: DetailList[];
  /** "Where cases commonly stall" — issues caught before planning. */
  commonErrors?: string[];
  /** Optional responsibility / limitation callouts. */
  notes?: string[];
  /** "Discuss the case first if…" — when a conversation should precede submission. */
  discussFirst?: string;
  faq?: QA[];
  ctaHeading?: string;
  ctaBody?: string;
}

/**
 * Shared template for workflow/support detail pages. Uses the accepted visual
 * system (PageHero + planning panel, blueprint tint bands, app-window depth).
 * Content-driven — see src/content/pages/workflows.ts.
 */
export function WorkflowPage({ c }: { c: WorkflowContent }) {
  // Never duplicate the primary: if the page leads with "Discuss", the
  // secondary becomes Start a Case, otherwise it's Discuss a Complex Case.
  const leadsWithDiscuss = c.primary.href === cta.discussCase.href;
  const secondary = leadsWithDiscuss
    ? { label: cta.startCase.label, href: cta.startCase.href, external: true }
    : { label: cta.discussCase.label, href: cta.discussCase.href };

  // In-page section nav — only the sections this page actually renders.
  const subnav: SubnavItem[] = [
    c.intro && { id: "overview", label: "Overview" },
    c.sequence && { id: "sequence", label: "Sequence" },
    c.lists && c.lists.length > 0 && { id: "details", label: "Details" },
    c.commonErrors && c.commonErrors.length > 0 && { id: "watch-outs", label: "Watch-outs" },
    c.faq && c.faq.length > 0 && { id: "faq", label: "FAQ" },
    c.discussFirst && { id: "discuss", label: "Discuss first" },
  ].filter((x): x is SubnavItem => Boolean(x));

  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        h1={c.h1}
        body={c.heroBody}
        note={c.note}
        primary={c.primary}
        secondary={secondary}
        image={c.image}
        imageLabel={c.imageLabel}
      />

      <StickySubnav items={subnav} />

      {c.intro && (
        <Section aria-labelledby="wp-intro" id="overview" className="scroll-mt-28">
          <span aria-hidden className="tech-rule mb-4 block" />
          <div className="max-w-3xl">
            <h2 id="wp-intro">{c.intro.h2}</h2>
            <p className="mt-4 text-ink">{c.intro.body}</p>
          </div>
        </Section>
      )}

      {c.sequence && (
        <Section tone="tint" aria-labelledby="wp-seq" id="sequence" className="scroll-mt-28">
          <h2 id="wp-seq">{c.sequence.h2}</h2>
          {c.sequence.body && <p className="mt-4 max-w-2xl text-ink">{c.sequence.body}</p>}
          <ol className="mt-8 flex flex-wrap gap-3">
            {c.sequence.steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-brand text-xs font-bold text-white">{i + 1}</span>
                <span className="text-sm font-semibold text-heading">{s}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {c.lists && c.lists.length > 0 && (
        <Section aria-labelledby="wp-detail" id="details" className="scroll-mt-28">
          <h2 id="wp-detail" className="sr-only">Workflow detail</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {c.lists.map((l) => (
              <div key={l.title} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-sm)]">
                <h3 className="text-base">{l.title}</h3>
                <IconList className="mt-3" items={l.items} variant="check" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {c.commonErrors && c.commonErrors.length > 0 && (
        <Section tone="tint" aria-labelledby="wp-errors" id="watch-outs" className="scroll-mt-28">
          <div className="max-w-2xl">
            <span aria-hidden className="tech-rule mb-4 block" />
            <h2 id="wp-errors">Where cases commonly stall</h2>
            <p className="mt-4 text-ink">
              These are the issues we check for up front, so a case does not lose time in planning
              or come back for avoidable rework.
            </p>
          </div>
          <IconList
            className="mt-8"
            items={c.commonErrors}
            variant="alert"
            as="cards"
            columns={3}
          />
        </Section>
      )}

      {c.notes && c.notes.length > 0 && (
        <Section tone="tint" aria-labelledby="wp-notes" width="narrow">
          <h2 id="wp-notes" className="sr-only">Important notes</h2>
          <div className="space-y-3">
            {c.notes.map((n) => (
              <p key={n} className="rounded-[var(--radius-card)] border border-line-strong bg-white px-4 py-3 text-sm font-semibold text-heading">
                {n}
              </p>
            ))}
          </div>
        </Section>
      )}

      {c.faq && c.faq.length > 0 && (
        <Section aria-labelledby="wp-faq" width="narrow" id="faq" className="scroll-mt-28">
          <h2 id="wp-faq">Common questions</h2>
          <div className="mt-6">
            <Accordion items={c.faq} />
          </div>
        </Section>
      )}

      {c.discussFirst && (
        <Section aria-labelledby="wp-discuss" width="narrow" id="discuss" className="scroll-mt-28">
          <div className="rounded-[var(--radius-card)] border border-line border-l-4 border-l-brand bg-white p-6 shadow-[var(--shadow-sm)]">
            <h2 id="wp-discuss" className="text-lg">Discuss the case first if…</h2>
            <p className="mt-2 text-sm text-ink">{c.discussFirst}</p>
          </div>
        </Section>
      )}

      <Section aria-labelledby="wp-cta" width="narrow" className="text-center">
        <h2 id="wp-cta">{c.ctaHeading ?? "Ready to move this case forward?"}</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink">
          {c.ctaBody ??
            "Start the case when your records and scope are clear, or discuss the workflow first if it is still being defined."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={c.primary.href} external={c.primary.external}>{c.primary.label}</ButtonLink>
          <ButtonLink href={secondary.href} variant="secondary" external={secondary.external}>{secondary.label}</ButtonLink>
        </div>
        <p className="mt-5 text-sm">
          <a href={cta.openPortal.href} target="_blank" rel="noopener noreferrer" className="font-semibold">
            {cta.openPortal.label}
          </a>
        </p>
      </Section>
    </>
  );
}
