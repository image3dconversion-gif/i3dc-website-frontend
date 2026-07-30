import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ContactChannels } from "@/components/sections/ContactChannels";
import { footerNav, educationLink } from "@/content/navigation";
import { site, positioning } from "@/content/site";

/** Global footer — "a quiet end, not a second homepage" (Homepage §5). */
export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-tint">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <p className="font-display text-base font-semibold text-heading">
              {site.descriptor}
            </p>
            <p className="mt-3 text-sm text-muted">{site.footerLine}</p>
            <p className="mt-4 text-sm font-semibold text-heading">{positioning.base}</p>
            <p className="mt-1 text-sm text-muted">{positioning.reach}</p>
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
              href={educationLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
            >
              {educationLink.label}
            </a>{" "}
            — external destination.
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted">
            {site.professionalNotice}
          </p>
          {/* Company address, legal entity, tax details, phone and regional
              contacts must be verified before publishing (Homepage §5). */}
          <p className="mt-4 text-xs text-muted">
            © {/* year set at build; keep static to avoid hydration drift */}
            2026 {site.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
