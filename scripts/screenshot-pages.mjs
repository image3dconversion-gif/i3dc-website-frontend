/** Screenshot a set of pages (desktop above-fold + full, and mobile). */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3001";
const OUT = "docs/handoff/screenshots";
await mkdir(OUT, { recursive: true });

// name -> path
const pages = {
  services: "/digital-implant-workflows/",
  "how-it-works": "/how-it-works/",
  "case-portal": "/case-portal/",
  about: "/about/",
  discuss: "/discuss-a-case/",
  faq: "/faq/",
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
});

async function shoot(name, path, width, height, dpr, fullPage) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: dpr });
  await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => document.fonts?.ready);
  await new Promise((r) => setTimeout(r, 500));
  const file = `${OUT}/page-${name}${fullPage ? "-full" : ""}${width < 500 ? "-mobile" : ""}.png`;
  await page.screenshot({ path: file, fullPage });
  console.log(`✓ ${file}`);
  await page.close();
}

for (const [name, path] of Object.entries(pages)) {
  await shoot(name, path, 1440, 900, 2, false); // above-fold, retina
  await shoot(name, path, 1440, 900, 1, true); // full page, 1x
}
// mobile for the two most interaction-heavy pages
await shoot("discuss", pages["discuss"], 390, 844, 3, false);
await shoot("faq", pages["faq"], 390, 844, 3, false);

await browser.close();
console.log("done");
