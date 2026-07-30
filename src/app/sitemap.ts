import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { pageStubs } from "@/content/page-stubs";

/**
 * Only indexable public pages belong in the sitemap. The authenticated Case
 * Portal application screens are a separate app and are intentionally excluded
 * (Blueprint §10). The internal /design-system page is noindex and omitted.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  // "/" + FAQ (a real page with no stub entry) + all stub/registry routes.
  const routes = ["/", "/faq/", ...Object.values(pageStubs).map((s) => s.slug)];
  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
