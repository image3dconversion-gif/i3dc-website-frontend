import type { ReactNode } from "react";

type IconVariant = "check" | "dot" | "alert";

interface IconListProps {
  items: ReactNode[];
  /** Icon marker style. check = affirmative list, alert = "watch out" list. */
  variant?: IconVariant;
  /** Render as a responsive card grid instead of a plain stack. */
  as?: "stack" | "cards";
  columns?: 2 | 3;
  className?: string;
}

/**
 * Line-icon list — replaces the ▪ "bullet wall" with a consistent brand-blue
 * marker so detail lists read as a designed system, not raw bullets. Server
 * component, inline SVG (no icon dependency), reuses tokens only.
 */
export function IconList({
  items,
  variant = "check",
  as = "stack",
  columns = 2,
  className = "",
}: IconListProps) {
  const grid =
    as === "cards"
      ? `grid gap-4 sm:grid-cols-2${columns === 3 ? " lg:grid-cols-3" : ""}`
      : "space-y-2.5";
  return (
    <ul className={`${grid} ${className}`}>
      {items.map((item, i) => (
        <li
          key={i}
          className={
            "flex items-start gap-3 text-sm text-ink " +
            (as === "cards"
              ? "rounded-[var(--radius-card)] border border-line bg-white px-4 py-3 shadow-[var(--shadow-sm)]"
              : "")
          }
        >
          <Marker variant={variant} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Marker({ variant }: { variant: IconVariant }) {
  if (variant === "dot") {
    return (
      <span
        aria-hidden
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
      />
    );
  }
  if (variant === "alert") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="mt-0.5 h-5 w-5 shrink-0 text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 6.5v4" />
        <circle cx="10" cy="13.5" r="0.25" fill="currentColor" stroke="none" />
        <path d="M10 2.5 1.8 16.5h16.4L10 2.5Z" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="mt-0.5 h-5 w-5 shrink-0 text-brand"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7.5" className="opacity-30" />
      <path d="m6.5 10.2 2.3 2.3 4.7-4.9" />
    </svg>
  );
}
