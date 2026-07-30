import Link from "next/link";
import { serviceBySlug, type EngagementModel } from "@/content/services";

const engagementLabel: Record<EngagementModel, string> = {
  "design-only": "Design only",
  "design-to-delivery": "Design to delivery",
  "white-label": "White-label",
};

const colClass: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Renders service cards from the structured service model (src/content/services.ts)
 * — name, summary and engagement badges — so the Services page reads from one
 * typed source a CMS can later populate. Whole card is one crawlable link. Uses
 * the reduced-motion-safe `.reveal-up` (transform-only; never hides content).
 */
export function ServiceGrid({
  slugs,
  columns = 4,
  className = "",
}: {
  slugs: string[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const items = slugs.map((s) => serviceBySlug[s]).filter(Boolean);
  return (
    <ul className={`grid gap-5 ${colClass[columns]} ${className}`}>
      {items.map((s, i) => (
        <li key={s.slug}>
          <Link
            href={s.href}
            className="reveal-up group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-[var(--shadow-float)]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <h3 className="text-base">{s.name}</h3>
            <p className="mt-2 flex-1 text-sm text-ink">{s.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {s.engagement.map((e) => (
                <span
                  key={e}
                  className="rounded-pill border border-line px-2 py-0.5 text-[11px] font-semibold text-muted"
                >
                  {engagementLabel[e]}
                </span>
              ))}
            </div>
            <span className="mt-4 text-sm font-bold text-brand group-hover:text-brand-hover">
              Explore <span aria-hidden>→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
