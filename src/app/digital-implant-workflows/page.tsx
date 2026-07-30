import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { WorkflowCards } from "@/components/sections/WorkflowCards";
import { RouteCards } from "@/components/sections/RouteCards";
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

const waysToWork = [
  { title: "Case Data & Diagnostic Preparation", body: "DICOM-to-STL, CBCT segmentation and scan alignment before planning begins.", linkLabel: "Prepare case data", href: "/case-data-preparation/" },
  { title: "Design-Only Workflow", body: "Reviewed, ready-to-print files for your own validated production workflow.", linkLabel: "Review design-only", href: "/design-only-workflow/" },
  { title: "Design-to-Delivery Workflow", body: "One coordinated path from case data to surgery-ready delivery.", linkLabel: "Review design-to-delivery", href: "/design-to-delivery/" },
  { title: "White-Label Workflow Partnership", body: "Planning and design capacity behind your lab, DSO or practice network.", linkLabel: "Explore partnership", href: "/white-label-workflow-partner/" },
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
        <div className="max-w-2xl">
          <h2 id="ways-h">Ways to work with us</h2>
          <p className="mt-4 text-ink">
            Choose how much support your practice needs — from data preparation to files you
            produce locally, coordinated delivery, or workflow capacity behind your brand.
          </p>
        </div>
        <div className="mt-8">
          <RouteCards cards={waysToWork} columns={4} />
        </div>
      </Section>

      <Section aria-labelledby="svc-cta-h" width="narrow" className="text-center">
        <h2 id="svc-cta-h">Not sure which workflow fits?</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink">
          Share your case type, production need and region. We’ll help you choose the right path
          before clinical records are submitted.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={cta.discussCase.href}>{cta.discussCase.label}</ButtonLink>
          <ButtonLink href="/how-it-works/" variant="secondary">See how it works</ButtonLink>
        </div>
      </Section>
    </>
  );
}
