import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { WorkflowCards } from "@/components/sections/WorkflowCards";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { ImageOrSlot } from "@/components/ui/ImageOrSlot";
import { home } from "@/content/pages/home";
import { cta } from "@/content/cta-routes";
import { img } from "@/content/images";

// Copy source: Website Strategy Blueprint v1.2 §6 (Clinical Workflow Solutions).
export const metadata: Metadata = {
  title: { absolute: "Digital Implant Workflow Solutions | Image3DConversion" },
  description:
    "Choose the right digital implant workflow for guided placement, full-arch treatment, immediate loading, advanced anchorage or design support.",
  alternates: { canonical: "/digital-implant-workflows/" },
};

const waysToWorkSlugs = [
  "case-data-preparation",
  "design-only-workflow",
  "design-to-delivery",
  "white-label-workflow-partner",
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Clinical workflow solutions"
        h1="Choose the workflow your case needs."
        body="Start with the clinical objective, not a department name. Four implant workflows plus four ways of working, grouped by what your case actually requires."
        note="Services are provided to dental professionals and authorised workflow partners. The treating clinician retains clinical authority."
        primary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
        secondary={{ label: cta.reviewRequirements.label, href: cta.reviewRequirements.href }}
        image={img.planRestorative}
        imageLabel="Restoration-led implant plan"
      />

      <Section aria-labelledby="impl-h">
        <span aria-hidden className="tech-rule mb-4 block" />
        <div className="max-w-2xl">
          <h2 id="impl-h">Implant workflows</h2>
          <p className="mt-4 text-ink">
            Restoration-led planning support across routine, full-arch, advanced-anchorage and
            immediate-loading cases. Each links to its records, planning path and deliverables.
          </p>
        </div>
        <div className="mt-10">
          <WorkflowCards cards={home.workflows.cards} />
        </div>
      </Section>

      <Section tone="tint" aria-labelledby="ways-h">
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div className="max-w-2xl">
            <h2 id="ways-h">Ways to work with us</h2>
            <p className="mt-4 text-ink">
              Choose how much support your practice needs — from data preparation to files you
              produce locally, coordinated delivery, or workflow capacity behind your brand. Each
              badge shows the engagement models a service supports.
            </p>
          </div>
          <ImageOrSlot
            image={null}
            alt="De-identified digital dentistry production environment — 3D printer, quality-assurance bench and packaged surgical guides."
            slot="P1-4 · de-identified lab & production (printer, QA bench, packaging)"
            label="Production & delivery"
            ratio="16/10"
            sizes="(max-width: 1024px) 100vw, 460px"
          />
        </div>
        <ServiceGrid className="mt-10" slugs={waysToWorkSlugs} columns={4} />
      </Section>

      <CtaBand
        heading="Not sure which workflow fits?"
        body="Share your case type, production need and region. We’ll help you choose the right path before clinical records are submitted."
        primary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
        secondary={{ label: "See how it works", href: "/how-it-works/" }}
      />
    </>
  );
}
