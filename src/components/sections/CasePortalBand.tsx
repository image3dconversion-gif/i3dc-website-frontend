import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { cta } from "@/content/cta-routes";
import { home } from "@/content/pages/home";

/**
 * Case Portal shown as a distinct, separate secure system — visually set apart
 * from the website workflow. Illustrated with a static, dummy-data status track
 * (neutral chips; the real functional colours live inside the portal).
 */
export function CasePortalBand() {
  const p = home.casePortal;
  return (
    <Section aria-labelledby="portal-h">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line-strong bg-white shadow-[var(--shadow-float)]">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Left: explanation */}
          <div className="p-8 sm:p-10">
            <Eyebrow>{p.eyebrow}</Eyebrow>
            <h2 id="portal-h">{p.h2}</h2>
            <p className="mt-4 text-ink">{p.body}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={cta.startCase.href} external={cta.startCase.external}>
                {cta.startCase.label}
              </ButtonLink>
              <ButtonLink href={cta.openPortal.href} variant="secondary" external>
                {cta.openPortal.label}
              </ButtonLink>
            </div>
          </div>

          {/* Right: the "separate system" surface */}
          <div className="grid-surface border-t border-line p-8 sm:p-10 lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Case Portal
            </p>
            <ul className="mt-4 space-y-2">
              {p.threeQuestions.map((q) => (
                <li
                  key={q}
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white px-4 py-3 text-sm font-semibold text-heading shadow-[var(--shadow-sm)]"
                >
                  <span aria-hidden className="text-brand">▸</span>
                  {q}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
              Case status track
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.statuses.map((s, i) => (
                <span
                  key={s}
                  className={
                    "rounded-pill border px-3 py-1 text-xs font-semibold " +
                    (i === 3
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white text-muted")
                  }
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
