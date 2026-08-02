import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { cta } from "@/content/cta-routes";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: "Privacy Notice | Image3DConversion" },
  alternates: { canonical: "/privacy/" },
};

const sections: { h: string; p: string[] }[] = [
  {
    h: "1. About this notice",
    p: [
      "This notice explains how Image3DConversion (“we”, “us”, “I3DC”) handles information collected through this public website and in the course of providing our digital dental workflow services. Image3DConversion provides digital implant planning, surgical guide design, radiology and reporting support, digital design and production support, and related services to dental professionals and authorised workflow partners.",
    ],
  },
  {
    h: "2. Information we collect",
    p: [
      "When you submit the website enquiry form, we collect the details you provide — such as your name, clinic or organisation, email, mobile/WhatsApp number, enquiry type, your message, and your consent to be contacted.",
      "We may also collect limited technical information (such as basic usage and analytics data) to operate and improve the website.",
      "Case files and clinical records needed to deliver a service are submitted and handled only through the authenticated I3DC Case Portal — not through this public website.",
    ],
  },
  {
    h: "3. How we use information",
    p: [
      "We use enquiry information to respond to you, understand your requirement, and coordinate the appropriate next step or workflow. We use case data you provide through the Case Portal solely to deliver the services you request. We use technical data to maintain and improve the website.",
    ],
  },
  {
    h: "4. No patient data on the public website",
    p: [
      "The public enquiry form is for general, portal, service-information and collaboration enquiries only. Please do not include patient-identifying information, clinical details, or files (for example DICOM, STL or CBCT) in the public form. Case-specific work is handled in the Case Portal.",
    ],
  },
  {
    h: "5. Sharing and service providers",
    p: [
      "We use trusted service providers to operate our business — for example customer-relationship and communication tools — and they process information on our behalf for those purposes. We do not sell personal information.",
    ],
  },
  {
    h: "6. Retention and security",
    p: [
      "We keep information for as long as needed to fulfil the purpose it was collected for, or as required by applicable law, and then delete or de-identify it. We apply reasonable technical and organisational safeguards appropriate to the information we handle.",
    ],
  },
  {
    h: "7. Your choices",
    p: [
      "You may contact us to ask about the information we hold about you, to update it, or to request its deletion, subject to applicable law and any records we must retain. Where we contact you about an enquiry, we rely on the consent you provide when submitting the form.",
    ],
  },
  {
    h: "8. Governing law",
    p: [
      "This notice and our handling of information are governed by the laws of India.",
    ],
  },
  {
    h: "9. Contact",
    p: [
      "For any privacy question or request, contact us at info@image3dconversion.com.",
    ],
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        h1="Privacy Notice"
        body="How Image3DConversion handles information from this website and in delivering our digital dental workflow services."
        note="The public website never collects patient records. Clinical files are submitted only through the authenticated Case Portal, and clinical responsibility remains with the treating clinician."
        primary={{ label: cta.discussCase.label, href: cta.discussCase.href }}
      />
      <Section width="narrow" aria-labelledby="privacy-h">
        <h2 id="privacy-h" className="sr-only">Privacy Notice</h2>
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
          This page provides general information about how we handle data. For a specific request,
          contact{" "}
          <a href={`mailto:${contact.email}`} className="font-semibold text-brand underline underline-offset-4">
            {contact.email}
          </a>.
        </p>
      </Section>
    </>
  );
}
