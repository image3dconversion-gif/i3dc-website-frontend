"use client";

import { usePathname } from "next/navigation";

/**
 * Renders the approved public Header/Footer around page content, EXCEPT on the
 * internal Keystatic admin routes (/keystatic*), where the full-screen editor
 * owns the viewport. Public routes are unaffected — for every public path this
 * renders exactly the same chrome as before, so there is zero visual drift.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/keystatic");

  if (isAdmin) return <main id="main">{children}</main>;

  return (
    <>
      {header}
      <main id="main">{children}</main>
      {footer}
    </>
  );
}
