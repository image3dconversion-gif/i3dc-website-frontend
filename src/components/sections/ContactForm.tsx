"use client";

import { useEffect, useState } from "react";
import {
  INQUIRY_LABELS,
  INQUIRY_TYPES,
  type EnquiryPayload,
  type InquiryType,
} from "@/lib/enquiry/types";

/**
 * Public enquiry form.
 *
 * HARD BOUNDARY (unchanged): collects professional context + a NON-identifying
 * workflow summary only. No file-upload control, no patient-data field.
 *
 * It now submits to the same-origin server route `/api/enquiry`, which
 * validates and routes to Zoho CRM (guarded — dry-run until live submission is
 * approved and configured server-side). The visual design is unchanged; new
 * fields reuse the existing token classes.
 */

const WORKFLOWS = [
  "Guided Implant Planning",
  "Full-Arch / Stackable",
  "Immediate Loading",
  "Advanced Case (Zygoma / Pterygoid)",
  "Design-Only",
  "Design-to-Delivery",
  "Global Practice",
  "Partnership",
];
const CASE_TYPES = [
  "Single implant",
  "Multi-implant",
  "Full arch",
  "Immediate loading",
  "Zygoma / Pterygoid",
  "Design-only",
  "Partnership",
  "Not sure",
];
const URGENCY = ["Planning ahead", "Within a month", "Within two weeks", "Urgent"];

const fieldCls =
  "mt-1.5 w-full rounded-[var(--radius-card)] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-[var(--focus-ring)]/40";
const labelCls = "block text-sm font-semibold text-heading";
const req = <span className="text-brand"> *</span>;

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  defaultInquiryType = "discuss-a-case",
}: {
  defaultInquiryType?: InquiryType;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Capture attribution + page source on the client (no Suspense needed).
  const [meta, setMeta] = useState<{ pageSource?: string; utm?: EnquiryPayload["utm"] }>({});
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const utm = {
      source: p.get("utm_source") || undefined,
      medium: p.get("utm_medium") || undefined,
      campaign: p.get("utm_campaign") || undefined,
      content: p.get("utm_content") || undefined,
    };
    setMeta({
      pageSource: window.location.pathname,
      utm: Object.values(utm).some(Boolean) ? utm : undefined,
    });
  }, []);

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line-strong bg-white p-8 shadow-[var(--shadow-float)]">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Enquiry sent</p>
        <h3 className="mt-2">Thanks — your workflow enquiry has been received.</h3>
        <p className="mt-3 text-sm text-ink">{successMsg}</p>
        <p className="mt-4 rounded-[var(--radius-card)] border border-line bg-blue-50 px-4 py-3 text-xs text-muted">
          If clinical records are needed, we’ll route you to the authenticated Case Portal —
          never a public form.
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
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || "") || undefined,
      city: String(fd.get("location") || "") || undefined,
      organization: String(fd.get("org") || "") || undefined,
      role: String(fd.get("role") || "") || undefined,
      serviceInterest: String(fd.get("caseType") || "") || undefined,
      workflowInterest: String(fd.get("workflow") || "") || undefined,
      urgency: String(fd.get("urgency") || "") || undefined,
      preferredCallback: String(fd.get("preferredCallback") || "") || undefined,
      existingCustomer: fd.get("existingCustomer") === "on",
      message: String(fd.get("summary") || ""),
      consent: fd.get("consent") === "on",
      companyWebsite: String(fd.get("companyWebsite") || ""), // honeypot
      pageSource: meta.pageSource,
      utm: meta.utm,
    };

    setStatus("submitting");
    setErrorMsg("");
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
            "We’ll review the workflow category and professional context, then confirm the right next step.",
        );
        setStatus("success");
      } else {
        const firstErr =
          data.errors && typeof data.errors === "object"
            ? String(Object.values(data.errors)[0])
            : data.error;
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
          {errorMsg}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="name">Name{req}</label>
          <input id="name" name="name" required autoComplete="name" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="org">Practice / organisation{req}</label>
          <input id="org" name="org" required autoComplete="organization" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="role">Professional role{req}</label>
          <input id="role" name="role" required placeholder="Dentist, surgeon, lab, DSO, partner…" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="email">Professional email{req}</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="phone">Phone / WhatsApp</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="location">City and country{req}</label>
          <input id="location" name="location" required className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="inquiryType">Enquiry type{req}</label>
          <select id="inquiryType" name="inquiryType" required defaultValue={defaultInquiryType} className={fieldCls}>
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>{INQUIRY_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="workflow">Workflow interest{req}</label>
          <select id="workflow" name="workflow" required defaultValue="" className={fieldCls}>
            <option value="" disabled>Select a workflow…</option>
            {WORKFLOWS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="caseType">Case / service type</label>
          <select id="caseType" name="caseType" defaultValue="" className={fieldCls}>
            <option value="">Optional…</option>
            {CASE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="urgency">Case urgency</label>
          <select id="urgency" name="urgency" defaultValue="" className={fieldCls}>
            <option value="">Optional…</option>
            {URGENCY.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="preferredCallback">Preferred callback time</label>
          <input id="preferredCallback" name="preferredCallback" placeholder="e.g. weekday mornings IST" className={fieldCls} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="existingCustomer" className="h-4 w-4 rounded border-line-strong text-brand focus:ring-[var(--focus-ring)]/40" />
            I’m an existing customer
          </label>
        </div>
      </div>

      {/* Privacy notice sits directly above the message field. */}
      <div className="mt-6 rounded-[var(--radius-card)] border border-line-strong bg-blue-50 px-4 py-3">
        <p className="text-sm font-semibold text-heading">
          Do not include patient-identifying information or clinical files here.
        </p>
        <p className="mt-1 text-xs text-muted">
          No DICOM, STL, photographs or prescriptions. Clinical records are submitted only
          through the authenticated Case Portal after the right route is confirmed.
        </p>
      </div>

      <div className="mt-5">
        <label className={labelCls} htmlFor="summary">Non-identifying workflow summary{req}</label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={4}
          placeholder="Briefly describe the workflow you’re considering — no patient names, record links or identifiers."
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

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-card)] bg-brand px-6 text-base font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
      >
        {status === "submitting" ? "Sending…" : "Send workflow enquiry"}
      </button>
    </form>
  );
}
