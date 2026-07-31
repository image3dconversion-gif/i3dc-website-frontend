import type { ReactNode } from "react";
import { Container } from "./Container";

interface SectionProps {
  children: ReactNode;
  id?: string;
  /** Background rhythm: white (default), tinted, or the single blue band. */
  tone?: "white" | "tint" | "invert";
  width?: "default" | "narrow";
  className?: string;
  "aria-labelledby"?: string;
}

const tones = {
  white: "bg-white text-ink",
  tint: "surface-tint text-ink",
  invert: "band-navy text-[var(--text-on-invert)]",
} as const;

/**
 * Vertical section rhythm wrapper. White dominates; use `tint` for quiet
 * separation and, at most once per page, `invert` for a controlled blue band.
 */
export function Section({
  children,
  id,
  tone = "white",
  width = "default",
  className = "",
  ...aria
}: SectionProps) {
  return (
    <section
      id={id}
      className={`py-[var(--section-y)] ${tones[tone]} ${className}`}
      aria-labelledby={aria["aria-labelledby"]}
    >
      <Container width={width}>{children}</Container>
    </section>
  );
}
