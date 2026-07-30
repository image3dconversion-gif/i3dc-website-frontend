import { ButtonLink } from "@/components/ui/Button";
import { contact } from "@/content/site";
import { cta } from "@/content/cta-routes";

/**
 * Controlled contact routing. Shows the enquiry route + portal route clearly.
 * Real email/phone/WhatsApp appear ONLY when approved values exist in
 * site.contact (currently null → a neutral "shared on request" state). No
 * invented contact details, no live integrations.
 */
export function ContactChannels({ variant = "block" }: { variant?: "block" | "compact" }) {
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
          <p className="mt-1">
            {contact.email && <a href={`mailto:${contact.email}`} className="text-brand no-underline">{contact.email}</a>}
            {contact.phone && <span> · {contact.phone}</span>}
          </p>
        ) : (
          <p className="mt-1 text-xs">Direct contact details shared on request.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-line-strong bg-white p-6 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-bold uppercase tracking-wider text-brand">{contact.enquiriesLabel}</p>
      <h3 className="mt-2">Prefer to reach us directly?</h3>
      <p className="mt-2 text-sm text-ink">{contact.discussHint}</p>
      {hasDirect ? (
        <ul className="mt-4 space-y-1 text-sm">
          {contact.email && <li><a href={`mailto:${contact.email}`} className="font-semibold text-brand">{contact.email}</a></li>}
          {contact.phone && <li className="text-ink">{contact.phone}</li>}
          {contact.whatsapp && <li className="text-ink">WhatsApp: {contact.whatsapp}</li>}
        </ul>
      ) : (
        <p className="mt-4 rounded-[var(--radius-card)] border border-line bg-blue-50 px-4 py-3 text-xs text-muted">
          A direct business email and professional line are being finalised and will appear here.
          In the meantime, use the enquiry form — we route every message to the right team.
        </p>
      )}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="#form">Discuss a Case</ButtonLink>
        <ButtonLink href={cta.openPortal.href} variant="secondary" external>
          {cta.openPortal.label}
        </ButtonLink>
      </div>
    </div>
  );
}
