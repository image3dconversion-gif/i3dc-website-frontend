/**
 * Static audit of the source tree for the Meta integration.
 *
 * Behavioural tests prove what the code does; these prove what the code
 * CANNOT do, by construction: carry a second Pixel, read the CAPI token from
 * anywhere a browser bundle could reach, send a Lead from the browser, or load
 * the Pixel without consent. The production bundle itself is scanned separately by
 * tests/build/meta-bundle-audit.mjs.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const LOCKED = "1788653802312623";
/** Legacy SurgiGuide/workshop Pixel, as published in paulsudeep.com's page source. */
const LEGACY_PIXEL_IDS = ["950428851390424"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const rel = (p: string) => relative(ROOT, p).split(sep).join("/");
const files = walk(SRC)
  .filter((p) => /\.(ts|tsx|js|mjs|css)$/.test(p))
  .map((p) => ({ path: rel(p), text: readFileSync(p, "utf8") }));
const extra = [".env.example", "next.config.ts", "package.json"].map((p) => ({
  path: p,
  text: readFileSync(join(ROOT, p), "utf8"),
}));
const isClient = (f: { text: string }) => /^\s*["']use client["'];?/.test(f.text);
const importsOf = (text: string) => [...text.matchAll(/from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g)].map((m) => m[1] ?? m[2]);

describe("exactly one Pixel, and never a legacy one", () => {
  test("every Pixel-shaped id anywhere in the source is the I3DC dataset", () => {
    const foreign = files.flatMap((f) =>
      [...f.text.matchAll(/(?<!\d)\d{15,16}(?!\d)/g)]
        .filter((m) => m[0] !== LOCKED)
        .map((m) => `${f.path}: ${m[0]}`),
    );
    assert.deepEqual(foreign, [], "a second Pixel-shaped id has appeared in the source");
  });

  test("the id is defined as a code literal in exactly one place", () => {
    const literals = files.filter((f) => new RegExp(`["'\`]${LOCKED}["'\`]`).test(f.text)).map((f) => f.path);
    assert.deepEqual(literals, ["src/lib/meta/constants.ts"]);
  });

  test("no known legacy Pixel id appears anywhere in source or config", () => {
    for (const f of [...files, ...extra]) {
      for (const legacy of LEGACY_PIXEL_IDS) assert.ok(!f.text.includes(legacy), `${legacy} in ${f.path}`);
    }
  });

  test("fbq init happens once, with the Pixel id only (no advanced-matching argument)", () => {
    const inits = files.flatMap((f) => [...f.text.matchAll(/fbq\(\s*["']init["'][^)]*\)/g)].map((m) => `${f.path}: ${m[0]}`));
    assert.deepEqual(inits, ['src/lib/meta/pixel.ts: fbq("init", pixelId)']);
  });

  test("Automatic Events are switched off before init", () => {
    const pixel = files.find((f) => f.path === "src/lib/meta/pixel.ts")!.text;
    const off = pixel.indexOf('fbq("set", "autoConfig", false, pixelId)');
    const init = pixel.indexOf('fbq("init", pixelId)');
    assert.ok(off > 0 && init > off, "autoConfig=false must precede init");
    assert.ok(!/autoConfig["'],\s*true/.test(pixel));
  });

  test("the Meta library and Graph hosts are referenced in exactly one module each", () => {
    const where = (needle: string) => files.filter((f) => f.text.includes(needle)).map((f) => f.path);
    assert.deepEqual(where("connect.facebook.net"), ["src/lib/meta/pixel.ts"]);
    assert.deepEqual(where("graph.facebook.com"), ["src/lib/meta/config.ts"]);
    assert.deepEqual(where("facebook.com/tr"), [], "no noscript/image-pixel fallback that bypasses the gate");
  });
});

describe("the CAPI token cannot reach a browser bundle", () => {
  test("only the server-only config module reads META_CAPI_ACCESS_TOKEN", () => {
    const readers = files.filter((f) => f.text.includes("META_CAPI_ACCESS_TOKEN")).map((f) => f.path);
    assert.deepEqual(readers, ["src/lib/meta/config.ts"]);
  });

  test("no NEXT_PUBLIC_ variable can carry a secret", () => {
    for (const f of [...files, ...extra]) {
      const bad = f.text.match(/NEXT_PUBLIC_[A-Z0-9_]*(TOKEN|SECRET|KEY|CAPI|PASSWORD)[A-Z0-9_]*/g);
      assert.equal(bad, null, `${f.path}: ${bad}`);
    }
  });

  test("the only public Meta variable is the Pixel id", () => {
    const names = new Set([...files, ...extra].flatMap((f) => f.text.match(/NEXT_PUBLIC_META_[A-Z0-9_]+/g) ?? []));
    assert.deepEqual([...names], ["NEXT_PUBLIC_META_PIXEL_ID"]);
  });

  test("every server-side Meta/intake module is marked server-only", () => {
    for (const path of [
      "src/lib/meta/config.ts",
      "src/lib/meta/capi.ts",
      "src/lib/meta/lead.ts",
      "src/lib/meta/identity.ts",
      "src/lib/meta/synthetic.ts",
      "src/lib/enquiry/intake.ts",
      "src/lib/zoho/client.ts",
    ]) {
      const f = files.find((x) => x.path === path);
      assert.ok(f, `${path} missing`);
      assert.ok(importsOf(f.text).includes("server-only"), `${path} must import "server-only"`);
    }
  });

  test("client code never imports a server-side Meta, intake or Zoho module", () => {
    const forbidden = /(meta\/(config|capi|lead|identity|synthetic|cookies)|enquiry\/intake|zoho\/client)$/;
    const clientSide = files.filter((f) => isClient(f) || ["pixel", "constants", "consent"].some((m) => f.path === `src/lib/meta/${m}.ts`));
    assert.ok(clientSide.length > 5, "sanity: client modules were found");
    for (const f of clientSide) {
      const bad = importsOf(f.text).filter((s) => forbidden.test(s));
      assert.deepEqual(bad, [], `${f.path} imports server-only code`);
    }
  });

  test("client components never read Meta environment variables", () => {
    for (const f of files.filter(isClient)) assert.ok(!/\bMETA_[A-Z_]+/.test(f.text), f.path);
  });
});

describe("BROWSER_LEAD = OFF", () => {
  const banned = /["'`]track(?:Single|Custom)?["'`]\s*,\s*(?:["'`][^"'`]*["'`]\s*,\s*)?["'`]Lead["'`]/;

  test("no source file sends a Lead from the browser", () => {
    assert.deepEqual(files.filter((f) => banned.test(f.text)).map((f) => f.path), []);
  });

  test("the removed browser Lead code is gone everywhere", () => {
    for (const f of files) assert.ok(!/\b(trackLead|leadEventIdFrom|metaEventId)\b/.test(f.text), f.path);
  });

  test("the only tracked event in the Pixel module is PageView", () => {
    const pixel = files.find((f) => f.path === "src/lib/meta/pixel.ts")!.text;
    const tracked = [...pixel.matchAll(/fbq\(\s*["']track["']\s*,\s*["']([^"']+)["']/g)].map((m) => m[1]);
    assert.deepEqual(tracked, ["PageView"]);
  });
});

describe("the consent gate cannot be skipped", () => {
  test("only MetaPixel installs the Pixel, and only after checking for ALLOW", () => {
    const callers = files.filter((f) => f.path !== "src/lib/meta/pixel.ts" && /\binstallPixel\(/.test(f.text));
    assert.deepEqual(callers.map((f) => f.path), ["src/components/layout/MetaPixel.tsx"]);
    const text = callers[0].text;
    assert.ok(text.indexOf('consent !== "ALLOW"') > 0 && text.indexOf('consent !== "ALLOW"') < text.indexOf("installPixel(pixelId)"));
  });

  test("the banner preselects nothing", () => {
    const banner = files.find((f) => f.path === "src/components/layout/MeasurementConsent.tsx")!.text;
    assert.ok(!/defaultChecked|checked=|autoFocus/.test(banner));
    assert.ok(!/localStorage/.test(banner), "state is written only through lib/meta/consent");
  });

  test("the server reads cookies for Meta only after the ALLOW check", () => {
    const lead = files.find((f) => f.path === "src/lib/meta/lead.ts")!.text;
    assert.ok(lead.includes('const cookies = allowed ? req.headers.get("cookie") : null;'));
  });
});

describe("the frozen payload", () => {
  test("no contact detail, IP or external id can be sent", () => {
    for (const path of ["src/lib/meta/capi.ts", "src/lib/meta/lead.ts", "src/lib/enquiry/intake.ts"]) {
      const code = files.find((f) => f.path === path)!.text.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
      for (const banned of ["client_ip_address", "clientIpAddress", "external_id", "hashedEmail", "hashedPhone", "sha256", "createHash"]) {
        assert.ok(!code.includes(banned), `${path}: ${banned}`);
      }
      assert.ok(!/\bem\s*[:?]|\bph\s*[:?]/.test(code), `${path}: em/ph`);
    }
  });

  test("the Meta hash module is gone", () => {
    assert.ok(!files.some((f) => f.path === "src/lib/meta/hash.ts"));
  });
});
