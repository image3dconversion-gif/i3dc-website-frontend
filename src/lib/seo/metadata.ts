/**
 * Per-page SEO metadata resolver.
 *
 * Merges a CMS `seoMeta` override (title / description / Open Graph text /
 * noindex) over the page's in-code defaults. The CANONICAL URL is always the
 * code-supplied route — never CMS-editable — so routing/SEO integrity is locked.
 * When no override exists the page's static metadata is used unchanged.
 */
import type { Metadata } from "next";
import { getSeoMeta } from "@/content/source";
import { site } from "@/content/site";

export interface PageSeoDefaults {
  /** Route path used to look up the CMS override AND as the locked canonical. */
  path: string;
  /** Absolute page title (not run through the "%s | …" template). */
  title: string;
  description: string;
  /** OG image path; defaults to the brand image. */
  ogImage?: string;
}

export async function resolveMetadata(defaults: PageSeoDefaults): Promise<Metadata> {
  const o = await getSeoMeta(defaults.path);
  const title = o?.title || defaults.title;
  const description = o?.description || defaults.description;
  const ogImage = o?.ogImage || defaults.ogImage || "/images/logos/i3dc-logo.webp";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: defaults.path },
    openGraph: {
      title: o?.ogTitle || title,
      description: o?.ogDescription || description,
      url: `${site.url}${defaults.path}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: o?.ogTitle || title,
      description: o?.ogDescription || description,
      images: [ogImage],
    },
    ...(o?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
