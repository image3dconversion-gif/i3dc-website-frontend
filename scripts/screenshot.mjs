/**
 * Capture desktop + mobile homepage screenshots via headless system Chrome.
 * Usage: node scripts/screenshot.mjs [url]
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv[2] || "http://localhost:3001/";
const OUT = "docs/handoff/screenshots";

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
});

async function shoot(name, width, height, deviceScaleFactor, fullPage) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor });
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });
  // let fonts + lazy images settle
  await page.evaluate(() => document.fonts?.ready);
  await new Promise((r) => setTimeout(r, 600));
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage });
  console.log(`✓ ${path}  (${width}x${height}${fullPage ? " full" : ""})`);
  await page.close();
}

// Above-the-fold at high DPR for crisp, retina-quality output.
// Full-page at DPR 1 to stay under Chrome's ~16384px screenshot height limit
// (a taller capture wraps/repeats the tail).
await shoot("home-desktop", 1440, 900, 2, false);
await shoot("home-desktop-full", 1440, 900, 1, true);
await shoot("home-mobile", 390, 844, 3, false);
await shoot("home-mobile-full", 390, 844, 1, true);

await browser.close();
console.log("done");
