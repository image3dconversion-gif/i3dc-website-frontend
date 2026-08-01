import { Section } from "@/components/ui/Section";
import { IconList } from "@/components/ui/IconList";
import { StickySubnav, type SubnavItem } from "@/components/ui/StickySubnav";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { CutoutFrame } from "@/components/ui/CutoutFrame";
import { Accordion, type QA } from "@/components/ui/Accordion";
import { FaqPageJsonLd, BreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { cta } from "@/content/cta-routes";
import type { Img } from "@/content/images";

export interface GalleryItem {
  image: Img;
  caption?: string;
  /** Per-item frame aspect ratio (default "4/3"). Use a portrait ratio for a
   *  tall cut-out so it fills the card instead of letterboxing small. */
  ratio?: string;
  /** Per-item inner padding around the subject (default CutoutFrame "p-6"). */
  pad?: string;
}

const galleryCols: Record<2 | 3, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

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
  /** Render the hero image as a transparent cut-out on a bright panel instead of
   *  the cover-cropped dark planning panel (for produced-output cut-outs). */
  heroCutout?: boolean;
  /** Optional short intro above the detail grid. */
  intro?: { h2: string; body: string };
  /** Optional visual sequence (rendered as numbered chips on a tint band). */
  sequence?: { h2: string; body?: string; steps: string[] };
  /** Titled bullet lists rendered as a responsive card grid. */
  lists?: DetailList[];
  /** Optional produced-output cut-outs (real de-identified assets on a brand
   *  ground). Shown as a "Produced output" strip. 2–3 items reads best. */
  gallery?: { h2: string; body?: string; items: GalleryItem[] };
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
export function WorkflowPage({
  c,
}: {
  // `canonical` is carried by the workflows.ts entries; used for breadcrumb SEO.
  c: WorkflowContent & { canonical?: string };
}) {
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
    c.gallery && c.gallery.items.length > 0 && { id: "output", label: "Produced output" },
    c.commonErrors && c.commonErrors.length > 0 && { id: "watch-outs", label: "Watch-outs" },
    c.faq && c.faq.length > 0 && { id: "faq", label: "FAQ" },
    c.discussFirst && { id: "discuss", label: "Discuss first" },
  ].filter((x): x is SubnavItem => Boolean(x));

  return (
    <>
      {c.faq && c.faq.length > 0 && (
        <FaqPageJsonLd items={c.faq.map((f) => ({ q: f.q, a: f.a }))} />
      )}
      {c.canonical && (
        <BreadcrumbJsonLd
          crumbs={[
            { name: "Home", path: "/" },
            { name: "Digital implant workflows", path: "/digital-implant-workflows/" },
            { name: c.h1, path: c.canonical },
          ]}
        />
      )}
      <PageHero
        eyebrow={c.eyebrow}
        h1={c.h1}
        body={c.heroBody}
        note={c.note}
        primary={c.primary}
        secondary={secondary}
        image={c.image}
        imageLabel={c.imageLabel}
        imageCutout={c.heroCutout}
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
            {c.lists.map((l, i) => (
              <div
                key={l.title}
                className="reveal-up rounded-[var(--radius-card)] border border-line-strong bg-white p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-[var(--shadow-float)]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <h3 className="text-base">{l.title}</h3>
                <IconList className="mt-3" items={l.items} variant="check" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {c.gallery && c.gallery.items.length > 0 && (
        <Section aria-labelledby="wp-output" id="output" className="scroll-mt-28">
          <div className="max-w-2xl">
            <span aria-hidden className="tech-rule mb-4 block" />
            <h2 id="wp-output">{c.gallery.h2}</h2>
            {c.gallery.body && <p className="mt-4 text-ink">{c.gallery.body}</p>}
          </div>
          <ul
            className={`mt-8 grid items-start gap-6 ${galleryCols[(c.gallery.items.length >= 3 ? 3 : 2) as 2 | 3]}`}
          >
            {c.gallery.items.map((item, i) => (
              <li key={item.image.src} className="reveal-up" style={{ animationDelay: `${i * 60}ms` }}>
                <CutoutFrame
                  image={item.image}
                  ground="light"
                  ratio={item.ratio ?? "4/3"}
                  pad={item.pad}
                  caption={item.caption}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                />
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-xs text-muted">
            Representative produced output and planning renders. Every asset is de-identified; images
            are illustrative of the workflow, not a specific patient case.
          </p>
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

      <CtaBand
        heading={c.ctaHeading ?? "Ready to move this case forward?"}
        body={
          c.ctaBody ??
          "Start the case when your records and scope are clear, or discuss the workflow first if it is still being defined."
        }
        primary={{ label: c.primary.label, href: c.primary.href, external: c.primary.external }}
        secondary={{ label: secondary.label, href: secondary.href, external: secondary.external }}
        showPortalLink
      />
    </>
  );
}
