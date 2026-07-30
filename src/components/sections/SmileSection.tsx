import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ImageOrSlot } from "@/components/ui/ImageOrSlot";
import { home } from "@/content/pages/home";

/**
 * Homepage "Start with the smile" — editorial two-up. Left: the aesthetic-first
 * argument plus the design order as a connected process spine (smile reference →
 * guided execution). Right: the consented smile + tooth-setup visual (P0-3),
 * rendered as a labelled slot until that consented asset is approved.
 *
 * Replaces the previous inline `marginLeft` staircase, which could indent past
 * the viewport on small screens. The spine uses padding/flow only — no negative
 * offsets — so it is robust at every width.
 */
export function SmileSection() {
  const s = home.smile;
  return (
    <Section aria-labelledby="smile-h">
      <div className="grid items-center gap-10 lg:grid-cols-[47fr_53fr] lg:gap-14">
        {/* Left: argument + process spine */}
        <div>
          <Eyebrow>Start with the smile</Eyebrow>
          <h2 id="smile-h">{s.h2}</h2>
          <p className="mt-4 max-w-xl text-ink">{s.body}</p>

          <ol className="mt-8 space-y-0">
            {s.designOrder.map((label, i) => {
              const last = i === s.designOrder.length - 1;
              return (
                <li key={label} className="flex gap-4">
                  {/* node + connector rail */}
                  <div className="flex flex-col items-center">
                    <span
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-sm font-bold " +
                        (last
                          ? "bg-brand text-white"
                          : "border border-line-strong bg-white text-brand")
                      }
                    >
                      {i + 1}
                    </span>
                    {!last && (
                      <span aria-hidden className="my-1 w-px flex-1 bg-line-strong" />
                    )}
                  </div>
                  <span
                    className={
                      "pt-1.5 font-semibold " +
                      (last ? "text-brand" : "text-heading") +
                      (last ? "" : " pb-4")
                    }
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Right: consented smile + tooth-setup (P0-3) — labelled slot until approved */}
        <div>
          <ImageOrSlot
            image={null}
            alt="Consented patient smile paired with the planned tooth setup, showing the aesthetic objective the plan is built to restore."
            slot="P0-3 · consented smile + tooth-setup pair (signed patient consent required)"
            label="Smile → planned tooth setup"
            ratio="4/3"
            sizes="(max-width: 1024px) 100vw, 560px"
          />
          <p className="mt-3 text-xs text-muted">
            The aesthetic objective is defined first, then supported by function, biology and
            anatomy — not the other way around.
          </p>
        </div>
      </div>
    </Section>
  );
}
