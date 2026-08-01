import type { Metadata } from "next";
import { resolveMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { Accordion, type QA } from "@/components/ui/Accordion";
import { FaqPageJsonLd, BreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { getFaqEntries } from "@/content/source";
import { cta } from "@/content/cta-routes";

// Copy source: FAQ / Practice Questions v1.0. Conversion FAQ — top-5 friction
// questions visible; categories in accordions. Public boundary preserved.
export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/faq/",
    title: "Image3DConversion FAQ | Guided Implant Workflow Questions",
    description:
      "Find answers about Image3DConversion case records, guided implant planning, design-only workflows, design-to-delivery, global practices and the Case Portal.",
  });
}

const priority: QA[] = [
  { q: "What records do I need before submitting a case?", a: "Most cases need CBCT/DICOM data, intraoral or model scans, bite information, clinical photographs where relevant, implant-system direction and a clear workflow objective. Exact requirements depend on the case type — the Case Data & Diagnostic Preparation page guides you deeper." },
  { q: "Can I start with incomplete data?", a: "You can start a general discussion with incomplete information, but active case planning normally needs complete diagnostic records before design decisions are reliable. The public enquiry route can help identify what is missing before formal submission." },
  { q: "Do you provide design-only files?", a: "Yes. Design-only workflows support practices or labs that want production-ready files while keeping print, mill or local production under their own control. The exact file output and revision scope are confirmed before the case begins." },
  { q: "Can I print or mill locally?", a: "Yes, where the selected workflow is design-only or local-production oriented. Local production remains the responsibility of the local professional team and production provider." },
  { q: "How do I track a submitted case?", a: "Active cases are tracked through the authenticated Case Portal, where users follow status, review case information and access the appropriate next actions according to the approved workflow." },
];

const groups: { title: string; items: QA[] }[] = [
  {
    title: "Starting a case",
    items: [
      { q: "Where should a new practice begin?", a: "Start with Discuss a Case if you are unsure which workflow fits. If you already have an account and the case is ready, use the Case Portal." },
      { q: "Can I upload DICOM, STL or photos on the public FAQ page?", a: "No. Public pages explain preparation and collect non-identifying enquiries only. Clinical files belong inside the authenticated Case Portal or another approved professional intake route." },
      { q: "Who approves the final plan or design?", a: "The treating clinician or responsible professional team must review and approve the clinical direction. Image3DConversion supports digital planning and workflow preparation within the agreed scope." },
      { q: "What if I’m not sure whether my case is guided, design-only or design-to-delivery?", a: "Use the public discussion route with a non-identifying workflow summary. The team can help route the enquiry before clinical records are submitted." },
    ],
  },
  {
    title: "Guided surgery and full-arch planning",
    items: [
      { q: "Do you support single and multiple implant guided workflows?", a: "Yes — routine and multi-implant guided workflows when the required diagnostic records and planning objectives are available." },
      { q: "Do you support full-arch or stackable guide workflows?", a: "Yes. Full-arch workflows may involve prosthetic reference, bone reduction, implant sequence, MUA direction and staged guide coordination. Case-specific scope is confirmed before starting." },
      { q: "Do you support zygoma or pterygoid planning workflows?", a: "Advanced workflows can be discussed where appropriate professional leadership and diagnostic records are available. These cases require especially clear responsibility, review and approval boundaries." },
    ],
  },
  {
    title: "Design-only & design-to-delivery",
    items: [
      { q: "What does design-only mean?", a: "Image3DConversion supports planning or design output while the practice, lab or partner manages local production and final clinical use." },
      { q: "What files can be delivered?", a: "It depends on the agreed workflow, and may include production-ready design files where scope, record quality and review requirements are confirmed." },
      { q: "What is design-to-delivery?", a: "A coordinated route where planning, design and production handoff or delivery support are aligned under an agreed scope. Eligibility depends on case type, location, production route, records, capacity and confirmed scope." },
      { q: "Can revisions be requested?", a: "Yes — revision handling is part of the agreed review workflow. Revision limits, turnaround and approval steps are confirmed for the selected route." },
    ],
  },
  {
    title: "Global practices & partnerships",
    items: [
      { q: "Can international practices work with Image3DConversion?", a: "Yes — international workflows can be discussed for planning support, design-only files, local production models or coordinated delivery routes where scope is feasible." },
      { q: "How do time zones and communication work?", a: "Global cases use clear written instructions, agreed review channels and timezone-aware communication. Exact response expectations are confirmed for the workflow." },
      { q: "Do you offer white-label workflow support?", a: "White-label partnerships can be discussed for labs, DSOs, implant companies and education groups. Scope, brand visibility, responsibility boundary and operating model are defined before work begins." },
    ],
  },
  {
    title: "Case Portal & pricing",
    items: [
      { q: "What is the Case Portal for?", a: "The authenticated environment for active case submission, record exchange, status visibility, review, revision, approval and deliverable access." },
      { q: "Can I save and resume a case?", a: "The portal workflow supports draft, save, exit and resume behaviour where configured for the user and case route." },
      { q: "Where can I see pricing?", a: "Pricing depends on workflow type, case complexity, delivery scope, region and current operational approval. Public pricing is published only when the current approved pricing sheet supports it." },
    ],
  },
];

export default async function FaqPage() {
  // Reviewed static FAQs are the baseline; FAQs added in the CMS are appended
  // (grouped by their category) so the team can extend without losing content.
  const cmsFaqs = await getFaqEntries();
  const cmsByCategory = new Map<string, QA[]>();
  for (const f of cmsFaqs) {
    const cat = f.category?.trim() || "More practice questions";
    const list = cmsByCategory.get(cat) ?? [];
    list.push({ q: f.question, a: f.answer });
    cmsByCategory.set(cat, list);
  }
  const cmsGroups = [...cmsByCategory.entries()].map(([title, items]) => ({ title, items }));
  const allGroups = [...groups, ...cmsGroups];
  const allFaqs = [...priority, ...allGroups.flatMap((g) => g.items)];
  return (
    <>
      <FaqPageJsonLd items={allFaqs} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq/" },
        ]}
      />
      <PageHero
        eyebrow="Practice questions"
        h1="Questions before you start a case? Start here."
        body="Clear answers for practices planning guided surgery, design-only workflows, full-arch cases, global collaboration and Case Portal submission."
        note="This FAQ explains workflow routes and preparation steps. Clinical records, patient-identifying information, approvals and active case tracking remain inside the authenticated Case Portal or another approved professional intake route."
        primary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
        secondary={{ label: cta.openPortal.label, href: cta.openPortal.href, external: true }}
      />

      <Section aria-labelledby="top5-h">
        <span aria-hidden className="tech-rule mb-4 block" />
        <h2 id="top5-h">Most practices ask these first</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {priority.map((qa) => (
            <div key={qa.q} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-sm)]">
              <h3 className="text-base">{qa.q}</h3>
              <p className="mt-2 text-sm text-ink">{qa.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="tint" aria-labelledby="cats-h">
        <h2 id="cats-h">Browse by topic</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {allGroups.map((g) => (
            <div key={g.title}>
              <h3 className="mb-3 text-lg">{g.title}</h3>
              <Accordion items={g.items} />
            </div>
          ))}
        </div>
      </Section>

      <Section aria-labelledby="faq-cta-h" width="narrow" className="text-center">
        <h2 id="faq-cta-h">Still unsure where your case fits?</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink">
          Send a general enquiry and the team will guide you to the right workflow before clinical
          records are submitted.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={cta.discussCase.href}>{cta.discussCase.label}</ButtonLink>
          <ButtonLink href={cta.openPortal.href} variant="secondary" external>{cta.openPortal.label}</ButtonLink>
        </div>
      </Section>
    </>
  );
}
