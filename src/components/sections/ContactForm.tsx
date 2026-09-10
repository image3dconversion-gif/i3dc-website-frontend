"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  INQUIRY_LABELS,
  INQUIRY_TYPES,
  SERVICE_KEYS,
  SERVICE_LABELS,
  type EnquiryPayload,
  type InquiryType,
  type ServiceKey,
} from "@/lib/enquiry/types";
import { captureAcquisition } from "@/lib/attribution/acquisition";
import { contact } from "@/content/site";

/**
 * Public enquiry form — GENERIC-INQUIRY funnel only.
 *
 * HARD BOUNDARY: collects generic questions, portal help, service information at
 * category level, collaboration, and lab/vendor interest. It is NOT a
 * case/service-order funnel — no case files, DICOM/STL/CBCT, pricing, planning,
 * guide design, production, or case status. Those live only in the I3DC Case
 * Portal. Collected fields are exactly: Name, Clinic/Organization,
 * Mobile/WhatsApp, Email, Inquiry Type, Message, Existing Customer, Consent, and
 * (auto) Page Submitted From.
 *
 * Submits to the same-origin route `/api/enquiry`, which validates and routes to
 * Zoho CRM (guarded — dry-run until live submission is approved server-side).
 *
 * If the CRM submission fails, the route answers 503 and the form says so
 * plainly rather than showing a false success. The entered values are left in
 * place and the founder-approved direct channels are offered, so the enquiry is
 * never silently lost.
 */

const fieldCls =
  "mt-1.5 w-full rounded-[var(--radius-card)] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-[var(--focus-ring)]/40";
const labelCls = "block text-sm font-semibold text-heading";
const req = <span className="text-brand"> *</span>;

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  defaultInquiryType = "general",
}: {
  defaultInquiryType?: InquiryType;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  // Set when the CRM could not be reached: switches the error block into the
  // "contact us directly" state. Null for ordinary validation errors.
  const [fallbackRef, setFallbackRef] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Capture attribution + page source on the client (no Suspense needed).
  const searchParams = useSearchParams();

  /**
   * The chosen service card, DERIVED from the live URL on every render.
   *
   * It must not be captured once on mount. The cards use next/link, so clicking
   * one is a client-side soft navigation WITHIN this same route: React keeps
   * this component instance alive and a mount-only effect never re-runs. The
   * URL would show ?service=… while the form still believed nothing was chosen,
   * and the selection was dropped from the payload — which is exactly how a
   * live enquiry reached the CRM with Service_Interest empty.
   */
  const requestedService = searchParams.get("service") ?? "";
  const serviceKey = SERVICE_KEYS.includes(requestedService as ServiceKey)
    ? (requestedService as ServiceKey)
    : undefined;

  const [meta, setMeta] = useState<{
    pageSource?: string;
    utm?: EnquiryPayload["utm"];
    attribution?: EnquiryPayload["attribution"];
  }>({});
  useEffect(() => {
    // The acquisition touch is captured at the ENTRY page and carried across
    // navigation. Reading it here rather than from this page's own query string
    // is what stops campaign data being lost when a visitor arrives from an ad
    // on a service page and then clicks through to the form.
    //
    // Re-runs on searchParams for the same reason as above: a soft navigation
    // into this route must refresh what the form is about to send.
    const acquisition = captureAcquisition();
    setMeta({
      pageSource: window.location.pathname,
      utm: acquisition.utm,
      attribution: acquisition,
    });
  }, [searchParams]);

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line-strong bg-white p-8 shadow-[var(--shadow-float)]">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Enquiry sent</p>
        <h3 className="mt-2">Thanks — your enquiry has been received.</h3>
        <p className="mt-3 text-sm text-ink">{successMsg}</p>
        <p className="mt-4 rounded-[var(--radius-card)] border border-line bg-blue-50 px-4 py-3 text-xs text-muted">
          For a specific case, files, pricing, planning, or case status, we’ll point you to the
          authenticated I3DC Case Portal — never a public form.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-bold text-brand underline underline-offset-4"
        >
          ← Send another enquiry
        </button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }
    const fd = new FormData(formEl);
    const payload: EnquiryPayload = {
      inquiryType: (fd.get("inquiryType") as InquiryType) || defaultInquiryType,
      name: String(fd.get("name") || ""),
      organization: String(fd.get("org") || "") || undefined,
      phone: String(fd.get("phone") || "") || undefined,
      email: String(fd.get("email") || ""),
      message: String(fd.get("summary") || ""),
      existingCustomer: fd.get("existingCustomer") === "on",
      consent: fd.get("consent") === "on",
      // Read independently — an unticked box is a refusal, not an inherited yes.
      consentWhatsAppOperational: fd.get("consentWhatsAppOperational") === "on",
      consentEmailMarketing: fd.get("consentEmailMarketing") === "on",
      consentWhatsAppMarketing: fd.get("consentWhatsAppMarketing") === "on",
      companyWebsite: String(fd.get("companyWebsite") || ""), // honeypot
      formType: "enquiry",
      serviceKey,
      pageSource: meta.pageSource,
      utm: meta.utm,
      attribution: meta.attribution,
    };

    setStatus("submitting");
    setErrorMsg("");
    setFallbackRef(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.action === "redirect" && data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
        setSuccessMsg(
          data.message ||
            "We’ll review your question and confirm the right next step.",
        );
        setStatus("success");
      } else {
        const firstErr =
          data.errors && typeof data.errors === "object"
            ? String(Object.values(data.errors)[0])
            : data.error;
        if (data.action === "fallback") setFallbackRef(data.requestId || "");
        setErrorMsg(firstErr || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      id="form"
      noValidate
      onSubmit={onSubmit}
      className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-float)] sm:p-8"
    >
      {/* Honeypot — hidden from humans; bots that fill it are rejected. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="companyWebsite">Company website</label>
        <input id="companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "error" && (
        <div role="alert" className="mb-5 rounded-[var(--radius-card)] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{errorMsg}</p>
          {fallbackRef !== null && (
            <>
              <p className="mt-2">
                Your details are still in the form below — please send them to us
                directly and we’ll pick it up from there.
              </p>
              <ul className="mt-2 space-y-1">
                {contact.email && (
                  <li>
                    Email:{" "}
                    <a className="font-semibold underline" href={`mailto:${contact.email}`}>
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.whatsapp && (
                  <li>
                    WhatsApp only — no calls:{" "}
                    <span className="font-semibold">{contact.whatsapp}</span>
                  </li>
                )}
              </ul>
              {fallbackRef && (
                <p className="mt-2 text-xs text-red-700">Reference: {fallbackRef}</p>
              )}
            </>
          )}
        </div>
      )}

      {serviceKey && (
        <p className="mb-5 rounded-[var(--radius-card)] border border-line bg-bg-tint px-4 py-3 text-sm text-ink">
          Enquiring about <strong>{SERVICE_LABELS[serviceKey]}</strong>. Add anything else below.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="name">Name{req}</label>
          <input id="name" name="name" required autoComplete="name" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="org">Clinic / organisation{req}</label>
          <input id="org" name="org" required autoComplete="organization" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="phone">Mobile / WhatsApp</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="email">Professional email{req}</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="inquiryType">Enquiry type{req}</label>
          <select id="inquiryType" name="inquiryType" required defaultValue={defaultInquiryType} className={fieldCls}>
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>{INQUIRY_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="existingCustomer" className="h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40" />
            I’m an existing customer
          </label>
        </div>
      </div>

      {/* Boundary notice sits directly above the message field. */}
      <div className="mt-6 rounded-[var(--radius-card)] border border-line-strong bg-blue-50 px-4 py-3">
        <p className="text-sm font-semibold text-heading">
          For a specific case, price, file review, planning, guide design, or case status,
          please use the I3DC Case Portal.
        </p>
        <p className="mt-1 text-xs text-muted">
          This form is for general questions, portal help, and collaboration enquiries only.
          Do not include patient identifiers or clinical files (no DICOM, STL, CBCT, photographs
          or prescriptions) — those are handled securely in the authenticated Case Portal.
        </p>
      </div>

      <div className="mt-5">
        <label className={labelCls} htmlFor="summary">Your question{req}</label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={4}
          placeholder="Ask a general question about I3DC, portal access, service categories, or collaboration — no patient names, case files or identifiers."
          className={fieldCls}
        />
      </div>

      <div className="mt-5">
        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40" />
          <span>
            I agree to be contacted about this enquiry and confirm no patient-identifying
            information is included.{req}
          </span>
        </label>
      </div>

      {/*
        Three INDEPENDENT permissions, each optional and unticked by default.
        They are deliberately not bundled with the required consent above: that
        one permits handling this enquiry, these grant specific channels. Any
        change to this wording must bump CONSENT_WORDING_VERSION in
        lib/enquiry/types.ts, or stored consents become unauditable.
      */}
      <fieldset className="mt-5 rounded-[var(--radius-card)] border border-line bg-bg-tint p-4">
        <legend className="px-1 text-sm font-semibold text-heading">
          Optional — how else may we contact you?
        </legend>
        <p className="mb-3 mt-1 text-xs text-muted">
          All optional. Leave unticked to decline. You can withdraw any of these at any time.
        </p>
        <div className="space-y-2.5">
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="consentWhatsAppOperational"
              className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40"
            />
            <span>Send me WhatsApp updates about <strong>this enquiry</strong> (no marketing).</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="consentEmailMarketing"
              className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40"
            />
            <span>Email me occasional workflow guidance and service updates.</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="consentWhatsAppMarketing"
              className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40"
            />
            <span>Send me occasional updates on WhatsApp.</span>
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-card)] bg-brand px-6 text-base font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
