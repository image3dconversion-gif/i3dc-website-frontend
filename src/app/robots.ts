import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal reference page; portal app lives on a separate host.
      disallow: ["/design-system/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
