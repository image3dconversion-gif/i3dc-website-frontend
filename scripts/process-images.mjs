/**
 * Process APPROVED, PII-FREE source images into web-ready WebP assets.
 *
 * Only images vetted in docs/handoff/IMAGE_ASSET_AUDIT.md are listed here.
 * Explicitly EXCLUDED (never processed): the two renders with burned-in patient
 * names (04 "Untitled design (3).png", 04 "…174128.png"), the education
 * marketing screenshot (04 "…102434.png"), the blue-lit dark guide (03 15.jpg),
 * the rotated founder portrait with off-journey backdrop, and all raw phone
 * photos. Metadata (EXIF) is stripped on output as a privacy safeguard.
 *
 * Run: node scripts/process-images.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "assets-source";
const OUT = "public/images";

/** @type {{src:string,out:string,width:number,logo?:boolean}[]} */
const jobs = [
  // — Planning renders (real 3D implant/anatomy views) —
  { src: "02-3d-planning-screens/Screenshot 2026-01-27 194757.png", out: "planning/implant-plan-frontal.webp", width: 1200 },
  { src: "02-3d-planning-screens/Screenshot 2026-01-27 194929.png", out: "planning/implant-plan-anterior.webp", width: 1200 },
  { src: "02-3d-planning-screens/Screenshot 2026-01-27 195008.png", out: "planning/implant-plan-restorative.webp", width: 1400 },
  { src: "02-3d-planning-screens/full arch.PNG", out: "planning/full-arch-segmentation.webp", width: 1000 },
  // — Full-arch stackable renders (clean, no PII) —
  { src: "04-full-arch-stackable/Screenshot 2025-11-11 130558.png", out: "full-arch/stackable-sequence.webp", width: 1200 },
  { src: "04-full-arch-stackable/Screenshot 2026-03-31 174150.png", out: "full-arch/mua-guide.webp", width: 1200 },
  // — Guide product + CAD —
  { src: "03-surgical-guides/12.jpg", out: "guides/printed-guide-model.webp", width: 900 },
  { src: "03-surgical-guides/14.jpg", out: "guides/printed-guide-sleeves.webp", width: 900 },
  { src: "03-surgical-guides/Screenshot 2026-04-25 113528.png", out: "guides/guide-stl-mesh.webp", width: 1100 },
  // — Master logo (transparent) —
  { src: "08-logos-certificates/logo 1.png", out: "logos/i3dc-logo.webp", width: 1000, logo: true },
];

const ensured = new Set();
async function ensureDir(file) {
  const dir = path.dirname(file);
  if (!ensured.has(dir)) {
    await mkdir(dir, { recursive: true });
    ensured.add(dir);
  }
}

let ok = 0;
for (const job of jobs) {
  const src = path.join(SRC, job.src);
  const out = path.join(OUT, job.out);
  await ensureDir(out);
  let pipe = sharp(src).rotate(); // respect EXIF orientation, then drop metadata
  if (job.logo) pipe = pipe.trim(); // tighten transparent padding around logo
  pipe = pipe.resize({ width: job.width, withoutEnlargement: true });
  // Mild unsharp mask on photographic/render content for crisper edges
  // (planning renders and product photos read soft otherwise). Logo is
  // vector-like and left untouched.
  if (!job.logo) pipe = pipe.sharpen({ sigma: 0.8, m1: 0.5, m2: 0.7 });
  const info = await pipe
    .webp({ quality: job.logo ? 92 : 90, alphaQuality: 100, effort: 5 })
    .toFile(out);
  console.log(`✓ ${job.out.padEnd(38)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
  ok++;
}
console.log(`\nDone. ${ok}/${jobs.length} images written to ${OUT}/`);
