import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { PlanningPanel } from "@/components/ui/PlanningPanel";
import { RoleTrust } from "@/components/sections/RoleTrust";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { cta } from "@/content/cta-routes";
import { img } from "@/content/images";
import { positioning } from "@/content/site";

// Copy source: About Page v1.0. Founder credibility without over-personalising;
// no unsupported case-count / outcome / compliance claims.
export const metadata: Metadata = {
  title: { absolute: "About Image3DConversion | Digital Implant Workflow Company" },
  description:
    "Learn about Image3DConversion, a digital implant workflow company supporting guided implant planning, surgical guide design, prosthetic coordination and global practice collaboration.",
  alternates: { canonical: "/about/" },
};

const supports = [
  { t: "Guided implant workflows", d: "Planning and guide-design support for routine, multi-implant and restorative-led cases." },
  { t: "Full-arch stackable workflows", d: "Coordination of prosthetic reference, bone reduction, implant planning, MUA direction and guide sequence." },
  { t: "Advanced planning workflows", d: "Support for complex anatomy such as zygoma and pterygoid routes under specialist clinical leadership." },
  { t: "Immediate-loading support", d: "Prosthetic and provisional coordination so patient expectations are considered before production." },
  { t: "Case data preparation", d: "DICOM, STL, model scan, photo and instruction review toward a cleaner planning stage." },
  { t: "Design-only files", d: "Production-ready digital outputs for practices and partners who keep production local." },
  { t: "Design-to-delivery workflows", d: "Coordinated planning, design and production handoff where scope and region allow." },
  { t: "Global & white-label workflows", d: "Structured collaboration routes for international practices and partner organisations." },
];

const principles = [
  { t: "Smile first", d: "The patient-facing outcome anchors the planning conversation." },
  { t: "Prosthetic driven", d: "Implant planning respects restorative space, emergence, function and final tooth position." },
  { t: "Workflow over product", d: "We support a structured pathway, not only isolated guides or files." },
  { t: "Clinician authority", d: "The treating clinician remains responsible for diagnosis, indication, consent, approval and execution." },
  { t: "Case clarity", d: "Records, revisions, approvals and deliverables are handled through defined routes." },
  { t: "Global readiness", d: "International collaboration works when scope, production path and responsibility are explicit." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Image3DConversion"
        h1="Built for the digital workflow behind predictable implant dentistry."
        body="Image3DConversion supports dental practices and professional partners with digital implant planning, surgical guide design, prosthetic workflow coordination and production-ready case outputs — making complex implant workflows clearer, more structured and easier to execute from diagnosis to final approval."
        note="Image3DConversion supports digital planning and workflow preparation. Diagnosis, treatment indication, patient consent, surgical execution and final clinical approval remain with the treating clinician or responsible professional team."
        primary={{ label: "Work With Us", href: "/discuss-a-case/" }}
        secondary={{ label: cta.openPortal.label, href: cta.openPortal.href, external: true }}
        image={img.pAboutImplantPlan}
        imageLabel="Connected digital workflow"
      />

      <Section aria-labelledby="why-h">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span aria-hidden className="tech-rule mb-4 block" />
            <h2 id="why-h">Why Image3DConversion exists</h2>
            <p className="mt-4 text-ink">
              Digital implant dentistry needs more than files. A CBCT scan, intraoral scan, wax-up,
              surgical guide or printed model becomes valuable only when it is connected to the
              patient’s expected smile, the prosthetic plan, the biological situation and the
              surgical route.
            </p>
            <p className="mt-4 text-ink">
              Image3DConversion was built around that connection — helping practices move from
              scattered records and isolated design tasks into a coordinated guided implant workflow.
            </p>
          </div>
          <PlanningPanel image={img.planRestorative} ratio="16/10" label="Restoration-led implant plan" />
        </div>
      </Section>

      <Section tone="tint" aria-labelledby="founder-h">
        <div className="max-w-3xl">
          <h2 id="founder-h">Founder-led workflow thinking</h2>
          <p className="mt-4 text-ink">
            Image3DConversion is founder-led by <strong>Sudeep Paul</strong>, a biomedical
            application expert in digital dentistry with long experience across guided implantology,
            surgical guide design, digital planning workflows and clinician education.
          </p>
          <p className="mt-4 text-ink">
            The direction comes from a practical belief: implant workflows become more dependable
            when the final prosthetic outcome is considered before the implant position, guide design
            and production route are locked. That approach shapes the website, education ecosystem,
            global workflow pathway and Case Portal experience.
          </p>
          <p className="mt-4 text-ink">
            Image3DConversion is an <strong>{positioning.base.toLowerCase()}</strong>. {positioning.reach},
            with a {positioning.model.toLowerCase()} model — so a case can be planned, reviewed and
            approved wherever the practice is based.
          </p>
        </div>
      </Section>

      <Section aria-labelledby="supports-h">
        <h2 id="supports-h">What the company supports</h2>
        <FeatureGrid
          className="mt-8"
          columns={4}
          items={supports.map((s) => ({ title: s.t, body: s.d }))}
        />
      </Section>

      <RoleTrust tone="tint" />

      <Section aria-labelledby="principles-h">
        <h2 id="principles-h">How Image3DConversion thinks</h2>
        <FeatureGrid
          className="mt-8"
          columns={3}
          accent
          items={principles.map((p) => ({ title: p.t, body: p.d }))}
        />
      </Section>

      <CtaBand
        heading="Work with a team built around guided implant workflow clarity."
        body="Whether you are a dental practice, global partner, lab, implant company or training ecosystem, we can help you define the right digital implant workflow route before case execution begins."
        primary={{ label: "Work With Us", href: "/discuss-a-case/" }}
        secondary={{ label: "Explore Global Practice Workflows", href: "/global-practices/" }}
      />
    </>
  );
}
