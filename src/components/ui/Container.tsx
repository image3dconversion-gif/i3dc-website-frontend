import type { ElementType, ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  as?: ElementType;
  /** narrow = readable prose width; default = full content max. */
  width?: "default" | "narrow";
  className?: string;
}

/** Centered content column with the site gutter and max-width. */
export function Container({
  children,
  as: Tag = "div",
  width = "default",
  className = "",
}: ContainerProps) {
  const max = width === "narrow" ? "max-w-[var(--content-narrow)]" : "max-w-[var(--content-max)]";
  return (
    <Tag className={`mx-auto w-full ${max} px-5 ${className}`}>{children}</Tag>
  );
}
