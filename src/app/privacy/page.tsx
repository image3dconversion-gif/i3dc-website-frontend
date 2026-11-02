import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { cta } from "@/content/cta-routes";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: "Privacy Notice | Image3DConversion" },
  alternates: { canonical: "/privacy/" },
};

const sections: { h: string; p: string[]; id?: string }[] = [
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
      "We use trusted service providers to operate our business — for example customer-relationship and communication tools — and they process information on our behalf for those purposes. Where you allow advertising measurement, Meta also receives the information described in section 6. We do not sell personal information.",
    ],
  },
  {
    id: "measurement",
    h: "6. Advertising measurement",
    p: [
      "Where advertising measurement is switched on, this website asks whether we may use the Meta Pixel. Nothing is preselected. Unless you choose Allow, including if you ignore the question or choose Don’t allow, the Pixel does not load and we send nothing to Meta about your visit.",
      "If you choose Allow, your browser loads the Meta Pixel, which reports the pages you view and uses Meta’s first-party cookies (_fbp and _fbc). If you then submit an enquiry or an invitation request and our customer-relationship system accepts it, our server tells Meta that a lead occurred, so we can measure whether our advertising works. That report contains the event details, the page address without its query string, your browser’s user-agent, and those cookie values when they are available.",
      "We do not send Meta your name, email address, phone number, IP address, organisation or message, whether in plain or hashed form, from this server report. Meta receives your IP address when your browser loads the Pixel, as with any website request, and handles Pixel data under its own terms.",
      "You can change your answer at any time using “Measurement preferences” in the website footer. If you withdraw permission, the Pixel stops sending, we expire its cookies on this website, and we ignore any such cookies that remain. Your choice is stored in your browser. Your enquiry works the same whichever you choose.",
      "Separately from Meta, and whatever you choose, we record the campaign details in the address you arrived from (such as UTM parameters and ad or click identifiers) with your enquiry, so we can understand how you found us.",
    ],
  },
  {
    h: "7. Retention and security",
    p: [
      "We keep information for as long as needed to fulfil the purpose it was collected for, or as required by applicable law, and then delete or de-identify it. We apply reasonable technical and organisational safeguards appropriate to the information we handle.",
    ],
  },
  {
    h: "8. Your choices",
    p: [
      "You may contact us to ask about the information we hold about you, to update it, or to request its deletion, subject to applicable law and any records we must retain. Where we contact you about an enquiry, we rely on the consent you provide when submitting the form.",
    ],
  },
  {
    h: "9. Governing law",
    p: [
      "This notice and our handling of information are governed by the laws of India.",
    ],
  },
  {
    h: "10. Contact",
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
        <p className="text-sm text-muted">Last updated: November 2026</p>
        <div className="mt-8 space-y-10">
          {sections.map((s) => (
            <div key={s.h} id={s.id} className={s.id ? "scroll-mt-24" : undefined}>
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
