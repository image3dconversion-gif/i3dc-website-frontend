"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAcquisition } from "@/lib/attribution/acquisition";

/**
 * Records the acquisition touch on EVERY page view.
 *
 * This must live in the root layout, not in the enquiry form. A paid visitor
 * lands on a service page — which renders no form — and only later clicks
 * through to /discuss-a-case/. If capture ran solely where the form is mounted,
 * the ad landing would never be seen and the campaign would be lost exactly as
 * it was before this layer existed.
 *
 * Renders nothing, performs no network request, and sets no tracking cookie.
 * It only reads the URL and writes to session/local storage, all inside
 * try/catch — a browser with storage blocked simply gets no attribution.
 */
export function AcquisitionCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAcquisition();
    // Re-run on client-side route changes: Next keeps the layout mounted across
    // navigations, so without these deps a soft navigation into a campaign URL
    // would go unrecorded.
  }, [pathname, searchParams]);

  return null;
}
