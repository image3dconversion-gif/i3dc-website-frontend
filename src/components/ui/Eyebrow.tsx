import type { ReactNode } from "react";

/**
 * Small uppercase kicker above a heading. `tone="invert"` renders a light-blue
 * kicker for use on the navy hero/band surfaces (keeps AA contrast on navy).
 */
export function Eyebrow({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "invert";
}) {
  const color = tone === "invert" ? "text-blue-200" : "text-brand";
  return (
    <p className={`mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${color}`}>
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 rounded-full ${tone === "invert" ? "bg-blue-200" : "bg-brand"}`}
      />
      {children}
    </p>
  );
}
