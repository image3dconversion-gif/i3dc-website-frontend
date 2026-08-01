import type { Metadata } from "next";
import { resolveMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { RouteCards } from "@/components/sections/RouteCards";
import { PortalMock } from "@/components/sections/PortalMock";
import { cta } from "@/content/cta-routes";

// Copy source: Case Portal Page v1.0. PUBLIC GATEWAY ONLY — explains the portal
// and routes in. No clinical upload, no invented screenshots, no PII.
export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/case-portal/",
    title: "Image3DConversion Case Portal | Login & Start a Case",
    description:
      "Access the Image3DConversion Case Portal to start, review, approve and track your digital implant workflow.",
  });
}

const actions = [
  { t: "Start a Case", d: "Create a new guided, full-arch, advanced, immediate-loading or design workflow request." },
  { t: "Upload required records", d: "Submit DICOM, STL, images and instructions only inside the authenticated workspace." },
  { t: "Track a Case", d: "See the current stage and whether any practice action is required." },
  { t: "Review Plan", d: "Open the proposed plan, notes or design output prepared for professional review." },
  { t: "Request Changes", d: "Send structured revision feedback before approval." },
  { t: "Approve for Production", d: "Record the required approval before production, delivery or file release." },
  { t: "View Quotation", d: "Review the agreed scope and commercial confirmation where applicable." },
  { t: "Access Final Files", d: "Download agreed files or view dispatch and completion information after release." },
];

const journey = [
  { s: "Draft", m: "Started but not submitted.", do: "Complete details and required records." },
  { s: "Submitted", m: "The case has entered the queue.", do: "Wait for validation or questions." },
  { s: "Data Check", m: "Files and instructions are being checked.", do: "Respond if anything is missing." },
  { s: "In Planning", m: "The digital plan or design is being prepared.", do: "No action unless a question appears." },
  { s: "Plan Ready", m: "The proposed plan is ready for review.", do: "Review carefully and respond." },
  { s: "Approval Required", m: "The next step needs recorded approval.", do: "Approve or request changes." },
  { s: "In Production / Files Ready", m: "Approved deliverables are produced, dispatched or released.", do: "Track delivery or download files." },
];

const routes = [
  { title: "Returning practice", body: "Continue existing cases, start a new case or review required actions.", linkLabel: "Open the Case Portal", href: cta.openPortal.href },
  { title: "New practice", body: "Share professional details and workflow need before clinical records are exchanged.", linkLabel: "Discuss case setup", href: "/discuss-a-case/" },
  { title: "Global practice", body: "Clarify region, production route and responsibility boundaries first.", linkLabel: "Global workflows", href: "/global-practices/" },
  { title: "Partner organisation", body: "Discuss white-label or behind-the-scenes workflow scope before case intake.", linkLabel: "Explore partnership", href: "/white-label-workflow-partner/" },
];

export default function CasePortalPage() {
  return (
    <>
      {/* Navy hero with the abstract portal illustration (not a real screenshot) */}
      <section className="relative overflow-hidden border-b border-white/10 band-navy text-[var(--text-on-invert)]">
        <div
          aria-hidden
          className="blueprint-invert pointer-events-none absolute inset-0 [mask-image:radial-gradient(130%_100%_at_82%_-5%,black,transparent_72%)]"
        />
        <Container className="relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[46fr_54fr]">
          <div>
            <Eyebrow tone="invert">Image3DConversion Case Portal</Eyebrow>
            <h1 className="text-[length:var(--fs-hero)] font-bold leading-[1.04] tracking-[-0.02em] text-white">
              Start, review and track your guided implant cases in one place.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[var(--text-on-invert)]">
              The Case Portal gives dental practices and authorised workflow partners a structured
              place to submit case requirements, follow progress, review planning outputs, request
              changes, approve the agreed route and access final deliverables.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={cta.openPortal.href} external variant="inverse">{cta.openPortal.label}</ButtonLink>
              <ButtonLink href="/discuss-a-case/" variant="inverseOutline">New practice? Discuss case setup</ButtonLink>
            </div>
            <p className="mt-6 max-w-xl text-xs leading-relaxed text-[var(--text-on-invert-muted)]">
              Clinical diagnosis, treatment indication, patient consent, surgical execution and
              final approval remain with the treating clinician or responsible professional team.
            </p>
          </div>
          <div className="relative">
            <div aria-hidden className="blueprint-invert pointer-events-none absolute -inset-5 -z-10 rounded-[var(--radius-card)] border border-white/15 [mask-image:radial-gradient(85%_85%_at_55%_45%,black,transparent)]" />
            <PortalMock />
          </div>
        </Container>
      </section>

      <Section aria-labelledby="portal-sep">
        <div className="max-w-3xl">
          <span aria-hidden className="tech-rule mb-4 block" />
          <h2 id="portal-sep">The portal is where the workflow becomes visible</h2>
          <p className="mt-4 text-ink">
            A guided implant case should not disappear after records are sent. The portal gives each
            practice a clearer view of where a case stands, what has been submitted, what is being
            checked, what needs review and what action is required before production or file delivery
            moves forward — across routine, full-arch, immediate-loading, advanced, design-only and
            design-to-delivery workflows.
          </p>
        </div>
      </Section>

      <Section tone="tint" aria-labelledby="actions-h">
        <h2 id="actions-h">What you can do inside the portal</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <li key={a.t} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-sm)]">
              <h3 className="text-base">{a.t}</h3>
              <p className="mt-2 text-sm text-ink">{a.d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="journey-h">
        <h2 id="journey-h">The case journey in plain language</h2>
        <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-line">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-heading">Stage</th>
                <th className="px-4 py-3 font-semibold text-heading">What it means</th>
                <th className="px-4 py-3 font-semibold text-heading">What the practice does</th>
              </tr>
            </thead>
            <tbody>
              {journey.map((r) => (
                <tr key={r.s} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-semibold text-brand">{r.s}</td>
                  <td className="px-4 py-3 text-ink">{r.m}</td>
                  <td className="px-4 py-3 text-ink">{r.do}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          Status labels are illustrative and follow the approved portal workflow.
        </p>
      </Section>

      <Section tone="tint" aria-labelledby="portal-routes-h">
        <h2 id="portal-routes-h">New practice or returning practice?</h2>
        <div className="mt-8"><RouteCards cards={routes} columns={4} /></div>
      </Section>

      <Section aria-labelledby="portal-privacy-h" width="narrow">
        <h2 id="portal-privacy-h">Privacy-aware guidance</h2>
        <p className="mt-4 text-ink">
          Do not place patient-identifying information, DICOM files, STL files, clinical photographs
          or full prescriptions in a public enquiry form. Public forms collect professional identity
          and a short non-identifying workflow summary only. Once the route is confirmed, clinical
          records are submitted through the authenticated Case Portal or another authorised
          professional intake route.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={cta.openPortal.href} external>{cta.openPortal.label}</ButtonLink>
          <ButtonLink href="/discuss-a-case/" variant="secondary">New practice? Discuss case setup</ButtonLink>
        </div>
      </Section>
    </>
  );
}
