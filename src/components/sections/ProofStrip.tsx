import { Section } from "@/components/ui/Section";

/**
 * FUTURE-READY, INTENTIONALLY NOT MOUNTED.
 *
 * This component is a placeholder structure for real, approved, consented
 * proof (dentist/partner quotes, permitted partner logos). It is NOT imported
 * or rendered anywhere — per direction, no empty or fake testimonial block is
 * shown publicly. When genuine quotes/logos are approved (with source + owner +
 * consent), pass them in and mount this on the homepage (between "Five steps"
 * and "Global practice fit"), on workflow pages, and on About.
 *
 * Do NOT fabricate quotes, client names, clinic names, logos or results.
 */
export interface Testimonial {
  quote: string;
  attribution: string; // role + region only unless the person approves their name
}

export function ProofStrip({
  heading = "What partners say",
  testimonials,
}: {
  heading?: string;
  testimonials: Testimonial[];
}) {
  if (!testimonials || testimonials.length === 0) return null; // never render empty
  return (
    <Section tone="tint" aria-labelledby="proof-h">
      <h2 id="proof-h">{heading}</h2>
      <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <li key={t.attribution} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-sm)]">
            <p className="text-ink">“{t.quote}”</p>
            <p className="mt-4 text-sm font-semibold text-heading">{t.attribution}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
