"use client";

import { useId, useState } from "react";

export interface QA {
  q: string;
  a: string;
}

/**
 * Accessible FAQ accordion (native disclosure semantics via button + region).
 * Keyboard operable; one item open state per row. Used for FAQ category groups;
 * the top-five priority questions are rendered open elsewhere, not hidden here.
 */
export function Accordion({ items }: { items: QA[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-sm)]">
      {items.map((item) => (
        <AccordionRow key={item.q} item={item} />
      ))}
    </div>
  );
}

function AccordionRow({ item }: { item: QA }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-semibold text-heading hover:bg-blue-50"
        >
          {item.q}
          <span
            aria-hidden
            className={`shrink-0 text-brand transition-transform duration-200 ${open ? "rotate-45" : ""}`}
          >
            +
          </span>
        </button>
      </h3>
      {open && (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-btn`}
          className="px-5 pb-5 text-sm text-ink"
        >
          {item.a}
        </div>
      )}
    </div>
  );
}
