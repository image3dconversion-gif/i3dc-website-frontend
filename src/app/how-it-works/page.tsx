import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { RouteCards } from "@/components/sections/RouteCards";
import { CtaBand } from "@/components/sections/CtaBand";
import { IconList } from "@/components/ui/IconList";
import { cta } from "@/content/cta-routes";
import { img } from "@/content/images";

// Copy source: How It Works / Workflow Overview v1.0 (visitor copy only).
export const metadata: Metadata = {
  title: { absolute: "How Image3DConversion Works | Guided Implant Workflow" },
  description:
    "Understand how Image3DConversion supports guided implant planning, case data preparation, design review, approval and delivery workflows for dental practices.",
  alternates: { canonical: "/how-it-works/" },
};

const stages = [
  { n: "01", title: "Discuss the case route", body: "Identify the case type and workflow need — planning, design-only, design-to-delivery, global support or partnership.", where: "Discuss a Case" },
  { n: "02", title: "Prepare diagnostic records", body: "Prepare CBCT/DICOM, scans, bite, photographs and prosthetic reference as required by the case type.", where: "Case Data & Diagnostic Preparation" },
  { n: "03", title: "Submit through the right pathway", body: "Ready cases move through the authenticated Case Portal. Early enquiries stay on the public route until submission is appropriate.", where: "Case Portal" },
  { n: "04", title: "Plan, design and review", body: "Planning, guide design, prosthetic alignment, revision handling and review-ready outputs within the agreed scope.", where: "Relevant workflow page" },
  { n: "05", title: "Approve and receive deliverables", body: "Review, request changes where needed, record approval and receive production-ready files or delivery support.", where: "Case Portal / agreed route" },
];

const routes = [
  { title: "Guided Implant Workflow", body: "Routine, multi-implant or restorative-driven planning support.", linkLabel: "Review workflow", href: "/guided-implant-workflow/" },
  { title: "Full-Arch / Stackable", body: "Full-arch sequencing, bone reduction, MUA direction and provisional coordination.", linkLabel: "Review workflow", href: "/full-arch-stackable-workflow/" },
  { title: "Immediate Loading", body: "Keep the provisional, smile reference and surgical plan coordinated.", linkLabel: "Review workflow", href: "/immediate-loading-workflow/" },
  { title: "Zygoma / Pterygoid", body: "Advanced cases needing specialist-led planning context and clear responsibility.", linkLabel: "Review workflow", href: "/zygoma-pterygoid-planning/" },
  { title: "Design-Only", body: "Files for practices or labs keeping local production under their control.", linkLabel: "Review workflow", href: "/design-only-workflow/" },
  { title: "Design-to-Delivery", body: "Coordinated planning, design and production handoff where scope allows.", linkLabel: "Review workflow", href: "/design-to-delivery/" },
];

const prepare = [
  "CBCT / DICOM data with an appropriate field of view for the planned treatment.",
  "Intraoral scan, model scan, denture scan or wax-up scan where relevant.",
  "Bite record, clinical photographs and smile / prosthetic reference when the outcome is patient-facing.",
  "Implant system, component preferences and surgical notes where already decided.",
  "A clear statement of the desired workflow: planning, guide design, design-only, design-to-delivery or partner support.",
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How Image3DConversion works"
        h1="A clearer workflow from records to guided execution."
        body="Image3DConversion supports dental practices through the digital workflow behind guided implant treatment: case understanding, diagnostic-record preparation, planning support, guide and prosthetic design coordination, professional review, revision handling, approval and final deliverables."
        note="The treating clinician remains responsible for diagnosis, treatment indication, patient consent, surgical execution and final clinical approval. Image3DConversion supports the digital planning and workflow environment around the case."
        primary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
        secondary={{ label: cta.openPortal.label, href: cta.openPortal.href, external: true }}
        image={img.planFrontal}
        imageLabel="Guided implant plan"
      />

      <Section aria-labelledby="stages-h">
        <span aria-hidden className="tech-rule mb-4 block" />
        <h2 id="stages-h">The Image3DConversion workflow</h2>
        <p className="mt-4 max-w-2xl text-ink">
          A guided case becomes predictable when the sequence is clear — the right records,
          prosthetic reference, planning objective, review rhythm and approval path.
        </p>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {stages.map((s, i) => (
            <li
              key={s.n}
              className="reveal-up flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-float)]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span aria-hidden className="mb-3 block h-1 w-8 rounded-full bg-brand/70" />
              <span className="font-display text-3xl font-semibold text-brand">{s.n}</span>
              <h3 className="mt-2 text-base">{s.title}</h3>
              <p className="mt-1 flex-1 text-sm text-ink">{s.body}</p>
              <span className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">{s.where}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="tint" aria-labelledby="routes-h">
        <h2 id="routes-h">Choose the route that fits your practice</h2>
        <p className="mt-4 max-w-2xl text-ink">Start with the clinical objective, then move to the page that matches your case.</p>
        <div className="mt-8"><RouteCards cards={routes} columns={3} /></div>
      </Section>

      <Section aria-labelledby="prep-h">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 id="prep-h">What the practice should prepare</h2>
            <p className="mt-4 text-ink">
              Exact records depend on the case, but most workflows become clearer when this
              information is prepared before formal submission.
            </p>
            <div className="mt-6"><ButtonLink href="/case-data-preparation/" variant="secondary">Case Data &amp; Diagnostic Preparation</ButtonLink></div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-sm)]">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
              Prepare before submission
            </p>
            <IconList items={[...prepare]} variant="check" />
          </div>
        </div>
      </Section>

      <Section tone="tint" aria-labelledby="hiw-portal-h">
        <div className="max-w-3xl">
          <h2 id="hiw-portal-h">Where the Case Portal fits</h2>
          <p className="mt-4 text-ink">
            The Case Portal is the authenticated environment for active case submission,
            clinical-record exchange, status, review, revision, approval and final deliverables.
            The public website helps you understand the workflow and choose the right route; the
            portal is where active cases are handled after the pathway is confirmed.
          </p>
          <p className="mt-4 rounded-[var(--radius-card)] border border-line-strong bg-white px-4 py-3 text-sm font-semibold text-heading">
            Clinical files, patient-identifying information, approvals and deliverables belong
            inside the authenticated Case Portal — never a public form.
          </p>
        </div>
      </Section>

      <CtaBand
        heading="Know the workflow before the case begins."
        body="Share your case type, practice context and the workflow you are considering. We can help you choose the right path before clinical records are submitted."
        primary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
        secondary={{ label: cta.openPortal.label, href: cta.openPortal.href, external: true }}
      />
    </>
  );
}
