import type { Metadata } from "next";
import { Bricolage_Grotesque, Lato } from "next/font/google";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AcquisitionCapture } from "@/components/layout/AcquisitionCapture";
import { MetaPixel } from "@/components/layout/MetaPixel";
import { MeasurementConsentBanner } from "@/components/layout/MeasurementConsent";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { resolveBrowserPixelId } from "@/lib/meta/config";
import { OrganizationJsonLd, ProfessionalServiceJsonLd } from "@/lib/seo/jsonld";
import { site } from "@/content/site";
import "./globals.css";

// Display: Bricolage Grotesque 600 · Body/UI: Lato 400/700 (Homepage v1.2 §6).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Digital Implant Planning & Surgical Guides | Image3DConversion",
    template: "%s | Image3DConversion",
  },
  description:
    "Plan routine and complex guided implant cases with expert digital planning, surgical guides, full-arch workflows and clinician review before production.",
  applicationName: site.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
    images: [{ url: "/images/logos/i3dc-logo.webp", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Implant Planning & Surgical Guides | Image3DConversion",
    description:
      "Expert digital planning, surgical guides and full-arch workflows with clinician review before production.",
    images: ["/images/logos/i3dc-logo.webp"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Meta Pixel gate, resolved on the server (build time for static pages).
  // Null unless META_TRACKING_ENABLED=true and the Pixel id is exactly the I3DC
  // dataset — and then only the public Pixel id crosses to the browser.
  const metaPixelId = resolveBrowserPixelId(process.env);
  return (
    <html lang={site.locale} className={`${bricolage.variable} ${lato.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-card)] focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {/* Records the acquisition touch on every page view, so a campaign that
            lands on a service page still reaches the form. Renders nothing and
            makes no network request. Suspense-wrapped because it reads search
            params, which would otherwise opt the whole tree out of static
            rendering. */}
        <Suspense fallback={null}>
          <AcquisitionCapture />
        </Suspense>
        {/* Rendered only when the tracking gate is open; otherwise nothing
            Meta-related reaches the page. Suspense-wrapped for the same
            search-params reason as above. */}
        {metaPixelId && (
          <Suspense fallback={null}>
            <MetaPixel pixelId={metaPixelId} />
            <MeasurementConsentBanner />
          </Suspense>
        )}
        <OrganizationJsonLd />
        <ProfessionalServiceJsonLd />
        <SiteChrome header={<Header />} footer={<Footer />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
