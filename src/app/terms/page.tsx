import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { cta } from "@/content/cta-routes";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Image3DConversion" },
  alternates: { canonical: "/terms/" },
};

const sections: { h: string; p: string[] }[] = [
  {
    h: "1. About Image3DConversion",
    p: [
      "Image3DConversion (“we”, “us”, “I3DC”) provides digital implant planning, surgical guide design, radiology and reporting support, digital design and production support, and related digital dental workflow services. These services are provided to dental professionals and authorised workflow partners.",
      "This website presents information about our services and lets professionals start an enquiry. By using this website or engaging our services, you agree to these terms.",
    ],
  },
  {
    h: "2. No medical advice or patient treatment",
    p: [
      "This website and our services do not provide medical or dental diagnosis, advice, or treatment to patients, and using this website does not create a dentist–patient or doctor–patient relationship.",
      "Our outputs — plans, designs, guides, reports and related deliverables — are decision-support tools prepared for a treating clinician. All clinical decisions, diagnosis, treatment planning and execution remain the sole responsibility of the treating dentist or clinician.",
    ],
  },
  {
    h: "3. Professional use",
    p: [
      "Services are intended for dental professionals and authorised laboratory, vendor and workflow partners. You confirm that you are authorised to engage these services and to provide any case information you submit.",
    ],
  },
  {
    h: "4. Case data and uploaded files",
    p: [
      "Files and case records you provide (for example scans, radiographs and related data) are used to deliver the services you request. You confirm you have the necessary rights, permissions and patient consents to share this data with us for that purpose.",
      "Do not submit patient-identifying information or clinical files through the public website or its enquiry form. Case files are handled only through the authenticated I3DC Case Portal.",
    ],
  },
  {
    h: "5. Quotes, timelines and deliverables",
    p: [
      "Quotes, turnaround timelines and the scope of deliverables depend on the quality and completeness of the case data provided and the agreed service scope. Estimates may change if the inputs, requirements or scope change.",
    ],
  },
  {
    h: "6. No guarantee of clinical or surgical outcome",
    p: [
      "We prepare digital planning and design outputs to a professional standard, but we do not guarantee any clinical or surgical outcome. Suitability, verification and clinical use of any deliverable rest with the treating clinician, who must review and validate it before use.",
    ],
  },
  {
    h: "7. Intellectual property",
    p: [
      "Website content and our proprietary materials remain our property or that of our licensors. Deliverables prepared for a specific case are provided for that engagement; rights and permitted use are as set out in the applicable service agreement or quotation.",
    ],
  },
  {
    h: "8. Limitation of liability",
    p: [
      "To the maximum extent permitted by applicable law, we are not liable for any indirect or consequential loss, or for clinical decisions or outcomes, which remain the responsibility of the treating clinician. Nothing in these terms excludes liability that cannot be excluded by law.",
    ],
  },
  {
    h: "9. Governing law",
    p: [
      "These terms are governed by and construed in accordance with the laws of India, and the courts of India have jurisdiction, without prejudice to any specific terms agreed in a separate service agreement.",
    ],
  },
  {
    h: "10. Changes and contact",
    p: [
      "We may update these terms from time to time; the current version is published on this page. For any question about these terms, contact us at info@image3dconversion.com.",
    ],
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        h1="Terms of Service"
        body="The terms that apply when you use the Image3DConversion website and our digital dental workflow services."
        note="Services are provided to dental professionals and authorised workflow partners. The treating clinician retains clinical authority. Clinical records are submitted only through the authenticated Case Portal — never a public form."
        primary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
      />
      <Section width="narrow" aria-labelledby="terms-h">
        <h2 id="terms-h" className="sr-only">Terms of Service</h2>
        <p className="text-sm text-muted">Last updated: August 2026</p>
        <div className="mt-8 space-y-10">
          {sections.map((s) => (
            <div key={s.h}>
              <h3 className="text-heading">{s.h}</h3>
              {s.p.map((para, i) => (
                <p key={i} className="mt-3 text-ink">{para}</p>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          This page provides general information about our services. For anything specific to your
          engagement, contact{" "}
          <a href={`mailto:${contact.email}`} className="font-semibold text-brand underline underline-offset-4">
            {contact.email}
          </a>.
        </p>
      </Section>
    </>
  );
}
