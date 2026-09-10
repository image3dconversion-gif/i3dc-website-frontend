import { Suspense } from "react";
import type { Metadata } from "next";
import { resolveMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { RouteCards } from "@/components/sections/RouteCards";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactChannels } from "@/components/sections/ContactChannels";
import { cta } from "@/content/cta-routes";

// Copy source: Contact / Discuss a Case v1.0. Public enquiry only — NO file
// upload, NO patient data. Returning/ready cases route to the Case Portal.
export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/discuss-a-case/",
    title: "Discuss a Guided Implant Case | Image3DConversion",
    description:
      "Contact Image3DConversion to discuss guided implant planning, full-arch workflows, design-only support, design-to-delivery routes or global workflow partnership.",
  });
}

// Each card carries its service key in the query string so the choice survives
// into the form and on into the CRM. Previously these were bare "#form" anchors
// and the selection was discarded the moment the visitor scrolled.
const routes = [
  { title: "Guided Implant Planning", body: "Implant planning and guide-design support for routine or multi-implant cases.", linkLabel: "Start here", href: "?service=guided-implant-planning#form" },
  { title: "Full-Arch / Stackable", body: "Prosthetic reference, bone reduction, implant sequence, MUA direction and guide coordination.", linkLabel: "Start here", href: "?service=full-arch-stackable#form" },
  { title: "Immediate Loading", body: "Provisional, aesthetic and prosthetic coordination around immediate-loading treatment.", linkLabel: "Start here", href: "?service=immediate-loading#form" },
  { title: "Advanced Case", body: "Zygoma, pterygoid or complex anatomy needing specialist-led planning.", linkLabel: "Start here", href: "?service=advanced-case#form" },
  { title: "Design-Only", body: "Production-ready files while you keep production local.", linkLabel: "Start here", href: "?service=design-only#form" },
  { title: "Design-to-Delivery", body: "Coordinated planning, design and production handoff where available.", linkLabel: "Start here", href: "?service=design-to-delivery#form" },
  { title: "Global Practice", body: "Cross-border collaboration, file handoff or production coordination.", linkLabel: "Start here", href: "?service=global-practice#form" },
  { title: "Partnership", body: "Labs, DSOs, implant companies, education groups and white-label partners.", linkLabel: "Start here", href: "?service=partnership#form" },
];

const afterSteps = [
  { n: "1", t: "We review the enquiry", d: "We check the workflow category, professional context and the support requested." },
  { n: "2", t: "We confirm the right path", d: "A workflow call, Case Portal setup, returning-user login, global discussion or partnership conversation." },
  { n: "3", t: "You prepare records only when requested", d: "If clinical records are required, you’re routed into the authenticated portal or another approved intake route." },
  { n: "4", t: "The case moves into workflow", d: "Once scope and records are correctly submitted, the case follows the applicable route." },
];

export default function DiscussPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Image3DConversion"
        h1="Discuss the right workflow before you start the case."
        body="Tell us what you are planning and which workflow you need help with — guided implant planning, full-arch, immediate-loading, design-only, design-to-delivery, global collaboration or partnership."
        note="Please do not place patient-identifying information, DICOM/STL files, clinical photographs or full prescriptions in this public form. Clinical records are submitted only through the authenticated Case Portal after the right route is confirmed."
        primary={{ label: "Go to the enquiry form", href: "#form" }}
        secondary={{ label: cta.openPortal.label, href: cta.openPortal.href, external: true }}
      />

      <Section aria-labelledby="routes-h">
        <span aria-hidden className="tech-rule mb-4 block" />
        <h2 id="routes-h">Choose the conversation you need</h2>
        <p className="mt-4 max-w-2xl text-ink">
          The first step is not always file submission. Some cases are ready for the portal; others
          need a workflow conversation first — case type, prosthetic objective, production route,
          logistics, clinical leadership or partner scope.
        </p>
        <div className="mt-8"><RouteCards cards={routes} columns={4} /></div>
      </Section>

      <Section tone="tint" aria-labelledby="formsection-h">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 id="formsection-h">Send a workflow enquiry</h2>
            <p className="mt-4 text-ink">
              Share professional context and a non-identifying workflow summary. We’ll guide the next
              step — and route you to the authenticated Case Portal only when clinical records are
              actually needed.
            </p>
            <ol className="mt-8 space-y-4">
              {afterSteps.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-brand text-sm font-bold text-white">{s.n}</span>
                  <span>
                    <span className="block font-semibold text-heading">{s.t}</span>
                    <span className="mt-1 block text-sm text-ink">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <ContactChannels />
            </div>
          </div>
          {/* ContactForm reads ?service= via useSearchParams so a soft
              navigation from the cards above updates it. The boundary keeps
              this page statically prerendered; only the form waits for the
              client-side URL. */}
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
      </Section>

      <Section aria-labelledby="ready-h" width="narrow" className="text-center">
        <h2 id="ready-h">Already ready to submit a case?</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink">
          If your practice already has an account and the case is ready, use the Case Portal instead
          of this public form — the correct place to start cases, upload required records, review
          outputs, request changes, approve the route and access deliverables.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={cta.openPortal.href} external>{cta.openPortal.label}</ButtonLink>
        </div>
      </Section>
    </>
  );
}
