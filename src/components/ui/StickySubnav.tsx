"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";

export interface SubnavItem {
  /** Element id to anchor to (must exist on the page). */
  id: string;
  label: string;
}

/**
 * In-page section navigation for long workflow pages. Sticks below the site
 * header, highlights the section currently in view, and scrolls to anchors on
 * click. Motion-free: the active state is a class toggle (no animation), and
 * anchor scrolling uses the browser default — which the global
 * `prefers-reduced-motion` rule already switches to an instant jump. Renders
 * nothing for fewer than two sections. On mobile the row scrolls horizontally
 * inside its own container, so it never widens the page.
 */
export function StickySubnav({ items }: { items: SubnavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias the active zone just under the sticky header + this bar.
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    >
      <Container>
        <ul className="flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => (
            <li key={it.id} className="shrink-0">
              <a
                href={`#${it.id}`}
                aria-current={active === it.id ? "true" : undefined}
                className={
                  "inline-block whitespace-nowrap rounded-pill px-3 py-1.5 text-sm font-semibold no-underline transition-colors " +
                  (active === it.id
                    ? "bg-brand text-white"
                    : "text-muted hover:bg-blue-50 hover:text-brand")
                }
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
