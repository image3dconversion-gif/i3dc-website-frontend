import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { primaryNav, solutionsMenu } from "@/content/navigation";
import { cta } from "@/content/cta-routes";
import { site } from "@/content/site";
import { img } from "@/content/images";
import { MobileNav } from "./MobileNav";

/**
 * Global header. Server component (no JS needed for the base experience).
 * Solutions uses a CSS-only disclosure via <details> so the menu is fully
 * crawlable and keyboard-accessible without a client bundle. A richer
 * mega-menu / mobile drawer can replace this incrementally.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center no-underline"
          aria-label={`${site.name} — home`}
        >
          <Image
            src={img.logo.src}
            alt={img.logo.alt}
            width={img.logo.width}
            height={img.logo.height}
            priority
            className="h-7 w-auto md:h-8"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {primaryNav.map((item) =>
            item.label === "Solutions" ? (
              <details key={item.label} className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {item.label}
                  <span aria-hidden className="text-xs">▾</span>
                </summary>
                <div className="absolute left-1/2 top-full mt-3 w-[34rem] -translate-x-1/2 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow)]">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {solutionsMenu.map((group) => (
                      <div key={group.label}>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                          {group.label}
                        </p>
                        <ul className="space-y-1">
                          {group.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="block rounded-sm px-2 py-1.5 text-sm font-semibold text-ink no-underline hover:bg-blue-50"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-ink no-underline hover:text-brand"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={cta.openPortal.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm font-semibold text-brand no-underline hover:text-brand-hover lg:inline"
          >
            Open Case Portal
          </a>
          <span className="hidden sm:block">
            <ButtonLink href={cta.startCase.href} external={cta.startCase.external}>
              {cta.startCase.label}
            </ButtonLink>
          </span>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
