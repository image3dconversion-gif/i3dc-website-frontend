"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { readMeasurementConsent, subscribeMeasurementConsent } from "@/lib/meta/consent";
import { installPixel, pageKey, revokePixel, trackPageView } from "@/lib/meta/pixel";

/**
 * Meta Pixel for the I3DC dataset: one PageView per page view, including
 * Next.js client-side navigations.
 *
 * Rendered by the root layout ONLY when the server-side gate
 * (lib/meta/config.ts) resolves a Pixel id; with tracking disabled this
 * component is never rendered and nothing Meta-related runs in the browser.
 *
 * Even then the library is not loaded until the visitor chooses ALLOW. Under
 * UNDECIDED, DENY or UNKNOWN nothing is requested from Meta, and a Pixel loaded by
 * an earlier ALLOW in this page is told to stop.
 *
 * Why an effect keyed on the URL: Next keeps the layout mounted across soft
 * navigations, so a PageView fired only on load would miss every client-side
 * page view. The library's own History-API PageViews are switched off (see
 * installPixel), leaving this effect as the single source — and the
 * de-duplication in trackPageView absorbs React's development double-run of
 * effects and any re-render that does not change the URL.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const consent = useSyncExternalStore(subscribeMeasurementConsent, readMeasurementConsent, () => "UNKNOWN");

  useEffect(() => {
    if (consent !== "ALLOW") {
      revokePixel();
      return;
    }
    // The internal CMS admin is never tracked.
    if (!pathname || pathname.startsWith("/keystatic")) return;
    if (!installPixel(pixelId)) return;
    trackPageView(pageKey(pathname, search));
  }, [consent, pixelId, pathname, search]);

  return null;
}
