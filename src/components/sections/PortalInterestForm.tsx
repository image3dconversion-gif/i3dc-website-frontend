"use client";

import { useEffect, useState } from "react";
import { contact } from "@/content/site";
import { captureAcquisition } from "@/lib/attribution/acquisition";
import { readMeasurementConsent } from "@/lib/meta/consent";
import type { EnquiryPayload } from "@/lib/enquiry/types";

/**
 * Case Portal INVITATION REQUEST capture.
 *
 * The Case Portal is live but invite-only, and public registration is not open.
 * The primary public portal CTA lands here, so this form's job is to turn that
 * high-intent arrival into a reviewable invitation request — while making no
 * claim that access is automatic.
 *
 * It posts to the SAME /api/enquiry route as the enquiry form, with
 * `formType: "portal-interest"`. The server decides everything the CRM sees:
 * the client cannot set a CRM value directly. Per the CRM contract this
 * submission carries acquisition and intention FACTS only — no Journey_Stage,
 * no V2 state — because the CRM derives lifecycle state itself.
 *
 * CONSENT: the reply permission is a SEPARATE, unticked checkbox. It is
 * required here because replying to the person is the entire purpose of the
 * form — but it must still be ticked deliberately, never pre-ticked. Any change
 * to this wording requires CONSENT_WORDING_VERSION to be incremented, and it
 * was: the 2026-09-22.v3 bump covers this repositioning.
 */
const fieldCls =
  "mt-1.5 w-full rounded-[var(--radius-card)] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-[var(--focus-ring)]/40";
const labelCls = "block text-sm font-semibold text-heading";
const req = <span className="text-brand"> *</span>;

type Status = "idle" | "submitting" | "success" | "error";

export function PortalInterestForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fallbackRef, setFallbackRef] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    utm?: EnquiryPayload["utm"];
    attribution?: EnquiryPayload["attribution"];
  }>({});

  useEffect(() => {
    const acquisition = captureAcquisition();
    setMeta({ utm: acquisition.utm, attribution: acquisition });
  }, []);

  if (status === "success") {
    return (
      <div
        id="notify"
        className="rounded-[var(--radius-card)] border border-line-strong bg-white p-8 shadow-[var(--shadow-float)]"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Request received</p>
        <h3 className="mt-2">Thanks — your invitation request is with our team.</h3>
        <p className="mt-3 text-sm text-ink">
          We review each request and reply by email with the next step. Nothing else.
        </p>
        <p className="mt-4 text-sm text-ink">
          If you have a case to discuss in the meantime,{" "}
          <a href="/discuss-a-case/" className="font-semibold text-brand underline underline-offset-4">
            discuss a case now
          </a>
          .
        </p>
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
      formType: "portal-interest",
      // The server forces "general" for this form; sent for contract clarity.
      inquiryType: "general",
      name: String(fd.get("name") || ""),
      organization: String(fd.get("org") || "") || undefined,
      phone: String(fd.get("phone") || "") || undefined,
      email: String(fd.get("email") || ""),
      message: "",
      consent: fd.get("consent") === "on",
      // Read independently — each permission is earned by its own tick.
      consentEmailMarketing: fd.get("consentEmailMarketing") === "on",
      consentWhatsAppMarketing: fd.get("consentWhatsAppMarketing") === "on",
      consentWhatsAppOperational: false,
      companyWebsite: String(fd.get("companyWebsite") || ""), // honeypot
      pageSource: "/case-portal/",
      utm: meta.utm,
      attribution: meta.attribution,
      measurementConsent: readMeasurementConsent(),
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
        // Deliberately NO Meta Lead: a portal pre-launch notification request is
        // not a new-business service acquisition. The CRM still records it.
        setStatus("success");
        return;
      }
      const firstErr =
        data.errors && typeof data.errors === "object"
          ? String(Object.values(data.errors)[0])
          : data.error;
      if (data.action === "fallback") setFallbackRef(data.requestId || "");
      setErrorMsg(firstErr || "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      id="notify"
      noValidate
      onSubmit={onSubmit}
      className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-float)] sm:p-8"
    >
      {/* Honeypot — hidden from humans; bots that fill it are rejected. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="pi-companyWebsite">Company website</label>
        <input id="pi-companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </div>

      <h3>Request an invitation</h3>
      <p className="mt-2 text-sm text-muted">
        The Case Portal is live for invited practices; public registration is not open. Leave your
        professional details and we&rsquo;ll review your request.
      </p>

      {status === "error" && (
        <div role="alert" className="mt-5 rounded-[var(--radius-card)] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{errorMsg}</p>
          {fallbackRef !== null && (
            <>
              <p className="mt-2">Please send your details to us directly instead.</p>
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
                    WhatsApp only — no calls: <span className="font-semibold">{contact.whatsapp}</span>
                  </li>
                )}
              </ul>
              {fallbackRef && <p className="mt-2 text-xs text-red-700">Reference: {fallbackRef}</p>}
            </>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="pi-name">Name{req}</label>
          <input id="pi-name" name="name" required autoComplete="name" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pi-org">Clinic / organisation</label>
          <input id="pi-org" name="org" autoComplete="organization" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pi-email">Professional email{req}</label>
          <input id="pi-email" name="email" type="email" required autoComplete="email" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pi-phone">Mobile / WhatsApp</label>
          <input id="pi-phone" name="phone" type="tel" autoComplete="tel" className={fieldCls} />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40" />
          <span>
            I agree to Image3DConversion handling these details to review this invitation request,
            and confirm no patient-identifying information is included.{req}
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" name="consentEmailMarketing" required className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40" />
          <span>Email me about my I3DC Case Portal invitation request.{req}</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" name="consentWhatsAppMarketing" className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40" />
          <span>Also reply on WhatsApp about this request (optional).</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-card)] bg-brand px-6 text-base font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
      >
        {status === "submitting" ? "Sending…" : "Request an Invitation"}
      </button>

      <p className="mt-4 text-xs text-muted">
        Need something now? <a href="/discuss-a-case/" className="font-semibold text-brand underline underline-offset-4">Discuss a Case Now</a>.
      </p>
    </form>
  );
}
