import type { Metadata } from "next";
import { Bricolage_Grotesque, Lato } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteChrome } from "@/components/layout/SiteChrome";
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
  return (
    <html lang={site.locale} className={`${bricolage.variable} ${lato.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-card)] focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <OrganizationJsonLd />
        <ProfessionalServiceJsonLd />
        <SiteChrome header={<Header />} footer={<Footer />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
