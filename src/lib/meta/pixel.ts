/**
 * Browser half of the Meta integration: base Pixel loader and PageView, behind
 * the visitor's explicit ALLOW (see lib/meta/consent and MetaPixel.tsx).
 *
 * CLIENT-SIDE. It receives public values only — the Pixel id, resolved by the
 * server layout. No secret can reach this module.
 *
 * DELIBERATELY ABSENT
 *  - Lead: the browser never reports a conversion. The server owns the Lead,
 *    through CAPI, once the CRM has accepted the enquiry.
 *  - Automatic Events: `autoConfig` is switched off before `init`, Meta's
 *    documented control for button-click and page-metadata auto-detection.
 *  - Advanced matching: `init` carries the Pixel id and nothing else. Automatic
 *    Advanced Matching is a dataset setting served by Meta, so it must also be
 *    OFF in Events Manager — code cannot enforce a setting Meta serves.
 *  - Event Setup Tool / codeless events: nothing here wires or reads them.
 *  - Any other Pixel: install() accepts the I3DC dataset id only.
 */
import { I3DC_META_PIXEL_ID } from "./constants";

export const FBEVENTS_SRC = "https://connect.facebook.net/en_US/fbevents.js";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
  allowDuplicatePageViews?: boolean;
};

export interface PixelHost {
  fbq?: Fbq;
  _fbq?: Fbq;
}

/** The minimal browser surface the loader touches, so it can be tested without a DOM. */
export interface PixelEnvironment {
  win: PixelHost;
  insertScript: (src: string) => void;
}

/** De-duplication key for a page view: path plus query, never the hash. */
export function pageKey(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

export function createPixelClient(env: PixelEnvironment) {
  let installedPixelId: string | null = null;
  let revoked = false;
  let lastPageKey: string | null = null;

  /**
   * Meta's base code, translated: a queueing `fbq` stub plus the async
   * fbevents.js library. Idempotent — React may run effects twice in development.
   */
  function install(pixelId: string): boolean {
    if (pixelId !== I3DC_META_PIXEL_ID) return false;
    if (installedPixelId === pixelId) {
      if (revoked) {
        env.win.fbq?.("consent", "grant");
        revoked = false;
      }
      return true;
    }

    const w = env.win;
    if (!w.fbq) {
      const n = function (...args: unknown[]) {
        if (n.callMethod) n.callMethod(...args);
        else n.queue.push(args);
      } as Fbq;
      if (!w._fbq) w._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      w.fbq = n;
      env.insertScript(FBEVENTS_SRC);
    }
    const fbq = w.fbq;
    // PageViews are tracked explicitly, one per distinct URL (pageView below).
    // The library's own History-API listener must therefore be off, or every
    // Next.js pushState/replaceState would add an uncontrolled extra PageView.
    fbq.disablePushState = true;
    // With that listener off, fbevents.js would suppress a second explicit
    // PageView in the same document — i.e. every client-side navigation. Our
    // own de-duplication (exact, by URL) replaces that suppression.
    fbq.allowDuplicatePageViews = true;
    // No Automatic Events. Must precede init to take effect.
    fbq("set", "autoConfig", false, pixelId);
    // No advanced matching: the id only.
    fbq("init", pixelId);
    installedPixelId = pixelId;
    return true;
  }

  /** One PageView per distinct URL. A repeat of the current URL is ignored. */
  function pageView(key: string): boolean {
    if (!installedPixelId || revoked || !env.win.fbq) return false;
    if (key === lastPageKey) return false;
    lastPageKey = key;
    env.win.fbq("track", "PageView");
    return true;
  }

  /** A library already loaded by an earlier ALLOW stops sending once consent is withdrawn. */
  function revoke(): void {
    if (!installedPixelId || revoked) return;
    env.win.fbq?.("consent", "revoke");
    revoked = true;
  }

  return { install, pageView, revoke };
}

let browserClient: ReturnType<typeof createPixelClient> | null = null;

function client(): ReturnType<typeof createPixelClient> | null {
  if (typeof window === "undefined") return null;
  browserClient ??= createPixelClient({
    win: window as unknown as PixelHost,
    insertScript: (src) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = src;
      document.head.appendChild(script);
    },
  });
  return browserClient;
}

/** Install the I3DC Pixel. A no-op for any other id. */
export function installPixel(pixelId: string): boolean {
  return client()?.install(pixelId) ?? false;
}

/** Track a PageView for this URL key, unless it was the last one tracked. */
export function trackPageView(key: string): boolean {
  return client()?.pageView(key) ?? false;
}

/** Stop a Pixel loaded earlier in this page from sending anything further. */
export function revokePixel(): void {
  client()?.revoke();
}
