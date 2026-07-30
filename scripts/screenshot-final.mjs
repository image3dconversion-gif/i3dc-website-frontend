/** Final full-site screenshot pass: desktop + mobile for all main pages. */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3001";
const OUT = "docs/handoff/screenshots/final";
await mkdir(OUT, { recursive: true });

const pages = {
  home: "/",
  services: "/digital-implant-workflows/",
  "how-it-works": "/how-it-works/",
  "case-portal": "/case-portal/",
  about: "/about/",
  discuss: "/discuss-a-case/",
  faq: "/faq/",
  "workflow-full-arch": "/full-arch-stackable-workflow/",
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
});

async function shoot(name, path, w, h, dpr, full) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
  await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => document.fonts?.ready);
  await new Promise((r) => setTimeout(r, 500));
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage: full });
  console.log(`✓ ${file}`);
  await page.close();
}

for (const [name, path] of Object.entries(pages)) {
  await shoot(`desktop-${name}`, path, 1440, 900, 2, false); // above-fold retina
  await shoot(`mobile-${name}`, path, 390, 844, 3, false); // mobile retina
}
// homepage full page (1x to stay under Chrome's screenshot height cap)
await shoot("desktop-home-full", "/", 1440, 900, 1, true);
await shoot("mobile-home-full", "/", 390, 844, 1, true);

// mobile nav open — prove the hamburger menu works
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await page.click('button[aria-controls="mobile-nav-panel"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: `${OUT}/mobile-home-menu.png` });
  console.log(`✓ ${OUT}/mobile-home-menu.png`);
  await page.close();
}

await browser.close();
console.log("done");
