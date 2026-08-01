import type { Metadata } from "next";
import { resolveMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { RouteCards } from "@/components/sections/RouteCards";
import { PlanningPanel } from "@/components/ui/PlanningPanel";
import { getCaseEvidence } from "@/content/source";
import { cta } from "@/content/cta-routes";
import { img } from "@/content/images";

// Copy source: Website Strategy Blueprint v1.2 §7 (Case Evidence).
// NOTE: no case examples are invented and no unapproved/patient imagery is used.
// This page publishes the evidence FRAMEWORK; real cases are added only once
// de-identified and consent-cleared.
export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/case-evidence/",
    title: "Guided Implant Workflow Case Evidence | Image3DConversion",
    description:
      "Review how Image3DConversion presents anonymised digital implant workflows — case objective, records, planning decisions, approvals and delivered components.",
  });
}

const pattern = [
  "Starting condition",
  "Treatment objective",
  "Data received",
  "Key planning decision",
  "Approval point",
  "Deliverables",
  "Disclosed limitations",
];

const walkthrough = [
  "Starting condition — the presentation and constraints the case begins with.",
  "Treatment objective — the restorative result the plan is built to serve.",
  "Data received — the records used, and any that had to be re-captured.",
  "Key planning decision — the choice that most shaped the plan.",
  "Approval point — what the treating clinician reviewed and approved.",
  "Deliverables — the files or components released, by scope.",
  "Disclosed limitations — what the case does not claim.",
];

const objectives = [
  { title: "Single & multiple implants", body: "Restoration-led guided placement for routine cases.", linkLabel: "Guided implant workflow", href: "/guided-implant-workflow/" },
  { title: "Full arch", body: "Stackable sequence from reduction to provisional reference.", linkLabel: "Full-arch workflow", href: "/full-arch-stackable-workflow/" },
  { title: "Immediate loading", body: "Plan, guide and provisional kept aligned before surgery.", linkLabel: "Immediate-loading workflow", href: "/immediate-loading-workflow/" },
  { title: "Zygoma & pterygoid", body: "Advanced anchorage where anatomy and restoration must agree.", linkLabel: "Advanced planning", href: "/zygoma-pterygoid-planning/" },
];

export default async function CaseEvidencePage() {
  // Published cases appear only once approved AND anonymised in the CMS; until
  // then this renders nothing and the evidence framework below stands alone.
  const cases = await getCaseEvidence();
  return (
    <>
      <PageHero
        eyebrow="Case workflows"
        h1="See the workflow, not only the finished guide."
        body="The strongest evidence is how a case is understood, checked, reviewed and approved. Each published example is organised by objective and follows one consistent, transparent pattern."
        note="Every published case is de-identified and consent-cleared. No patient identity, DICOM/STL files or clinical records appear on the public website."
        primary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
        image={img.planFrontal}
        imageLabel="Guided implant plan"
      />

      <Section aria-labelledby="pattern-h">
        <span aria-hidden className="tech-rule mb-4 block" />
        <div className="max-w-2xl">
          <h2 id="pattern-h">Every case uses the same evidence pattern</h2>
          <p className="mt-4 text-ink">
            Rather than a gallery of unrelated images, each case is shown as one connected sequence —
            so a dentist can judge the thinking, not just the finished component.
          </p>
        </div>
        <ol className="mt-8 flex flex-wrap gap-3">
          {pattern.map((p, i) => (
            <li key={p} className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-brand text-xs font-bold text-white">{i + 1}</span>
              <span className="text-sm font-semibold text-heading">{p}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="tint" aria-labelledby="walk-h">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 id="walk-h">How a published case reads</h2>
            <p className="mt-4 text-ink">
              Each case is presented as one connected story, in the same order every time. The
              planning view below is an approved, de-identified render shown to illustrate the
              format — it is not a specific patient case.
            </p>
            <ol className="mt-6 space-y-3">
              {walkthrough.map((w, i) => (
                <li key={w} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-brand text-xs font-bold text-white">{i + 1}</span>
                  <span className="text-sm text-ink">{w}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:sticky lg:top-24">
            <PlanningPanel image={img.planRestorative} ratio="16/12" label="Illustrative planning view — not a patient case" />
          </div>
        </div>
      </Section>

      <Section aria-labelledby="obj-h">
        <h2 id="obj-h">Organised by case objective</h2>
        <p className="mt-4 max-w-2xl text-ink">
          Explore the workflow behind each case type while consent-cleared examples are prepared.
        </p>
        <div className="mt-8"><RouteCards cards={objectives} columns={4} /></div>
      </Section>

      {cases.length > 0 && (
        <Section tone="tint" aria-labelledby="published-h">
          <h2 id="published-h">Published case workflows</h2>
          <p className="mt-4 max-w-2xl text-ink">
            De-identified, consent-cleared examples, each presented in the same transparent pattern.
          </p>
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <li key={c.title} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-sm)]">
                {c.workflow && (
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">{c.workflow}</p>
                )}
                <h3 className="mt-2 text-lg">{c.title}</h3>
                <p className="mt-2 text-sm text-ink">{c.summary}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section aria-labelledby="ce-note-h" width="narrow">
        <h2 id="ce-note-h">Published examples are prepared carefully</h2>
        <p className="mt-4 text-ink">
          Case examples are added only once they are de-identified and consent-cleared, with
          outcomes attributed to the treating clinician and documented follow-up. Until then, the
          workflow pages show the planning and design approach behind each case type.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={cta.discussCase.href}>{cta.discussCase.label}</ButtonLink>
          <ButtonLink href="/how-it-works/" variant="secondary">See how it works</ButtonLink>
        </div>
      </Section>
    </>
  );
}
