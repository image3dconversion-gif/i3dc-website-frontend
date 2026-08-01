/**
 * JSON-LD structured data (server-rendered <script type="application/ld+json">).
 *
 * Governance: schema states only what the reviewed site copy already supports —
 * no invented location, no scale/turnaround/partner claims, no fabricated
 * ratings. Contact points are emitted only when real values exist.
 */
import { site, positioning } from "@/content/site";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is code-authored (not user input); safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Site-wide Organization node. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.name,
        alternateName: site.shortName,
        url: site.url,
        logo: `${site.url}/images/logos/i3dc-logo.webp`,
        description: site.footerLine,
        slogan: site.northStar,
      }}
    />
  );
}

/** ProfessionalService node — claim-free positioning only. */
export function ProfessionalServiceJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: site.name,
        url: site.url,
        description: site.descriptor,
        areaServed: [{ "@type": "Country", name: "India" }, "Worldwide"],
        serviceType: [
          "Digital implant planning",
          "Surgical guide design",
          "Full-arch stackable workflow",
          "Design-only workflow",
          "Design-to-delivery workflow",
        ],
        knowsAbout: positioning.model,
        audience: { "@type": "Audience", audienceType: "Dental professionals and workflow partners" },
      }}
    />
  );
}

export interface FaqItem {
  q: string;
  a: string;
}

/** FAQPage node built from reviewed on-page Q&A. */
export function FaqPageJsonLd({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }}
    />
  );
}

export interface Crumb {
  name: string;
  path: string;
}

/** BreadcrumbList node. Paths are absolute-ised against the canonical origin. */
export function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length < 2) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${site.url}${c.path}`,
        })),
      }}
    />
  );
}
