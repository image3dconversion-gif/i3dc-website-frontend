import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Role/function-based credibility block. Shows that Image3DConversion is an
 * operating workflow team with defined responsibilities — WITHOUT naming staff,
 * publishing photos, titles or credentials (none of which are approved).
 * Functions only; the treating clinician always retains clinical authority.
 */
const roles = [
  { t: "Case coordination", d: "A named point of contact keeps each case moving, from first enquiry to delivered files." },
  { t: "Technical operations review", d: "Data completeness, scan alignment and workflow feasibility are checked before planning begins." },
  { t: "Clinical review support", d: "Clinical statements and case direction are reviewed by an appropriately qualified reviewer." },
  { t: "Planning & guide design", d: "Restoration-led implant planning and guide/provisional design within the agreed scope." },
  { t: "Production QA", d: "Where production is in scope, deliverables pass documented quality checks before release." },
  { t: "Delivery communication", d: "Status, plan review, approvals and dispatch or file readiness are communicated in one place." },
];

export function RoleTrust({ tone = "tint" }: { tone?: "white" | "tint" }) {
  return (
    <Section tone={tone} aria-labelledby="roles-h">
      <span aria-hidden className="tech-rule mb-4 block" />
      <div className="max-w-2xl">
        <Eyebrow>How the team is organised</Eyebrow>
        <h2 id="roles-h">A defined workflow team, not a single desk.</h2>
        <p className="mt-4 text-ink">
          Each case moves through defined responsibilities. We describe these as functions rather
          than a staff list — the people are real, and the treating clinician always retains
          clinical authority.
        </p>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <li key={r.t} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-sm)]">
            <h3 className="text-base">{r.t}</h3>
            <p className="mt-2 text-sm text-ink">{r.d}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
