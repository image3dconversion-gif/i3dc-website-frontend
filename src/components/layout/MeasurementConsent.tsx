"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  PREFERENCES_EVENT,
  readMeasurementConsent,
  setMeasurementConsent,
  subscribeMeasurementConsent,
} from "@/lib/meta/consent";

const choiceCls =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-card)] border border-brand bg-white px-4 text-sm font-bold text-brand transition-colors hover:bg-blue-50 sm:flex-none";

/**
 * The measurement choice. Rendered by the root layout only while the Meta gate is
 * open, so a build with tracking off shows no banner at all.
 *
 * Nothing is preselected and both answers carry equal weight. It sits at the foot
 * of the page and stays compact, because it must never obstruct an enquiry form:
 * an unanswered banner simply means no measurement, and the form works regardless.
 */
export function MeasurementConsentBanner() {
  const consent = useSyncExternalStore(subscribeMeasurementConsent, readMeasurementConsent, () => "UNKNOWN");
  const [mounted, setMounted] = useState(false);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    setMounted(true);
    const reopen = () => setReopened(true);
    window.addEventListener(PREFERENCES_EVENT, reopen);
    return () => window.removeEventListener(PREFERENCES_EVENT, reopen);
  }, []);

  if (!mounted) return null;
  if (!reopened && (consent === "ALLOW" || consent === "DENY")) return null;

  function choose(state: "ALLOW" | "DENY") {
    setMeasurementConsent(state);
    setReopened(false);
  }

  return (
    <section
      aria-label="Advertising measurement choice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line-strong bg-white px-4 py-3 shadow-[var(--shadow-float)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink sm:text-sm">
          May we use the Meta Pixel to measure whether our ads lead to visits and enquiries? Nothing
          goes to Meta unless you allow it.{" "}
          <a href="/privacy/#measurement" className="font-semibold text-brand underline underline-offset-2">
            Learn more
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className={choiceCls} onClick={() => choose("ALLOW")}>
            Allow
          </button>
          <button type="button" className={choiceCls} onClick={() => choose("DENY")}>
            Don&rsquo;t allow
          </button>
        </div>
      </div>
    </section>
  );
}

/** Lets a visitor change an earlier answer. Rendered in the footer while the gate is open. */
export function MeasurementPreferencesLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(PREFERENCES_EVENT))}
      className="text-sm text-ink underline underline-offset-2 hover:text-brand"
    >
      Measurement preferences
    </button>
  );
}
