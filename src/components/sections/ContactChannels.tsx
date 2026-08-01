import { ButtonLink } from "@/components/ui/Button";
import { cta } from "@/content/cta-routes";
import { positioning } from "@/content/site";
import { getContactSettings, getSiteSettings } from "@/content/source";

/**
 * Controlled contact routing. Shows the enquiry route + portal route clearly,
 * plus a premium, clinical credibility block and India/global positioning.
 *
 * Real email/phone/WhatsApp appear ONLY when approved values exist (published
 * via the CMS `contactSettings` singleton). Until then each channel renders a
 * clean, intentional "shared on request" row — final structure, no invented
 * details, no live integrations. Values are sourced through the CMS abstraction
 * with a static fallback, so this renders identically if the CMS is empty.
 */
function waLink(number: string): string {
  return `https://wa.me/${number.replace(/[^0-9]/g, "")}`;
}

export async function ContactChannels({ variant = "block" }: { variant?: "block" | "compact" }) {
  const contact = await getContactSettings();
  const site = await getSiteSettings();
  const hasDirect = Boolean(contact.email || contact.phone || contact.whatsapp);

  if (variant === "compact") {
    // Footer usage: wording-only routing.
    return (
      <div className="text-sm text-muted">
        <p className="font-semibold text-heading">{contact.enquiriesLabel}</p>
        <p className="mt-1">
          <a href="/discuss-a-case/" className="font-semibold text-brand no-underline hover:text-brand-hover">
            Discuss a Case
          </a>{" "}
          · {contact.portalHint}
        </p>
        {hasDirect ? (
          <p className="mt-1 flex flex-wrap gap-x-2">
            {contact.email && <a href={`mailto:${contact.email}`} className="text-brand no-underline">{contact.email}</a>}
            {contact.phone && <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="text-ink no-underline">· {contact.phone}</a>}
            {contact.whatsapp && <a href={waLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-ink no-underline">· WhatsApp {contact.whatsapp}</a>}
          </p>
        ) : (
          <p className="mt-1 text-xs">Direct email and WhatsApp are shared on request.</p>
        )}
        {contact.whatsapp && <p className="mt-0.5 text-xs">WhatsApp only — no calls.</p>}
      </div>
    );
  }

  // WhatsApp is chat-only — never rendered with a tel: link. A phone row appears
  // only if a real call line is provided.
  const channels: { label: string; value: string | null; href?: string; note?: string }[] = [
    { label: "Email", value: contact.email, href: contact.email ? `mailto:${contact.email}` : undefined },
    ...(contact.phone
      ? [{ label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s+/g, "")}` }]
      : []),
    { label: "WhatsApp", value: contact.whatsapp, href: contact.whatsapp ? waLink(contact.whatsapp) : undefined, note: "WhatsApp only — no calls." },
  ];

  return (
    <div className="rounded-[var(--radius-card)] border border-line-strong bg-white p-6 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-bold uppercase tracking-wider text-brand">{contact.enquiriesLabel}</p>
      <h3 className="mt-2">Prefer to reach us directly?</h3>
      <p className="mt-2 text-sm font-semibold text-heading">{site.descriptor}</p>
      <p className="mt-1 text-sm text-ink">{contact.discussHint}</p>

      {/* Final contact structure — each channel shows a value or a clean
          "shared on request" state so the layout is intentional either way. */}
      <ul className="mt-4 divide-y divide-line rounded-[var(--radius-card)] border border-line">
        {channels.map((ch) => (
          <li key={ch.label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
            <span className="min-w-0">
              <span className="font-semibold text-heading">{ch.label}</span>
              {ch.note && ch.value && <span className="mt-0.5 block text-xs text-muted">{ch.note}</span>}
            </span>
            {ch.value && ch.href ? (
              <a
                href={ch.href}
                {...(ch.label === "WhatsApp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="shrink-0 text-right font-semibold text-brand no-underline hover:text-brand-hover"
              >
                {ch.value}
              </a>
            ) : (
              <span className="shrink-0 text-xs text-muted">Shared on request</span>
            )}
          </li>
        ))}
      </ul>

      {/* Support direction + portal availability (portal not publicly live yet). */}
      <p className="mt-4 rounded-[var(--radius-card)] border border-line bg-blue-50 px-4 py-3 text-xs text-ink">
        {contact.supportDirection} {contact.portalAvailability}
      </p>

      {/* India-based + globally reachable positioning (no city-level emphasis). */}
      <p className="mt-4 text-xs text-muted">
        {positioning.base} · {positioning.reach}. {positioning.model}.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="#form">Discuss a Case</ButtonLink>
        <ButtonLink href={cta.openPortal.href} variant="secondary" external>
          {cta.openPortal.label}
        </ButtonLink>
      </div>
    </div>
  );
}
