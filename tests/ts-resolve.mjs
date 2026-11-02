/**
 * Test-only module resolver.
 *
 * The app source uses extensionless imports ("./types") and the "@/*" alias,
 * which the bundler resolves at build time. Node's native TypeScript stripping
 * does not, so tests would fail to resolve them. This hook teaches Node the same
 * two rules, letting `node --test` run the real source files with no build step
 * and no test-framework dependency.
 *
 * Loaded via `node --import ./tests/ts-resolve.mjs`. Never imported by the app.
 */
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve as resolvePath } from "node:path";

const SRC = resolvePath(import.meta.dirname, "..", "src");
const CANDIDATES = [".ts", ".tsx", "/index.ts", "/index.tsx"];

function firstExisting(basePath) {
  for (const suffix of CANDIDATES) {
    const candidate = basePath + suffix;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    // "server-only" throws unless it resolves under the `react-server` export
    // condition, which Next applies when it bundles server code. Tests run those
    // server modules directly, so here it is the same empty module Next uses;
    // the real client/server boundary is still enforced by `next build`.
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export{}", shortCircuit: true };
    }

    // "next/server" is an extensionless deep import that only a bundler
    // resolves; Node's ESM resolver needs the file name.
    if (specifier === "next/server") return nextResolve("next/server.js", context);

    // "@/lib/foo" → <repo>/src/lib/foo
    if (specifier.startsWith("@/")) {
      const hit = firstExisting(resolvePath(SRC, specifier.slice(2)));
      if (hit) return nextResolve(hit, context);
    }

    // "./types" → ./types.ts
    if (specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      const basePath = fileURLToPath(new URL(specifier, context.parentURL));
      const hit = firstExisting(basePath);
      if (hit) return nextResolve(hit, context);
    }

    return nextResolve(specifier, context);
  },
});
