import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { Hero } from "@/components/sections/Hero";
import { SmileSection } from "@/components/sections/SmileSection";
import { WorkflowCards } from "@/components/sections/WorkflowCards";
import { GuideWorkflow } from "@/components/sections/GuideWorkflow";
import { CasePortalBand } from "@/components/sections/CasePortalBand";
import { CtaBand } from "@/components/sections/CtaBand";
import { IconList } from "@/components/ui/IconList";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { CutoutFrame } from "@/components/ui/CutoutFrame";
import { ProofStrip } from "@/components/sections/ProofStrip";
import { cta } from "@/content/cta-routes";
import { getHomepage, getTestimonials } from "@/content/source";
import { resolveMetadata } from "@/lib/seo/metadata";
import { img } from "@/content/images";

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/",
    title: "Digital Implant Planning & Surgical Guides | Image3DConversion",
    description:
      "Plan routine and complex guided implant cases with expert digital planning, surgical guides, full-arch workflows and clinician review before production.",
  });
}

export default async function HomePage() {
  // Business copy comes from the CMS homepage singleton (static fallback);
  // approved+consented testimonials render only when present (else nothing).
  const home = await getHomepage();
  const testimonials = (await getTestimonials()).map((t) => ({
    quote: t.quote,
    attribution: [t.role, t.organisation].filter(Boolean).join(", ") || t.attribution,
  }));
  return (
    <>
      <Hero hero={home.hero} />

      {/* 2 — Patient outcome */}
      <SmileSection />

      {/* 3 — Case recognition */}
      <Section tone="tint" aria-labelledby="wf-h">
        <div className="max-w-2xl">
          <h2 id="wf-h">{home.workflows.h2}</h2>
          <p className="mt-4 text-ink">{home.workflows.intro}</p>
        </div>
        <div className="mt-10">
          <WorkflowCards cards={home.workflows.cards} />
        </div>
      </Section>

      {/* 4 — Differentiation: layered planning panels */}
      <GuideWorkflow />

      {/* 5 — Five visible steps */}
      <Section tone="tint" aria-labelledby="steps-h">
        <span aria-hidden className="tech-rule mb-4 block" />
        <h2 id="steps-h">{home.steps.h2}</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {home.steps.items.map((step, i) => (
            <li
              key={step.title}
              className="reveal-up rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-float)]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span
                aria-hidden
                className="mb-3 block h-1 w-8 rounded-full bg-brand/70"
              />
              <span className="font-display text-3xl font-semibold text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg">{step.title}</h3>
              <p className="mt-1 text-sm text-ink">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-sm text-muted">
          {home.steps.responsibilityNote}
        </p>
        <p className="mt-4">
          <ButtonLink href={home.steps.href} variant="utility">
            {home.steps.linkLabel} →
          </ButtonLink>
        </p>
      </Section>

      {/* Proof — renders only when approved, consented testimonials exist. */}
      <ProofStrip testimonials={testimonials} />

      {/* 6 — Support modes */}
      <Section aria-labelledby="support-h">
        <h2 id="support-h">{home.support.h2}</h2>
        <FeatureGrid
          className="mt-8"
          columns={3}
          accent
          items={home.support.modes.map((mode) => ({
            title: mode.title,
            body: mode.body,
            href: mode.href,
            linkLabel: mode.linkLabel,
          }))}
        />
        <p className="mt-6">
          <ButtonLink href={home.support.sectionHref} variant="secondary">
            {home.support.sectionLink}
          </ButtonLink>
        </p>
      </Section>

      {/* 7 — Global practice fit */}
      <Section tone="tint" aria-labelledby="global-h">
        <div className="max-w-2xl">
          <span aria-hidden className="tech-rule mb-4 block" />
          <h2 id="global-h">{home.global.h2}</h2>
          <p className="mt-4 text-ink">{home.global.body}</p>
        </div>
        <FeatureGrid className="mt-8" columns={3} items={home.global.points} />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={home.global.primaryLink.href} variant="secondary">
            {home.global.primaryLink.label}
          </ButtonLink>
          <ButtonLink href={home.global.secondaryLink.href} variant="utility">
            {home.global.secondaryLink.label} →
          </ButtonLink>
        </div>
      </Section>

      {/* 8 — Complex-case authority: the single controlled blue band */}
      <Section tone="invert" aria-labelledby="complex-h">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 id="complex-h" className="text-white">
              {home.complexCase.h2}
            </h2>
            <p className="mt-4 text-lg font-semibold text-[var(--text-on-invert)]">
              {home.complexCase.lead}
            </p>
            <p className="mt-4 text-[var(--text-on-invert-muted)]">
              {home.complexCase.body}
            </p>
            <ol className="mt-8 flex flex-wrap gap-2">
              {home.complexCase.sequence.map((stage, i) => (
                <li
                  key={stage}
                  className="flex items-center gap-2 rounded-[var(--radius-card)] border border-white/20 px-3 py-2 text-sm font-semibold text-white"
                >
                  <span className="text-[var(--text-on-invert-muted)]">{i + 1}</span>
                  {stage}
                </li>
              ))}
            </ol>
            <p className="mt-6 max-w-xl text-[var(--text-on-invert-muted)]">
              {home.complexCase.closingLine}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={cta.discussCase.href}
                variant="secondary"
                className="border-white/40 !text-white hover:!border-white"
              >
                {cta.discussCase.label}
              </ButtonLink>
              <a
                href={home.complexCase.href}
                className="inline-flex min-h-12 items-center font-bold text-white underline underline-offset-4"
              >
                {home.complexCase.linkLabel} →
              </a>
            </div>
          </div>

          {/* Real full-arch guide visual inside the band */}
          <CutoutFrame
            image={img.pStackableGrey}
            ground="light"
            ratio="16/10"
            label="Full-arch stackable sequence"
            caption="Stackable guide layers: reduction, placement and prosthetic reference in one sequence."
            sizes="(max-width: 1024px) 100vw, 560px"
          />
        </div>
      </Section>

      {/* 9 — Company positioning / trust (professional, not over-personal) */}
      <Section aria-labelledby="trust-h">
        <div className="max-w-2xl">
          <Eyebrow>{home.trust.eyebrow}</Eyebrow>
          <h2 id="trust-h">{home.trust.h2}</h2>
          <p className="mt-4 text-ink">{home.trust.body}</p>
        </div>
        <FeatureGrid className="mt-8" columns={3} accent items={home.trust.points} />
        <p className="mt-8">
          <ButtonLink href="/about/" variant="secondary">
            About Image3DConversion
          </ButtonLink>
        </p>
      </Section>

      {/* 10 — Case Portal as a separate secure system */}
      <CasePortalBand />

      {/* 11 — Preparation (Section 9 evidence is gated; omitted in Release 1) */}
      <Section aria-labelledby="req-h">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 id="req-h">{home.requirements.h2}</h2>
            <p className="mt-4 text-ink">{home.requirements.body}</p>
            <div className="mt-6 rounded-[var(--radius-card)] border border-line-strong bg-white p-4 shadow-[var(--shadow-sm)]">
              <p className="text-sm font-semibold text-heading">
                {home.requirements.privacyNotice}
              </p>
            </div>
            <div className="mt-6">
              <ButtonLink href={cta.reviewRequirements.href}>
                {cta.reviewRequirements.label}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-sm)]">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
              Records reviewed before planning
            </p>
            <IconList items={[...home.requirements.checklist]} variant="check" />
          </div>
        </div>
      </Section>

      {/* 12 — Final action (navy CTA band) */}
      <CtaBand
        heading={home.finalAction.h2}
        body={home.finalAction.body}
        primary={{ label: cta.startCase.label, href: cta.startCase.href, external: cta.startCase.external }}
        secondary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
        showPortalLink
      />
    </>
  );
}
