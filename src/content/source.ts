/**
 * Data-source abstraction (CMS-readiness §6.3).
 *
 * Each getter returns the SAME typed shape the approved components already
 * consume. It reads CMS content (Keystatic local git storage) first and ALWAYS
 * falls back to the approved typed modules in this folder when a CMS entry is
 * absent, empty, or the read fails. Consequence: if the CMS is empty or
 * unavailable, the approved frontend renders exactly as it does today — no
 * layout drift, no broken build.
 *
 * These are async (the reader is Promise-based) but filesystem reads at build
 * time keep pages statically rendered. Adopt a getter in a server component by
 * awaiting it in place of the direct static import.
 */
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import { site, positioning, contact } from "./site";
import { educationLink } from "./navigation";
import { home } from "./pages/home";

// One reader over the repo root. Wrapped reads never throw to the caller.
const reader = createReader(process.cwd(), keystaticConfig);

async function safeRead<T>(fn: () => Promise<T | null>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

/** Non-empty string helper — treats blank CMS fields as "unset" → fallback. */
const val = (cms: string | null | undefined, fallback: string): string =>
  cms && cms.trim().length > 0 ? cms : fallback;

export interface SiteSettings {
  name: string;
  shortName: string;
  descriptor: string;
  northStar: string;
  footerLine: string;
  professionalNotice: string;
  url: string;
  locale: string;
  positioningBase: string;
  positioningReach: string;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const cms = await safeRead(() => reader.singletons.siteSettings.read());
  return {
    name: val(cms?.name, site.name),
    shortName: val(cms?.shortName, site.shortName),
    descriptor: val(cms?.descriptor, site.descriptor),
    northStar: val(cms?.northStar, site.northStar),
    footerLine: val(cms?.footerLine, site.footerLine),
    professionalNotice: val(cms?.professionalNotice, site.professionalNotice),
    // Canonical URL is route-critical: static value always wins.
    url: site.url,
    locale: val(cms?.locale, site.locale),
    positioningBase: positioning.base,
    positioningReach: positioning.reach,
  };
}

export interface ContactSettings {
  enquiriesLabel: string;
  discussHint: string;
  portalHint: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
}

export async function getContactSettings(): Promise<ContactSettings> {
  const cms = await safeRead(() => reader.singletons.contactSettings.read());
  // Direct values only surface when explicitly published in the CMS.
  const published = cms?.showDirect === true;
  return {
    enquiriesLabel: val(cms?.enquiriesLabel, contact.enquiriesLabel),
    discussHint: val(cms?.discussHint, contact.discussHint),
    portalHint: val(cms?.portalHint, contact.portalHint),
    email: published && cms?.email ? cms.email : contact.email,
    phone: published && cms?.phone ? cms.phone : contact.phone,
    whatsapp: published && cms?.whatsapp ? cms.whatsapp : contact.whatsapp,
  };
}

export interface FooterSettings {
  educationLabel: string;
  educationHref: string;
  copyrightName: string;
  legalNotice: string;
}

export async function getFooterSettings(): Promise<FooterSettings> {
  const cms = await safeRead(() => reader.singletons.footerSettings.read());
  return {
    educationLabel: val(cms?.educationLabel, educationLink.label),
    educationHref: val(cms?.educationHref, educationLink.href),
    copyrightName: val(cms?.copyrightName, site.name),
    legalNotice: val(cms?.legalNotice, site.professionalNotice),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
  category: string | null;
  priority: boolean;
  order: number;
}

/**
 * CMS FAQ entries (empty array when none authored). The approved FAQ page keeps
 * its reviewed static copy; this feeds future CMS-managed FAQs and JSON-LD.
 */
export async function getFaqEntries(): Promise<FaqEntry[]> {
  const slugs = (await safeRead(() => reader.collections.faqs.list())) ?? [];
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const e = await safeRead(() => reader.collections.faqs.read(slug));
      if (!e) return null;
      return {
        question: slug,
        answer: e.answer,
        category: e.category || null,
        priority: e.priority,
        order: e.order ?? 0,
      } satisfies FaqEntry;
    }),
  );
  return entries.filter((e): e is FaqEntry => e !== null).sort((a, b) => a.order - b.order);
}

export interface Testimonial {
  attribution: string;
  quote: string;
  role: string | null;
  organisation: string | null;
  order: number;
}

/** Only consent-on-file AND approved testimonials are ever returned. */
export async function getTestimonials(): Promise<Testimonial[]> {
  const slugs = (await safeRead(() => reader.collections.testimonials.list())) ?? [];
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const t = await safeRead(() => reader.collections.testimonials.read(slug));
      if (!t || !t.approved || !t.consentOnFile) return null;
      return {
        attribution: slug,
        quote: t.quote,
        role: t.role || null,
        organisation: t.organisation || null,
        order: t.order ?? 0,
      } satisfies Testimonial;
    }),
  );
  return items.filter((t): t is Testimonial => t !== null).sort((a, b) => a.order - b.order);
}

export interface CaseEvidenceItem {
  title: string;
  summary: string;
  workflow: string | null;
  imageKey: string | null;
  order: number;
}

/** Only anonymised AND approved case evidence is ever returned (evidence gate). */
export async function getCaseEvidence(): Promise<CaseEvidenceItem[]> {
  const slugs = (await safeRead(() => reader.collections.caseEvidence.list())) ?? [];
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const c = await safeRead(() => reader.collections.caseEvidence.read(slug));
      if (!c || !c.approved || !c.anonymised) return null;
      return {
        title: slug,
        summary: c.summary,
        workflow: c.workflow || null,
        imageKey: c.imageKey || null,
        order: c.order ?? 0,
      } satisfies CaseEvidenceItem;
    }),
  );
  return items.filter((c): c is CaseEvidenceItem => c !== null).sort((a, b) => a.order - b.order);
}

/**
 * Homepage copy. Returns the SAME shape `page.tsx`/`Hero` already consume: every
 * card grid, step list, checklist and visual stays in code (structure/layout);
 * only the editable section HEADINGS / SUBCOPY / notes can be overridden by the
 * CMS `homepage` singleton, each falling back per-field to the approved copy.
 */
export type HomepageContent = typeof home;

/** Merge CMS string overrides onto a base section; non-string fields untouched. */
function mergeStrings(
  base: Record<string, unknown>,
  cmsObj: unknown,
): Record<string, unknown> {
  const o = (cmsObj ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base)) {
    if (typeof base[key] === "string" && key in o) {
      out[key] = val(o[key] as string | null | undefined, base[key] as string);
    }
  }
  return out;
}

export async function getHomepage(): Promise<HomepageContent> {
  const cms = await safeRead(() => reader.singletons.homepage.read());
  if (!cms) return home;
  const merged = {
    ...home,
    hero: mergeStrings(home.hero, cms.hero),
    smile: mergeStrings(home.smile, cms.smile),
    workflows: mergeStrings(home.workflows, cms.workflows),
    differentiation: mergeStrings(home.differentiation, cms.differentiation),
    steps: mergeStrings(home.steps, cms.steps),
    support: mergeStrings(home.support, cms.support),
    global: mergeStrings(home.global, cms.global),
    complexCase: mergeStrings(home.complexCase, cms.complexCase),
    requirements: mergeStrings(home.requirements, cms.requirements),
    trust: mergeStrings(home.trust, cms.trust),
    finalAction: mergeStrings(home.finalAction, cms.finalAction),
  };
  return merged as unknown as HomepageContent;
}

export interface SeoMetaOverride {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

/** Per-page SEO override (canonical stays locked to the route in code). */
export async function getSeoMeta(path: string): Promise<SeoMetaOverride | null> {
  const slug = path.replace(/^\/|\/$/g, "") || "index";
  const e = await safeRead(() => reader.collections.seoMeta.read(slug));
  if (!e) return null;
  return {
    title: e.title || undefined,
    description: e.description || undefined,
    ogTitle: e.ogTitle || undefined,
    ogDescription: e.ogDescription || undefined,
    ogImage: e.ogImage || undefined,
    noindex: e.noindex || undefined,
  };
}
