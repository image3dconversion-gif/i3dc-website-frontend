import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ContactChannels } from "@/components/sections/ContactChannels";
import { footerNav } from "@/content/navigation";
import { img } from "@/content/images";
import { getSiteSettings, getFooterSettings } from "@/content/source";

/**
 * Global footer — "a quiet end, not a second homepage" (Homepage §5).
 * Text is sourced through the CMS abstraction; if the CMS is empty it falls
 * back to the approved static content and renders identically.
 */
export async function Footer() {
  const siteData = await getSiteSettings();
  const footerData = await getFooterSettings();
  return (
    <footer className="border-t-2 border-brand bg-bg-tint">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Image
              src={img.logo.src}
              alt={img.logo.alt}
              width={img.logo.width}
              height={img.logo.height}
              className="h-9 w-auto"
            />
            <p className="mt-3 text-sm font-semibold text-heading">
              {siteData.descriptor}
            </p>
            <p className="mt-2 text-sm text-muted">{siteData.footerLine}</p>
            <p className="mt-4 text-sm font-semibold text-heading">{siteData.positioningBase}</p>
            <p className="mt-1 text-sm text-muted">{siteData.positioningReach}</p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                {group.label}
              </p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink no-underline hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-8">
          <ContactChannels variant="compact" />
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <p className="text-sm text-muted">
            Education:{" "}
            <a
              href={footerData.educationHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
            >
              {footerData.educationLabel}
            </a>{" "}
            — external destination.
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted">
            {footerData.legalNotice}
          </p>
          {/* Company address, legal entity, tax details, phone and regional
              contacts must be verified before publishing (Homepage §5). */}
          <p className="mt-4 text-xs text-muted">
            © {/* year set at build; keep static to avoid hydration drift */}
            2026 {footerData.copyrightName}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
