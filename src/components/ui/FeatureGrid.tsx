import { ButtonLink } from "@/components/ui/Button";

export interface FeatureItem {
  title: string;
  body: string;
  /** Optional utility link at the card foot. */
  href?: string;
  linkLabel?: string;
}

interface FeatureGridProps {
  items: readonly FeatureItem[];
  columns?: 2 | 3 | 4;
  /** Small brand accent rule atop each card. */
  accent?: boolean;
  className?: string;
}

const colClass: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Restrained premium card grid — the single home for the site's repeated
 * "title + body (+ optional link)" cards. Consistent hierarchy, a quiet
 * hover-lift, and the reduced-motion-safe `.reveal-up` entrance (transform-only,
 * so content is never hidden if motion does not run). Server component.
 */
export function FeatureGrid({
  items,
  columns = 3,
  accent = false,
  className = "",
}: FeatureGridProps) {
  return (
    <ul className={`grid gap-5 ${colClass[columns]} ${className}`}>
      {items.map((item, i) => (
        <li
          key={item.title}
          className="reveal-up flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {accent && (
            <span aria-hidden className="mb-3 block h-1 w-8 rounded-full bg-brand/70" />
          )}
          <h3 className="text-base">{item.title}</h3>
          <p className="mt-2 flex-1 text-sm text-ink">{item.body}</p>
          {item.href && item.linkLabel && (
            <p className="mt-4">
              <ButtonLink href={item.href} variant="utility">
                {item.linkLabel} →
              </ButtonLink>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
