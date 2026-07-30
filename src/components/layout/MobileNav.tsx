"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav, solutionsMenu } from "@/content/navigation";
import { cta } from "@/content/cta-routes";

/**
 * Mobile / tablet navigation (shown below `lg`). A hamburger toggles a
 * full-width panel listing the Solutions groups, primary nav, the portal link
 * and Start a Case. Closes on route change and on Escape; locks body scroll
 * while open. Keyboard accessible.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape to close + lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] text-heading hover:bg-blue-50"
      >
        <span className="relative block h-4 w-6" aria-hidden>
          <span className={`absolute left-0 top-0 h-0.5 w-6 bg-current transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`absolute left-0 top-[7px] h-0.5 w-6 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 top-[14px] h-0.5 w-6 bg-current transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </span>
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-white shadow-[var(--shadow)]"
        >
          <nav aria-label="Mobile" className="container-page py-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Solutions</p>
            <ul className="space-y-1">
              {solutionsMenu.flatMap((g) => g.links).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-base font-semibold text-ink no-underline hover:bg-blue-50">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <hr className="my-4 border-line" />
            <ul className="space-y-1">
              {primaryNav
                .filter((i) => i.label !== "Solutions")
                .map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-base font-semibold text-ink no-underline hover:bg-blue-50">
                      {item.label}
                    </Link>
                  </li>
                ))}
              <li>
                <Link href="/faq/" className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-base font-semibold text-ink no-underline hover:bg-blue-50">
                  FAQ
                </Link>
              </li>
            </ul>

            <div className="mt-5 flex flex-col gap-3">
              <a
                href={cta.openPortal.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-card)] border border-line-strong px-6 text-base font-bold text-brand no-underline"
              >
                Open Case Portal
              </a>
              <a
                href={cta.startCase.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-card)] bg-brand px-6 text-base font-bold text-white no-underline"
              >
                {cta.startCase.label}
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
