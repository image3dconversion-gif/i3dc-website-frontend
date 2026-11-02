/**
 * Production-bundle audit for the Meta integration.
 *
 * Builds the site three times and scans everything `next build` emits:
 *
 *   1. ENABLED build — tracking on, with a random sentinel CAPI token and
 *      sentinel Test Events code in the build environment:
 *        - neither sentinel appears ANYWHERE in the output: client chunks,
 *          prerendered HTML/RSC, server bundles, or the build cache;
 *        - every Pixel id literal in client JS and prerendered pages is the
 *          I3DC dataset, and no legacy Pixel id appears in any form;
 *        - the Pixel id IS rendered into pages (the gate really opened).
 *
 *   2. DEFAULT build — the configuration deployed today (tracking off):
 *        - no page renders the Pixel id; the integration ships inert.
 *
 *   Also: a Production build carrying a Test Events code must FAIL.
 *
 * The DEFAULT build runs last, so `.next` is always left inert — a later
 * `next start` cannot load a tracking-enabled build by accident.
 *
 * Do NOT run while a `next dev` server is using this directory: building over
 * a live dev server's `.next` corrupts it.
 *
 * Run: npm run test:bundle
 */
import { spawn } from "node:child_process";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { randomBytes } from "node:crypto";

const APP_DIR = process.cwd();
const NEXT_DIR = join(APP_DIR, ".next");
const LOCKED = "1788653802312623";
/** Legacy SurgiGuide/workshop Pixel, as published in paulsudeep.com's page source. */
const LEGACY_PIXEL_IDS = ["950428851390424"];
const SENTINEL_TOKEN = `FAKE-CAPI-TOKEN-${randomBytes(12).toString("hex")}`;
const SENTINEL_TEST_CODE = `TEST${randomBytes(6).toString("hex")}`;
const SENTINEL_EVENT_SECRET = `fake-event-secret-${randomBytes(16).toString("hex")}`;
const SENTINEL_SYNTHETIC_KEY = `fake-synthetic-key-${randomBytes(8).toString("hex")}`;

const results = [];
const check = (desc, pass, detail) => {
  results.push({ desc, pass: Boolean(pass) });
  console.log((pass ? "PASS  " : "FAIL  ") + desc + (detail ? `  [${detail}]` : ""));
};

function cleanEnv() {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (/^(META_|NEXT_PUBLIC_META_)/.test(k)) delete env[k];
  delete env.NODE_ENV; // next build sets production itself
  return env;
}

function build(label, env) {
  console.log(`\n── ${label}: next build`);
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
      cwd: APP_DIR,
      env: { ...cleanEnv(), ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let log = "";
    proc.stdout.on("data", (d) => (log += d));
    proc.stderr.on("data", (d) => (log += d));
    proc.on("close", (code) => resolve({ code, log }));
  });
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const rel = (p) => relative(NEXT_DIR, p).split(sep).join("/");
const classify = (r) =>
  r.startsWith("static/") ? "client" :
  r.startsWith("cache/") ? "cache" :
  /^server\/app\/.*\.(html|rsc|body|meta)$/.test(r) ? "prerendered" :
  r.startsWith("server/") ? "server" : "other";

/** Every build output file, read as latin1 so binary files are scanned byte-for-byte. */
function outputFiles() {
  return walk(NEXT_DIR).map((p) => ({ path: rel(p), kind: classify(rel(p)), text: readFileSync(p, "latin1") }));
}

const pixelLiterals = (text) => [...text.matchAll(/["'`](\d{15,16})["'`]/g)].map((m) => m[1]);

(async () => {
  let exitCode = 1;
  try {
    // ── 1. ENABLED build ────────────────────────────────────────────────────
    const enabled = await build("ENABLED build (tracking on, sentinel secrets)", {
      META_TRACKING_ENABLED: "true",
      NEXT_PUBLIC_META_PIXEL_ID: LOCKED,
      META_CAPI_DELIVERY: "TEST_EVENTS",
      META_CAPI_ACCESS_TOKEN: SENTINEL_TOKEN,
      META_EVENT_ID_SECRET: SENTINEL_EVENT_SECRET,
      META_SYNTHETIC_KEY: SENTINEL_SYNTHETIC_KEY,
      META_TEST_EVENT_CODE: SENTINEL_TEST_CODE,
    });
    check("enabled build succeeds", enabled.code === 0, enabled.code === 0 ? "" : enabled.log.slice(-1500));
    if (enabled.code === 0) {
      const files = outputFiles();
      const byKind = (k) => files.filter((f) => f.kind === k);
      const counts = ["client", "prerendered", "server", "cache", "other"].map((k) => `${k} ${byKind(k).length}`).join(", ");
      console.log(`      scanned ${files.length} files (${counts})`);

      for (const [name, secret] of [["CAPI token", SENTINEL_TOKEN], ["Test Events code", SENTINEL_TEST_CODE], ["event id secret", SENTINEL_EVENT_SECRET], ["synthetic key", SENTINEL_SYNTHETIC_KEY]]) {
        const hits = files.filter((f) => f.text.includes(secret)).map((f) => f.path);
        check(`${name} appears nowhere in the build output (all ${files.length} files)`, hits.length === 0, hits.slice(0, 5).join(", "));
      }
      check("the build log does not print the token", !enabled.log.includes(SENTINEL_TOKEN));

      const shipped = [...byKind("client"), ...byKind("prerendered")];
      const ids = new Set(shipped.flatMap((f) => pixelLiterals(f.text)));
      check("every Pixel id literal shipped to browsers is the I3DC dataset", [...ids].every((id) => id === LOCKED), [...ids].join(","));
      const legacy = files.filter((f) => LEGACY_PIXEL_IDS.some((id) => f.text.includes(id))).map((f) => f.path);
      check("no legacy Pixel id anywhere in the build output", legacy.length === 0, legacy.slice(0, 5).join(", "));

      const pagesWithPixel = byKind("prerendered").filter((f) => f.path.endsWith(".html") && f.text.includes(LOCKED));
      const htmlPages = byKind("prerendered").filter((f) => f.path.endsWith(".html"));
      check("the gate opened: every prerendered page carries the Pixel id", htmlPages.length > 0 && pagesWithPixel.length === htmlPages.length,
        `${pagesWithPixel.length}/${htmlPages.length} pages`);
      check("no image-pixel/noscript fallback bypasses the gate", !shipped.some((f) => f.text.includes("facebook.com/tr")));
      const leadHits = byKind("client").filter((f) => /["'`]track["'`],\s*["'`]Lead["'`]/.test(f.text)).map((f) => f.path);
      check("BROWSER_LEAD = OFF: no client chunk can send a Lead", leadHits.length === 0, leadHits.slice(0, 5).join(", "));
      const fbeventsInHtml = byKind("prerendered").filter((f) => f.path.endsWith(".html") && f.text.includes("fbevents")).map((f) => f.path);
      check("no prerendered page loads fbevents.js before ALLOW", fbeventsInHtml.length === 0, fbeventsInHtml.slice(0, 5).join(", "));
    }

    // ── Production + Test Events code: the build itself must refuse ────────────
    const refused = await build("PRODUCTION build carrying a Test Events code", {
      VERCEL_ENV: "production",
      META_TEST_EVENT_CODE: SENTINEL_TEST_CODE,
    });
    check("a Production build with a Test Events code fails", refused.code !== 0 && refused.log.includes("META_TEST_EVENT_CODE"));
    check("the refusal does not print the code", !refused.log.includes(SENTINEL_TEST_CODE));

    // ── 2. DEFAULT build (tracking off) — runs last, leaving .next inert ───────
    const inert = await build("DEFAULT build (tracking off, as deployed today)", { META_TRACKING_ENABLED: "false" });
    check("default build succeeds", inert.code === 0, inert.code === 0 ? "" : inert.log.slice(-1500));
    if (inert.code === 0) {
      const files = outputFiles();
      const pages = files.filter((f) => f.kind === "prerendered");
      const withPixel = pages.filter((f) => f.text.includes(LOCKED)).map((f) => f.path);
      check("inert: no prerendered page renders the Pixel id", withPixel.length === 0, withPixel.slice(0, 5).join(", "));
      check("inert: no page carries fbevents.js", !pages.some((f) => f.text.includes("fbevents")));
      const banner = pages.filter((f) => f.path.endsWith(".html") && f.text.includes("Advertising measurement choice"));
      check("inert: no page carries the consent banner", banner.length === 0);
      const www = pages.filter((f) => f.text.includes("www.image3dconversion.com")).map((f) => f.path);
      check("no page names the www origin (canonical, og, JSON-LD)", www.length === 0, www.slice(0, 5).join(", "));
      const apex = pages.find((f) => f.path === "server/app/index.html");
      check("the home page declares the apex as canonical", Boolean(apex?.text.includes('rel="canonical" href="https://image3dconversion.com/"')));
      const routes = (inert.log.match(/^[├└┌]\s+[○●ƒλ]\s+\S+/gmu) ?? []).length;
      console.log(`      routes listed by next build: ${routes}`);
    }

    const passed = results.filter((r) => r.pass).length;
    console.log(`\n${passed}/${results.length} passed`);
    exitCode = results.length > 0 && results.every((r) => r.pass) ? 0 : 1;
  } catch (err) {
    console.log(`ERROR  ${err?.stack ?? err}`);
  }
  process.exit(exitCode);
})();
