/**
 * Browser-level regression for service-intent capture.
 *
 * WHY THIS EXISTS: a live enquiry reached the CRM with Service_Interest empty
 * even though the URL carried ?service=guided-implant-planning. The cards use
 * next/link, so clicking one is a client-side SOFT navigation within the same
 * route — React keeps the form mounted and a mount-only effect never re-runs.
 * Every synthetic-POST test passed, because none of them navigated.
 *
 * So this drives a real browser: it clicks each card, lets the router do a soft
 * navigation, submits the real form, and asserts what actually reaches the
 * (fake) Zoho endpoint. Nothing real is contacted — the app is pointed at a
 * local fake CRM for the duration.
 *
 * Run: npm run test:browser
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const APP_DIR = process.cwd();
const PORT = 3095, ACCOUNTS_PORT = 4361, API_PORT = 4362;

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
const CHROME = CHROME_CANDIDATES.find((p) => p && existsSync(p));

/** Expected mapping per card — mirrors the Controller-approved matrix. */
const MATRIX = [
  ["guided-implant-planning", "Guided Implant Planning", undefined],
  ["full-arch-stackable", "Full-Arch/Stackable Guide", "Full-Arch"],
  ["immediate-loading", "Guided Implant Planning", "Immediate Loading"],
  ["advanced-case", "Guided Implant Planning", undefined],
  ["design-only", "Digital Design Service", "Guide Design"],
  ["design-to-delivery", "Other", undefined],
  ["global-practice", undefined, undefined],
  ["partnership", undefined, undefined],
];

let captured = null;
function handler(req, res) {
  if (req.socket.localPort === ACCOUNTS_PORT) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ access_token: "FAKE" }));
    return;
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    try { captured = JSON.parse(body); } catch { captured = null; }
    res.writeHead(201, { "content-type": "application/json" });
    res.end(JSON.stringify({ data: [{ code: "SUCCESS", details: { id: "FAKE-ID" } }] }));
  });
}
const accounts = http.createServer(handler); accounts.listen(ACCOUNTS_PORT);
const api = http.createServer(handler); api.listen(API_PORT);

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)], {
  cwd: APP_DIR,
  env: {
    ...process.env,
    ZOHO_SUBMIT_ENABLED: "true", ZOHO_ALLOW_LOCAL_LIVE: "true",
    ZOHO_ACCOUNTS_URL: `http://127.0.0.1:${ACCOUNTS_PORT}`,
    ZOHO_API_DOMAIN: `http://127.0.0.1:${API_PORT}`,
    ZOHO_CLIENT_ID: "f", ZOHO_CLIENT_SECRET: "f", ZOHO_REFRESH_TOKEN: "f",
    ZOHO_MODULE: "Leads", ZOHO_LAYOUT_ID: "6607227000004071789",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));

const results = [];
const check = (desc, pass, detail) => {
  results.push({ desc, pass });
  console.log((pass ? "PASS  " : "FAIL  ") + desc + (detail ? `  [${detail}]` : ""));
};

async function waitReady() {
  for (let i = 0; i < 180; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/api/enquiry/`)).status === 405) return true; } catch {}
    await sleep(1000);
  }
  return false;
}

let ip = 0;
async function newPage(browser) {
  const page = await browser.newPage();
  // A distinct client IP per case so the per-IP rate limiter cannot couple them.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `203.0.113.${(++ip % 240) + 1}` });
  // Tag each document so a soft navigation (same document) is detectable.
  await page.evaluateOnNewDocument(() => { window.__docId = String(Math.random()); });
  return page;
}

/** Neutral wording by default so this file tests navigation, not routing. */
const NEUTRAL = "I would like planning support for an upcoming procedure.";

async function fillAndSubmit(page, message = NEUTRAL) {
  await page.type("#name", "ZZ Browser Regression");
  await page.type("#org", "ZZ Regression Clinic");
  await page.type("#email", "zz.browser@example.invalid");
  await page.type("#summary", message);
  await page.select("#inquiryType", "service-information");
  await page.click('input[name="consent"]');
  captured = null;
  await page.click('button[type="submit"]');
  for (let i = 0; i < 60 && !captured; i++) await sleep(250);
  return captured?.data?.[0];
}

(async () => {
  if (!CHROME) { console.log("NO CHROME FOUND — cannot run browser regression"); process.exit(1); }
  console.log(`chrome: ${CHROME}\n`);
  if (!(await waitReady())) { console.log("SERVER DID NOT START\n" + log.slice(-2000)); process.exit(1); }

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });

  try {
    // ── 1. SOFT NAVIGATION: click each card, then submit ───────────────────
    for (const [key, service, workflow] of MATRIX) {
      const page = await newPage(browser);
      await page.goto(`http://127.0.0.1:${PORT}/discuss-a-case/`, { waitUntil: "networkidle0" });
      const before = await page.evaluate(() => window.__docId);

      await page.click(`a[href*="service=${key}"]`);
      await page.waitForFunction(
        (k) => window.location.search.includes(`service=${k}`),
        { timeout: 10000 },
        key,
      );
      const after = await page.evaluate(() => window.__docId);
      check(`${key}: navigation was SOFT (same document)`, before === after, before === after ? "same doc" : "page reloaded");

      // The chip is the user-visible proof the form saw the selection.
      const chip = await page.evaluate(() =>
        [...document.querySelectorAll("form#form p")].map((p) => p.innerText.trim()).find((t) => /Enquiring about/.test(t)) || null,
      );
      check(`${key}: form state updated after soft navigation`, !!chip, chip || "NO CHIP");

      const rec = await fillAndSubmit(page);
      check(`${key}: Service_Interest`, rec?.Service_Interest === service, `got ${JSON.stringify(rec?.Service_Interest)} want ${JSON.stringify(service)}`);
      check(`${key}: Workflow_Interest`, rec?.Workflow_Interest === workflow, `got ${JSON.stringify(rec?.Workflow_Interest)} want ${JSON.stringify(workflow)}`);
      check(key + ": Description records the literal card", /Service selected:/.test(rec?.Description || ""), "");
      await page.close();
    }

    // ── 2. HARD LOAD of ?service= must still work ──────────────────────────
    {
      const page = await newPage(browser);
      await page.goto(`http://127.0.0.1:${PORT}/discuss-a-case/?service=full-arch-stackable`, { waitUntil: "networkidle0" });
      const rec = await fillAndSubmit(page);
      check("hard load ?service=full-arch-stackable still works",
        rec?.Service_Interest === "Full-Arch/Stackable Guide" && rec?.Workflow_Interest === "Full-Arch",
        `${rec?.Service_Interest} / ${rec?.Workflow_Interest}`);
      await page.close();
    }

    // ── 3. No card chosen → no service intent invented ─────────────────────
    {
      const page = await newPage(browser);
      await page.goto(`http://127.0.0.1:${PORT}/discuss-a-case/`, { waitUntil: "networkidle0" });
      const rec = await fillAndSubmit(page);
      check("no card selected → Service_Interest stays empty",
        rec?.Service_Interest === undefined && rec?.Workflow_Interest === undefined,
        `${rec?.Service_Interest} / ${rec?.Workflow_Interest}`);
await page.close();
    }

    // ── 4. Routing: everyday service vocabulary must not reach the portal lane ─
    {
      const page = await newPage(browser);
      await page.goto(`http://127.0.0.1:${PORT}/discuss-a-case/`, { waitUntil: "networkidle0" });
      await page.click('a[href*="service=guided-implant-planning"]');
      await page.waitForFunction(() => window.location.search.includes("service="), { timeout: 10000 });
      const rec = await fillAndSubmit(page, "I have a case coming up and want guided implant planning support.");
      check('message containing "case" is NOT portal-routed',
        rec?.Inquiry_Category === "Service-Info" && rec?.Journey_Stage === "New Website Inquiry",
        `${rec?.Inquiry_Category} / ${rec?.Journey_Stage}`);
      check('service intent still lands alongside the "case" wording',
        rec?.Service_Interest === "Guided Implant Planning", String(rec?.Service_Interest));
      await page.close();
    }

    // ── 5. Genuine commercial intent still routes to the portal lane ──────────
    {
      const page = await newPage(browser);
      await page.goto(`http://127.0.0.1:${PORT}/discuss-a-case/`, { waitUntil: "networkidle0" });
      const rec = await fillAndSubmit(page, "What is the price for a surgical guide?");
      check("commercial intent still routes to the portal lane",
        rec?.Inquiry_Category === "Portal-Routed" && rec?.Journey_Stage === "Portal Guidance Needed",
        `${rec?.Inquiry_Category} / ${rec?.Journey_Stage}`);
      await page.close();
    }

  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} passed`);
  spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  accounts.close(); api.close();
  await sleep(400);
  process.exit(results.every((r) => r.pass) ? 0 : 1);
})();
