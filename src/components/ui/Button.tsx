import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "utility" | "inverse" | "inverseOutline";

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  /** Opens in a new tab for the separate authenticated portal app. */
  external?: boolean;
  className?: string;
  /** Accessible name override when the visible label is not descriptive. */
  ariaLabel?: string;
}

/*
 * Buttons: minimum 48px high, concrete labels, radius ≤ 8px.
 * primary = solid brand blue · secondary = outlined · utility = text link.
 * (Homepage v1.2 §6.)
 */
const base =
  "inline-flex items-center justify-center gap-2 min-h-12 rounded-[var(--radius-card)] " +
  "px-6 text-base font-bold transition-colors focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary:
    "border border-line-strong text-brand bg-white hover:border-brand hover:text-brand-hover",
  utility:
    "min-h-0 px-0 font-normal text-brand underline underline-offset-4 hover:text-brand-hover",
  // For use on the navy band: solid white fill / navy text, and a light outline.
  inverse: "bg-white text-brand hover:bg-blue-50",
  inverseOutline:
    "border border-white/50 bg-transparent text-white hover:border-white hover:bg-white/10",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
  ariaLabel,
}: ButtonLinkProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (external) {
    return (
      <a
        href={href}
        className={cls}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
