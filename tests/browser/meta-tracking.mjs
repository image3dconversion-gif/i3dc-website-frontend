/**
 * Browser-level proof of the consent-gated Meta Pixel and server-only Lead.
 *
 * Drives real Chrome against `next dev`, with a fake Zoho and a fake Graph API
 * on loopback. NOTHING REACHES META OR THE CRM:
 *   - in the browser, every request to a Meta host is intercepted: fbevents.js
 *     is answered with a local stub that records each fbq call, anything else
 *     is aborted and counted as a violation, and Chrome's DNS for Meta domains
 *     is disabled outright as a second barrier;
 *   - on the server, CAPI goes to the fake Graph API — the dev guard refuses any
 *     non-loopback host — and every credential is a random fake sentinel.
 *
 * Three phases, each on a fresh dev server:
 *   A. Meta ON,  Zoho live (fake): every consent state, PageView, BROWSER_LEAD =
 *      OFF, the frozen CAPI payload, Case Portal rules, service and campaign
 *      continuity, synthetic and no-match-key outcomes.
 *   B. Meta ON,  Zoho DRY-RUN:     success is shown, zero Lead events.
 *   C. Meta OFF (default config):  the integration is fully inert.
 *
 * Run: npm run test:browser   (after the soft-navigation suite)
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import puppeteer from "puppeteer-core";

const APP_DIR = process.cwd();
const LOCKED = "1788653802312623";
/** Legacy SurgiGuide/workshop Pixel, as published in paulsudeep.com's page source. */
const LEGACY_PIXEL_IDS = ["950428851390424"];
const SENTINEL_TOKEN = `FAKE-CAPI-TOKEN-${randomBytes(12).toString("hex")}`;
const SENTINEL_SECRET = `fake-event-secret-${randomBytes(16).toString("hex")}`;
const CONSENT_VERSION = "2026-11-02.v1";
const PORTS = { A: 3096, B: 3097, C: 3098 };
const ACCOUNTS_PORT = 4371, API_PORT = 4372, GRAPH_PORT = 4373;

const EMAIL = "ZZ.Browser.Meta@Clinic-Sample.in";
const PHONE = "98765 43210";
const MESSAGE = "I would like planning support for an upcoming procedure.";
const FBP = "fb.1.1596403881668.1116446470";
const FBC = "fb.1.1757000000000.IwAR-browser_cookie";
const META_HOST = /(^|\.)(facebook\.com|facebook\.net|fbcdn\.net|fbsbx\.com|meta\.com|instagram\.com)$/i;

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
const CHROME = CHROME_CANDIDATES.find((p) => p && existsSync(p));

/**
 * Stand-in for fbevents.js. Like the real library it takes over the queue the
 * base code built, then handles each later call — but it only REPORTS them.
 */
const FBEVENTS_STUB = `(function () {
  var f = window.fbq; if (!f) return;
  function report(a) {
    try {
      window.__metaSpy(JSON.stringify({
        href: location.href, args: a,
        flags: { disablePushState: f.disablePushState === true, allowDuplicatePageViews: f.allowDuplicatePageViews === true }
      }));
    } catch (e) {}
  }
  f.callMethod = function () { report(Array.prototype.slice.call(arguments)); };
  var q = f.queue || []; f.queue = [];
  for (var i = 0; i < q.length; i++) report(Array.prototype.slice.call(q[i]));
})();`;

// ── fakes ───────────────────────────────────────────────────────────────────
let zohoMode = "ok"; // ok | create-fail | auth-fail
let graphMode = "ok"; // ok | hang
const zohoCreates = [];
const graphRequests = [];

function zohoHandler(req, res) {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    res.setHeader("content-type", "application/json");
    if (req.socket.localPort === ACCOUNTS_PORT) {
      if (zohoMode === "auth-fail") return res.writeHead(401).end('{"error":"invalid_client"}');
      return res.writeHead(200).end(JSON.stringify({ access_token: "FAKE-ZOHO-ACCESS" }));
    }
    try { zohoCreates.push(JSON.parse(body)); } catch { /* ignore */ }
    if (zohoMode === "create-fail") return res.writeHead(400).end(JSON.stringify({ data: [{ code: "INVALID_DATA" }] }));
    res.writeHead(201).end(JSON.stringify({ data: [{ code: "SUCCESS", details: { id: "FAKE-ID" } }] }));
  });
}

function graphHandler(req, res) {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let parsed = null;
    try { parsed = JSON.parse(body); } catch { /* ignore */ }
    graphRequests.push({ at: Date.now(), method: req.method, url: req.url, headers: req.headers, body: parsed, raw: body });
    if (graphMode === "hang") return; // never answers — the sender's timeout must fire
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ events_received: 1, fbtrace_id: "FAKE-TRACE" }));
  });
}

const accounts = http.createServer(zohoHandler).listen(ACCOUNTS_PORT, "127.0.0.1");
const api = http.createServer(zohoHandler).listen(API_PORT, "127.0.0.1");
const graph = http.createServer(graphHandler).listen(GRAPH_PORT, "127.0.0.1");

// ── environment per phase ───────────────────────────────────────────────────
const ZOHO_LIVE_FAKE = {
  ZOHO_SUBMIT_ENABLED: "true", ZOHO_ALLOW_LOCAL_LIVE: "true",
  ZOHO_ACCOUNTS_URL: `http://127.0.0.1:${ACCOUNTS_PORT}`, ZOHO_API_DOMAIN: `http://127.0.0.1:${API_PORT}`,
  ZOHO_CLIENT_ID: "f", ZOHO_CLIENT_SECRET: "f", ZOHO_REFRESH_TOKEN: "f", ZOHO_MODULE: "Leads",
};
const ZOHO_DRY_RUN = { ...ZOHO_LIVE_FAKE, ZOHO_SUBMIT_ENABLED: "false", ZOHO_ALLOW_LOCAL_LIVE: "false" };
const META_ON = {
  META_TRACKING_ENABLED: "true", NEXT_PUBLIC_META_PIXEL_ID: LOCKED, META_CAPI_DELIVERY: "LIVE",
  META_CAPI_ACCESS_TOKEN: SENTINEL_TOKEN, META_EVENT_ID_SECRET: SENTINEL_SECRET,
  META_ALLOW_LOCAL_TRACKING: "true", META_GRAPH_API_BASE: `http://127.0.0.1:${GRAPH_PORT}`,
};
const META_OFF = { META_TRACKING_ENABLED: "false", NEXT_PUBLIC_META_PIXEL_ID: LOCKED, META_CAPI_ACCESS_TOKEN: SENTINEL_TOKEN, META_EVENT_ID_SECRET: SENTINEL_SECRET };

function cleanEnv() {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (/^(META_|ZOHO_|NEXT_PUBLIC_META_)/.test(k)) delete env[k];
  return env;
}

async function waitReady(port) {
  for (let i = 0; i < 180; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/api/enquiry/`)).status === 405) return true; } catch { /* not up yet */ }
    await sleep(1000);
  }
  return false;
}

function stop(proc) {
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
  else proc.kill("SIGTERM");
}

async function withServer(port, env, fn) {
  const proc = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(port)], {
    cwd: APP_DIR,
    env: { ...cleanEnv(), ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const server = { port, base: `http://127.0.0.1:${port}`, log: "" };
  proc.stdout.on("data", (d) => (server.log += d));
  proc.stderr.on("data", (d) => (server.log += d));
  try {
    if (!(await waitReady(port))) throw new Error(`SERVER ${port} DID NOT START\n${server.log.slice(-2000)}`);
    // Compile every route the phase visits up front, so the dev server never
    // has to rebuild mid-navigation (which can force a full reload in dev only).
    for (const p of ["/", "/how-it-works/", "/discuss-a-case/", "/case-portal/", "/full-arch-stackable-workflow/"]) {
      try { await fetch(`${server.base}${p}`); } catch { /* compiled on first visit instead */ }
    }
    return await fn(server);
  } finally {
    stop(proc);
    await sleep(1500);
  }
}

// ── results ─────────────────────────────────────────────────────────────────
const results = [];
const check = (desc, pass, detail) => {
  results.push({ desc, pass: Boolean(pass) });
  console.log((pass ? "PASS  " : "FAIL  ") + desc + (detail !== undefined && detail !== "" ? `  [${detail}]` : ""));
};

async function waitFor(pred, timeoutMs = 10000, stepMs = 100) {
  for (let t = 0; t < timeoutMs; t += stepMs) {
    if (pred()) return true;
    await sleep(stepMs);
  }
  return pred();
}

// ── page harness ────────────────────────────────────────────────────────────
const allViolations = [];
const scannedBodies = [];
let ipCounter = 0;

async function newPage(browser, { mockApi, isolated = false } = {}) {
  const ctx = { spy: [], stubLoads: 0, apiRequests: [], apiResponses: [], ip: `203.0.113.${(++ipCounter % 240) + 1}` };
  // An isolated context starts with no cookies or storage (e.g. no _fbc cookie).
  ctx.context = isolated ? await browser.createBrowserContext() : null;
  const page = await (ctx.context ?? browser).newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ctx.ip });
  await page.evaluateOnNewDocument(() => { window.__docId = String(Math.random()); });
  await page.exposeFunction("__metaSpy", (json) => ctx.spy.push({ at: Date.now(), ...JSON.parse(json) }));
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.isInterceptResolutionHandled()) return;
    let url;
    try { url = new URL(req.url()); } catch { return req.continue(); }
    if (META_HOST.test(url.hostname)) {
      if (url.hostname === "connect.facebook.net" && url.pathname.endsWith("/fbevents.js")) {
        ctx.stubLoads++;
        return req.respond({ status: 200, contentType: "application/javascript", body: FBEVENTS_STUB });
      }
      allViolations.push(req.url());
      return req.abort("blockedbyclient");
    }
    if (url.pathname.startsWith("/api/enquiry") && req.method() === "POST") {
      let payload = null;
      try { payload = JSON.parse(req.postData() ?? "null"); } catch { /* not JSON */ }
      ctx.apiRequests.push({ at: Date.now(), payload });
      if (mockApi) return req.respond({ status: 200, contentType: "application/json", body: JSON.stringify(mockApi) });
    }
    if (url.protocol.startsWith("http") && !["127.0.0.1", "localhost"].includes(url.hostname)) {
      allViolations.push(`external: ${req.url()}`);
      return req.abort("blockedbyclient");
    }
    req.continue();
  });
  page.on("response", async (res) => {
    const type = res.request().resourceType();
    const isApi = res.url().includes("/api/enquiry") && res.request().method() === "POST";
    try {
      if (isApi) {
        const text = await res.text();
        scannedBodies.push({ url: res.url(), text });
        ctx.apiResponses.push({ at: Date.now(), status: res.status(), body: JSON.parse(text) });
      } else if (["document", "script", "fetch", "xhr"].includes(type) && res.url().startsWith("http://127.0.0.1")) {
        scannedBodies.push({ url: res.url(), text: await res.text() });
      }
    } catch { /* redirects, aborted or unloaded bodies */ }
  });
  return { page, ctx };
}

const track = (ctx, name) => ctx.spy.filter((c) => c.args[0] === "track" && c.args[1] === name);
const pageViews = (ctx) => track(ctx, "PageView");
const leadCalls = (ctx) => ctx.spy.filter((c) => c.args.includes("Lead"));
const pathOf = (href) => { const u = new URL(href); return u.pathname + u.search; };

/**
 * DOM-level click. Coordinate clicks can land on the sticky header when an
 * element is scrolled to the viewport edge; these forms read their state from
 * the DOM (FormData), so a DOM click is the faithful, deterministic action.
 */
const domClick = (page, selector) => page.$eval(selector, (el) => el.click());

async function clickHref(page, href) {
  await page.evaluate((h) => {
    const a = [...document.querySelectorAll("a")].find((el) => el.getAttribute("href") === h);
    if (!a) throw new Error(`no link ${h}`);
    a.click();
  }, href);
}

async function fillEnquiry(page, { name = "ZZ Browser Meta", email = EMAIL, phone = PHONE, message = MESSAGE, existing = false, inquiryType = "service-information" } = {}) {
  if (name) await page.type("#name", name);
  await page.type("#org", "ZZ Meta Clinic");
  if (phone) await page.type("#phone", phone);
  await page.type("#email", email);
  await page.type("#summary", message);
  await page.select("#inquiryType", inquiryType);
  if (existing) await domClick(page, '#form form input[name="existingCustomer"]');
  await domClick(page, '#form form input[name="consent"]');
}

const submitEnquiry = (page) => domClick(page, '#form form button[type="submit"]');

/** True once the page shows `text`; false on timeout (never throws). */
async function bodyHas(page, text, timeout = 30000) {
  try {
    await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, text);
    return true;
  } catch {
    return false;
  }
}

/** What the page and API said, for a failing check. */
async function diag(page, ctx) {
  const alert = await page.evaluate(() => document.querySelector('[role="alert"]')?.innerText ?? "").catch(() => "");
  return `alert=${JSON.stringify(alert.slice(0, 160))} api=${JSON.stringify(ctx.apiResponses.map((r) => [r.status, r.body]))}`.slice(0, 400);
}

/** Run one scenario in isolation: an exception fails that scenario only. */
async function scenario(name, fn) {
  try {
    await fn();
  } catch (err) {
    check(`${name}: scenario completed`, false, String(err?.message ?? err).split("\n")[0]);
  }
}

// ── phases ──────────────────────────────────────────────────────────────────
const stored = (state) => JSON.stringify({ state, version: CONSENT_VERSION, at: "2026-11-02T10:00:00.000Z" });

/** A page whose browser already holds this consent state and these cookies. */
async function openWith(browser, base, path, { consent, cookies = [], viewport } = {}) {
  const { page, ctx } = await newPage(browser, { isolated: true });
  if (viewport) await page.setViewport(viewport);
  if (consent !== undefined) {
    await page.evaluateOnNewDocument((raw) => {
      if (!sessionStorage.getItem("__seeded")) {
        localStorage.setItem("i3dc.measurement", raw);
        sessionStorage.setItem("__seeded", "1");
      }
    }, consent);
  }
  for (const [name, value] of cookies) await page.setCookie({ name, value, url: base });
  await page.goto(`${base}${path}`, { waitUntil: "networkidle0" });
  await sleep(500);
  return { page, ctx };
}

const clickButton = (page, text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((el) => el.innerText.trim().replace("’", "'") === t);
    if (!b) throw new Error(`no button ${t}`);
    b.click();
  }, text);

const bannerShown = (page) => page.evaluate(() => Boolean(document.querySelector('section[aria-label="Advertising measurement choice"]')));

async function fillInvitation(page, { email = EMAIL } = {}) {
  await page.type("#pi-name", "ZZ Browser Meta");
  await page.type("#pi-org", "ZZ Meta Clinic");
  await page.type("#pi-email", email);
  await domClick(page, 'form#notify input[name="consent"]');
  await domClick(page, 'form#notify input[name="consentEmailMarketing"]');
}
const submitInvitation = (page) => domClick(page, 'form#notify button[type="submit"]');

const newEvents = (before) => graphRequests.slice(before).flatMap((g) => g.body?.data ?? []);

async function assertZeroMeta(label, page, ctx) {
  check(`${label}: no fbq on the page`, await page.evaluate(() => typeof window.fbq === "undefined"));
  check(`${label}: fbevents.js never requested`, ctx.stubLoads === 0, `loads ${ctx.stubLoads}`);
  check(`${label}: no browser Meta calls`, ctx.spy.length === 0);
}

async function submitAndExpectZeroCapi(label, page, ctx) {
  const graphBefore = graphRequests.length, zohoBefore = zohoCreates.length;
  await fillEnquiry(page);
  await submitEnquiry(page);
  const shown = await bodyHas(page, "your enquiry has been received");
  await sleep(2000);
  check(`${label}: the enquiry itself succeeds`, shown && zohoCreates.length === zohoBefore + 1, shown ? "" : await diag(page, ctx));
  check(`${label}: zero CAPI`, graphRequests.length === graphBefore, `+${graphRequests.length - graphBefore}`);
}

async function phaseA(browser) {
  await withServer(PORTS.A, { ...ZOHO_LIVE_FAKE, ...META_ON }, async (server) => {
    const { base } = server;
    console.log(`\n── Phase A: Meta ON, Zoho live (fake) — ${base}`);
    const staleCookies = [["_fbp", FBP], ["_fbc", FBC]];

    await scenario("A1", async () => {
      const { page, ctx } = await openWith(browser, base, "/discuss-a-case/", { cookies: staleCookies });
      check("A1 UNDECIDED: banner is shown", await bannerShown(page));
      check("A1 UNDECIDED: nothing preselected in the banner", await page.evaluate(() => {
        const s = document.querySelector('section[aria-label="Advertising measurement choice"]');
        return s.querySelectorAll("input").length === 0 && [...s.querySelectorAll("button")].length === 2;
      }));
      await assertZeroMeta("A1 UNDECIDED", page, ctx);
      if (process.env.I3DC_SHOTS) await page.screenshot({ path: `${process.env.I3DC_SHOTS}/banner-desktop.png` });
      await submitAndExpectZeroCapi("A1 UNDECIDED, stale cookies present", page, ctx);
      check("A1 the form reported UNDECIDED", ctx.apiRequests[0]?.payload?.measurementConsent === "UNDECIDED");
      await assertZeroMeta("A1 after submit", page, ctx);
      await page.close();
    });

    await scenario("A1m", async () => {
      const { page } = await openWith(browser, base, "/case-portal/", { viewport: { width: 375, height: 812 } });
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; document.getElementById("request-invitation").scrollIntoView(); });
      await sleep(300);
      if (process.env.I3DC_SHOTS) await page.screenshot({ path: `${process.env.I3DC_SHOTS}/banner-mobile-form.png` });
      const h = await page.evaluate(() => document.querySelector('section[aria-label="Advertising measurement choice"]').getBoundingClientRect().height);
      check("A1m mobile banner stays compact", h <= 150, `${Math.round(h)}px`);
      check("A1m no horizontal scroll", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.close();
    });

    await scenario("A2", async () => {
      const { page, ctx } = await openWith(browser, base, "/discuss-a-case/", { cookies: staleCookies });
      await clickButton(page, "Don't allow");
      await sleep(400);
      check("A2 DENY: banner closes", !(await bannerShown(page)));
      await assertZeroMeta("A2 DENY", page, ctx);
      check("A2 DENY: Meta cookies expired", await page.evaluate(() => !document.cookie.includes("_fbp") && !document.cookie.includes("_fbc")));
      await page.reload({ waitUntil: "networkidle0" });
      await sleep(400);
      check("A2 DENY survives a reload", !(await bannerShown(page)));
      await assertZeroMeta("A2 DENY after reload", page, ctx);
      await page.close();
    });

    await scenario("A3", async () => {
      const { page, ctx } = await openWith(browser, base, "/discuss-a-case/", { consent: stored("DENY"), cookies: staleCookies });
      await submitAndExpectZeroCapi("A3 DENY with cookies from an earlier ALLOW", page, ctx);
      check("A3 the form reported DENY", ctx.apiRequests[0]?.payload?.measurementConsent === "DENY");
      await page.close();
    });

    await scenario("A4", async () => {
      const { page, ctx } = await openWith(browser, base, "/discuss-a-case/", { consent: "{damaged", cookies: staleCookies });
      check("A4 UNKNOWN: banner is shown", await bannerShown(page));
      await assertZeroMeta("A4 UNKNOWN", page, ctx);
      await submitAndExpectZeroCapi("A4 UNKNOWN", page, ctx);
      check("A4 the form reported UNKNOWN", ctx.apiRequests[0]?.payload?.measurementConsent === "UNKNOWN");
      await page.close();
    });

    await scenario("A5", async () => {
      const { page, ctx } = await openWith(browser, base, "/", {});
      await assertZeroMeta("A5 before ALLOW", page, ctx);
      await clickButton(page, "Allow");
      await waitFor(() => ctx.stubLoads === 1);
      await sleep(600);
      const calls = ctx.spy.map((c) => c.args);
      const iSet = calls.findIndex((a) => a[0] === "set" && a[1] === "autoConfig");
      const iInit = calls.findIndex((a) => a[0] === "init");
      check("A5 ALLOW: fbevents.js requested once", ctx.stubLoads === 1, `loads ${ctx.stubLoads}`);
      check("A5 autoConfig=false before init", iSet >= 0 && calls[iSet][2] === false && iInit > iSet);
      check("A5 init: exactly the I3DC dataset, id only", JSON.stringify(calls.filter((a) => a[0] === "init")) === JSON.stringify([["init", LOCKED]]));
      check("A5 exactly one PageView after ALLOW", pageViews(ctx).length === 1, `count ${pageViews(ctx).length}`);
      check("A5 banner closes", !(await bannerShown(page)));
      await clickHref(page, "/how-it-works/");
      await page.waitForFunction(() => location.pathname === "/how-it-works/", { timeout: 30000 });
      await waitFor(() => pageViews(ctx).length === 2);
      check("A5 soft navigation: one more PageView", pageViews(ctx).length === 2, `count ${pageViews(ctx).length}`);
      check("A5 fbevents.js not re-requested", ctx.stubLoads === 1);
      await page.close();
    });

    let leadOneId = null;
    await scenario("A6", async () => {
      const { page, ctx } = await openWith(browser, base, "/discuss-a-case/", { consent: stored("ALLOW"), cookies: staleCookies });
      check("A6 returning ALLOW: no banner", !(await bannerShown(page)));
      check("A6 returning ALLOW: PageView fires", pageViews(ctx).length === 1);
      const graphBefore = graphRequests.length, zohoBefore = zohoCreates.length;
      await fillEnquiry(page);
      await submitEnquiry(page);
      const shown = await bodyHas(page, "your enquiry has been received");
      await waitFor(() => graphRequests.length > graphBefore, 8000);
      await sleep(1000);
      const ev = newEvents(graphBefore);
      const res = ctx.apiResponses[0];
      check("A6 success shown", shown, shown ? "" : await diag(page, ctx));
      check("A6 exactly one CAPI Lead", ev.length === 1 && ev[0].event_name === "Lead", `events ${ev.length}`);
      check("A6 BROWSER_LEAD = OFF: no browser Lead", leadCalls(ctx).length === 0, JSON.stringify(leadCalls(ctx)));
      check("A6 only PageView was tracked in the browser", ctx.spy.filter((c) => /^track/.test(c.args[0])).every((c) => c.args[1] === "PageView"));
      check("A6 event id has the derived format", /^i3dc_lead_[0-9a-f]{32}$/.test(ev[0]?.event_id ?? ""), ev[0]?.event_id);
      leadOneId = ev[0]?.event_id;
      const ud = ev[0]?.user_data ?? {};
      check("A6 user_data is exactly fbp, fbc, user agent", JSON.stringify(Object.keys(ud).sort()) === JSON.stringify(["client_user_agent", "fbc", "fbp"]) && ud.fbp === FBP && ud.fbc === FBC, JSON.stringify(Object.keys(ud)));
      const raw = JSON.stringify(graphRequests[graphBefore]?.body ?? {});
      check("A6 no email, phone, IP or external id in the payload", !["\"em\"", "\"ph\"", "client_ip_address", "external_id", EMAIL.toLowerCase(), "9876543210", ctx.ip].some((s) => raw.includes(s)));
      check("A6 website_ref never reaches Meta", !/i3dc_ref_/.test(raw));
      check("A6 the response carries no reference or event id", !/i3dc_ref_|i3dc_lead_|metaEventId/.test(JSON.stringify(res?.body ?? {})));
      const rec = zohoCreates[zohoBefore]?.data?.[0];
      check("A6 website_ref is in the CRM Description", /Website ref: i3dc_ref_[0-9a-f]{32}/.test(rec?.Description ?? ""));
      check("A6 CAPI targets the I3DC dataset, token in the header only", graphRequests[graphBefore]?.url === `/v26.0/${LOCKED}/events` && graphRequests[graphBefore]?.headers?.authorization === `Bearer ${SENTINEL_TOKEN}` && !raw.includes(SENTINEL_TOKEN));
      const count = graphRequests.length;
      await page.reload({ waitUntil: "networkidle0" });
      await sleep(1000);
      check("A6 a reload adds no Lead", graphRequests.length === count);
      await page.close();
    });

    await scenario("A7", async () => {
      const { page, ctx } = await openWith(browser, base, "/", { consent: stored("ALLOW"), cookies: staleCookies });
      check("A7 ALLOW: PageView fires", pageViews(ctx).length === 1);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("footer button")].find((el) => el.innerText.includes("Measurement preferences"));
        if (!b) throw new Error("no preferences link");
        b.click();
      });
      await sleep(300);
      check("A7 the preferences link reopens the choice", await bannerShown(page));
      await clickButton(page, "Don't allow");
      await waitFor(() => ctx.spy.some((c) => c.args[0] === "consent" && c.args[1] === "revoke"));
      check("A7 withdrawing tells the loaded Pixel to stop", ctx.spy.some((c) => c.args[0] === "consent" && c.args[1] === "revoke"));
      check("A7 Meta cookies expired", await page.evaluate(() => !document.cookie.includes("_fbp") && !document.cookie.includes("_fbc")));
      const views = pageViews(ctx).length;
      await clickHref(page, "/discuss-a-case/");
      await page.waitForFunction(() => location.pathname === "/discuss-a-case/", { timeout: 30000 });
      await sleep(1000);
      check("A7 no PageView after withdrawing", pageViews(ctx).length === views);
      await page.setCookie({ name: "_fbp", value: FBP, url: base });
      await submitAndExpectZeroCapi("A7 after withdrawing, with a cookie still present", page, ctx);
      await page.close();
    });

    await scenario("A8", async () => {
      const { page, ctx } = await openWith(browser, base, "/case-portal/?utm_source=facebook&utm_campaign=i3dc_portal_wave1_2026_10&utm_id=u1&campaign_id=c1&adset_id=s1&ad_id=a1&fbclid=IwAR-portal", { consent: stored("ALLOW"), cookies: staleCookies });
      const graphBefore = graphRequests.length, zohoBefore = zohoCreates.length;
      check("A8 /case-portal/ view: PageView only", pageViews(ctx).length === 1);
      await domClick(page, 'a[href="#request-invitation"]');
      await sleep(800);
      check("A8 page view and CTA click are not Leads", graphRequests.length === graphBefore && leadCalls(ctx).length === 0 && zohoCreates.length === zohoBefore);
      await fillInvitation(page);
      check("A8 viewing and filling the form is not a Lead", graphRequests.length === graphBefore);
      await submitInvitation(page);
      const shown = await bodyHas(page, "your invitation request is with our team");
      await waitFor(() => graphRequests.length > graphBefore, 8000);
      await sleep(800);
      const ev = newEvents(graphBefore);
      check("A8 accepted invitation + ALLOW: exactly one server Lead", shown && ev.length === 1, shown ? `events ${ev.length}` : await diag(page, ctx));
      check("A8 no browser Lead", leadCalls(ctx).length === 0);
      check("A8 event source is the portal page, no query or hash", new URL(ev[0]?.event_source_url ?? "http://x/").pathname === "/case-portal/" && !/[?#]/.test(ev[0]?.event_source_url ?? ""));
      const rec = zohoCreates[zohoBefore]?.data?.[0];
      check("A8 CRM mapping kept: Portal-Routed, no Journey_Stage", rec?.Inquiry_Category === "Portal-Routed" && !("Journey_Stage" in (rec ?? {})));
      check("A8 UTMs and fbclid reach their CRM fields", rec?.UTM_Campaign === "i3dc_portal_wave1_2026_10" && rec?.Meta_FBCLID === "IwAR-portal");
      check("A8 ad identifiers reach the Description", ["UTM id: u1", "Campaign id: c1", "Ad set id: s1", "Ad id: a1"].every((l) => rec?.Description?.includes(l)));
      await page.close();
    });

    await scenario("A9", async () => {
      const { page, ctx } = await openWith(browser, base, "/case-portal/", { consent: stored("DENY"), cookies: staleCookies });
      const graphBefore = graphRequests.length, zohoBefore = zohoCreates.length;
      await fillInvitation(page);
      await submitInvitation(page);
      const shown = await bodyHas(page, "your invitation request is with our team");
      await sleep(2000);
      check("A9 invitation under DENY: CRM create, zero Meta", shown && zohoCreates.length === zohoBefore + 1 && graphRequests.length === graphBefore);
      await assertZeroMeta("A9 DENY", page, ctx);
      await page.close();
    });

    await scenario("A10", async () => {
      const { page, ctx } = await openWith(browser, base, "/full-arch-stackable-workflow/?utm_source=facebook&fbclid=IwAR-service", { consent: stored("DENY") });
      const href = "/discuss-a-case/?service=full-arch-stackable#form";
      check("A10 the service page CTA carries its service", await page.evaluate((h) => [...document.querySelectorAll("a")].some((a) => a.getAttribute("href") === h), href));
      await clickHref(page, href);
      await page.waitForFunction(() => location.pathname === "/discuss-a-case/", { timeout: 30000 });
      await bodyHas(page, "Enquiring about");
      const zohoBefore = zohoCreates.length;
      await fillEnquiry(page);
      await submitEnquiry(page);
      const shown = await bodyHas(page, "your enquiry has been received");
      await sleep(800);
      const rec = zohoCreates[zohoBefore]?.data?.[0];
      check("A10 Service_Interest / Workflow_Interest recorded", shown && rec?.Service_Interest === "Full-Arch/Stackable Guide" && rec?.Workflow_Interest === "Full-Arch", shown ? rec?.Service_Interest : await diag(page, ctx));
      check("A10 UTM and fbclid survive the navigation", rec?.UTM_Source === "facebook" && rec?.Meta_FBCLID === "IwAR-service");
      await page.close();
    });

    await scenario("A11", async () => {
      const { page, ctx } = await openWith(browser, base, "/case-portal/#request-invitation?utm_source=facebook&ad_id=a1&fbclid=IwAR-hash", { consent: stored("DENY") });
      const zohoBefore = zohoCreates.length;
      await fillInvitation(page);
      await submitInvitation(page);
      const shown = await bodyHas(page, "your invitation request is with our team");
      await sleep(500);
      const rec = zohoCreates[zohoBefore]?.data?.[0];
      check("A11 parameters after # are not attribution", shown && !rec?.UTM_Source && !rec?.Meta_FBCLID && !rec?.Description?.includes("Ad id:"), shown ? "" : await diag(page, ctx));
      await page.close();
    });

    await scenario("A12", async () => {
      const { page } = await openWith(browser, base, "/discuss-a-case/", { consent: stored("ALLOW") });
      const graphBefore = graphRequests.length;
      await fillEnquiry(page, { email: "qa@example.com" });
      await submitEnquiry(page);
      const shown = await bodyHas(page, "your enquiry has been received");
      await sleep(2000);
      check("A12 synthetic + ALLOW: enquiry succeeds, zero CAPI", shown && graphRequests.length === graphBefore);
      await page.close();
    });

    await scenario("A13", async () => {
      const { page, ctx } = await openWith(browser, base, "/discuss-a-case/", { consent: stored("ALLOW") });
      const graphBefore = graphRequests.length;
      await fillEnquiry(page);
      await submitEnquiry(page);
      const shown = await bodyHas(page, "your enquiry has been received");
      await sleep(2000);
      check("A13 ALLOW, no _fbp/_fbc: enquiry succeeds, nothing sent", shown && graphRequests.length === graphBefore, shown ? "" : await diag(page, ctx));
      check("A13 the outcome is explicit in the log", server.log.includes("not_sent:no_match_keys"));
      await page.close();
    });

    await scenario("A14", async () => {
      zohoMode = "create-fail";
      try {
        const { page } = await openWith(browser, base, "/discuss-a-case/", { consent: stored("ALLOW"), cookies: staleCookies });
        const graphBefore = graphRequests.length;
        await fillEnquiry(page);
        await submitEnquiry(page);
        const shown = await bodyHas(page, "We couldn");
        await sleep(1500);
        check("A14 Zoho refuses: fallback shown, zero CAPI", shown && graphRequests.length === graphBefore);
        await page.close();
      } finally {
        zohoMode = "ok";
      }
    });

    const log = server.log;
    check("A no request reached any Meta or external host", allViolations.length === 0, allViolations.slice(0, 3).join(" "));
    check("A server log: no token, secret, email, phone or message", ![SENTINEL_TOKEN, SENTINEL_SECRET, EMAIL, EMAIL.toLowerCase(), PHONE, MESSAGE].some((s) => log.includes(s)));
    check("A server log: delivery recorded by event id", Boolean(leadOneId) && log.includes(leadOneId) && log.includes("[meta:capi] Lead delivered"));
    check("A no page, script or API response carries a secret", !scannedBodies.some((b) => b.text.includes(SENTINEL_TOKEN) || b.text.includes(SENTINEL_SECRET)));
    check("A no page or script carries a legacy Pixel id", !scannedBodies.some((b) => LEGACY_PIXEL_IDS.some((id) => b.text.includes(id))));
  });
}

async function phaseB(browser) {
  await withServer(PORTS.B, { ...ZOHO_DRY_RUN, ...META_ON }, async (server) => {
    const { base } = server;
    console.log(`\n── Phase B: Meta ON, Zoho DRY-RUN — ${base}`);
    await scenario("B", async () => {
      const { page, ctx } = await openWith(browser, base, "/discuss-a-case/", { consent: stored("ALLOW"), cookies: [["_fbp", FBP], ["_fbc", FBC]] });
      const graphBefore = graphRequests.length, zohoBefore = zohoCreates.length;
      await fillEnquiry(page);
      await submitEnquiry(page);
      const shown = await bodyHas(page, "your enquiry has been received");
      await sleep(2000);
      check("B dry-run: success shown, zero CAPI, Zoho not contacted", shown && ctx.apiResponses[0]?.body?.mode === "dry-run" && graphRequests.length === graphBefore && zohoCreates.length === zohoBefore);
      await page.close();
    });
  });
}

async function phaseC(browser) {
  await withServer(PORTS.C, { ...ZOHO_LIVE_FAKE, ...META_OFF }, async (server) => {
    const { base } = server;
    console.log(`\n── Phase C: Meta OFF (default config), Zoho live (fake) — ${base}`);
    await scenario("C", async () => {
      const { page, ctx } = await openWith(browser, base, "/discuss-a-case/", { consent: stored("ALLOW"), cookies: [["_fbp", FBP], ["_fbc", FBC]] });
      await assertZeroMeta("C", page, ctx);
      check("C no banner", !(await bannerShown(page)));
      check("C no preferences link", await page.evaluate(() => ![...document.querySelectorAll("footer button")].some((el) => el.innerText.includes("Measurement preferences"))));
      check("C the Pixel id is not rendered", !(await page.content()).includes(LOCKED));
      await submitAndExpectZeroCapi("C", page, ctx);
      check("C response shape has no Meta field", JSON.stringify(Object.keys(ctx.apiResponses[0]?.body ?? {}).sort()) === JSON.stringify(["action", "message", "mode", "ok", "pipeline"]));
      check("C no request reached any Meta or external host", allViolations.length === 0);
      check("C secrets absent from the server log", !server.log.includes(SENTINEL_TOKEN));
      await page.close();
    });
  });
}

(async () => {
  let exitCode = 1;
  try {
    if (!CHROME) throw new Error("NO CHROME FOUND — cannot run the browser suite");
    console.log(`chrome: ${CHROME}`);
    const browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: true,
      args: [
        "--no-sandbox",
        // Second barrier: Meta hostnames cannot even resolve.
        "--host-resolver-rules=MAP *.facebook.com ~NOTFOUND, MAP facebook.com ~NOTFOUND, MAP *.facebook.net ~NOTFOUND, MAP facebook.net ~NOTFOUND, MAP *.fbcdn.net ~NOTFOUND",
      ],
    });
    try {
      await phaseA(browser);
      await phaseB(browser);
      await phaseC(browser);
    } finally {
      await browser.close();
    }
    const passed = results.filter((r) => r.pass).length;
    console.log(`\n${passed}/${results.length} passed`);
    exitCode = results.length > 0 && results.every((r) => r.pass) ? 0 : 1;
  } catch (err) {
    console.log(`ERROR  ${err?.stack ?? err}`);
  } finally {
    accounts.close(); api.close();
    graph.closeAllConnections(); graph.close();
    await sleep(400);
    process.exit(exitCode);
  }
})();
