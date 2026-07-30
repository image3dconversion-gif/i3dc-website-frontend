"use client";

import { useState } from "react";

/**
 * Public "Discuss a Case" enquiry form.
 *
 * HARD BOUNDARY: collects professional context + a NON-identifying workflow
 * summary only. There is NO file-upload control and no patient-data field. It
 * does not transmit — per the blueprint the approved/tested intake route (e.g.
 * the existing Zoho endpoint) must be wired before launch and must not be
 * silently replaced. On submit it validates and shows a local confirmation.
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
const NEXT_STEPS = [
  "Call",
  "Email reply",
  "Case Portal setup",
  "Global workflow discussion",
  "Partnership discussion",
];

const fieldCls =
  "mt-1.5 w-full rounded-[var(--radius-card)] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-[var(--focus-ring)]/40";
const labelCls = "block text-sm font-semibold text-heading";
const req = <span className="text-brand"> *</span>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line-strong bg-white p-8 shadow-[var(--shadow-float)]">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Enquiry ready</p>
        <h3 className="mt-2">Thanks — your workflow enquiry is ready to send.</h3>
        <p className="mt-3 text-sm text-ink">
          We’ll review the workflow category and professional context, then confirm the
          right next step. If clinical records are needed, we’ll route you to the
          authenticated Case Portal — never a public form.
        </p>
        <p className="mt-4 rounded-[var(--radius-card)] border border-line bg-blue-50 px-4 py-3 text-xs text-muted">
          Note: this preview form does not transmit yet. The approved, tested intake
          route is connected before launch.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 text-sm font-bold text-brand underline underline-offset-4"
        >
          ← Edit the enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      id="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if ((e.currentTarget as HTMLFormElement).checkValidity()) setSubmitted(true);
        else (e.currentTarget as HTMLFormElement).reportValidity();
      }}
      className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-float)] sm:p-8"
    >
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
          <label className={labelCls} htmlFor="workflow">Workflow interest{req}</label>
          <select id="workflow" name="workflow" required defaultValue="" className={fieldCls}>
            <option value="" disabled>Select a workflow…</option>
            {WORKFLOWS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="caseType">Case type</label>
          <select id="caseType" name="caseType" defaultValue="" className={fieldCls}>
            <option value="">Optional…</option>
            {CASE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
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

      <div className="mt-5 max-w-xs">
        <label className={labelCls} htmlFor="nextStep">Preferred next step</label>
        <select id="nextStep" name="nextStep" defaultValue="" className={fieldCls}>
          <option value="">Optional…</option>
          {NEXT_STEPS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <button
        type="submit"
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-card)] bg-brand px-6 text-base font-bold text-white transition-colors hover:bg-brand-hover"
      >
        Send workflow enquiry
      </button>
    </form>
  );
}
