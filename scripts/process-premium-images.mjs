/**
 * Wave 13 — Premium asset processing (SEPARATE from process-images.mjs).
 *
 * Processes ONLY the 17 approved-safe cut-outs vetted against
 * IMAGE3DCONVERSION_PREMIUM_ASSET_DIRECTION.md (Sections 3–7) from
 * assets-source/premium-images/ into public/images/premium/.
 *
 * NOT processed here (do not add without founder sign-off):
 *   - Section 5 rejected files (patient face/mouth, third-party planning UI,
 *     office/staff faces).
 *   - Section 6 founder-review files: all four zygoma ANATOMY renders (green ×3
 *     + orange ×1 — blocked on the site-wide colour decision), the graded
 *     "stackable guided- 2", the orange printing photos, "full arch planning
 *     screen", "WELL-FINISHED…", the 600×600 JPGs, and the logo/favicon set.
 *   - "Screenshot 2026-04-25 113528.png" (borderline provenance).
 *
 * Every job source is a transparent 1080×1080 PNG. Processing:
 *   - rotate() → respects EXIF then drops all metadata on output.
 *   - trim() → tightens transparent padding to true subject bounds (alpha kept).
 *   - resize(withoutEnlargement) → caps width; NEVER upscales (sources ≤1080).
 *   - light unsharp mask → counters resize softening, no halo.
 *   - webp with alphaQuality 100 → preserves transparency.
 * No colour grade is applied (clinical anatomy stays true; per direction doc).
 *
 * Run: node scripts/process-premium-images.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "assets-source/premium-images";
const OUT = "public/images/premium";

/** @type {{src:string,out:string,width:number,slot:string}[]} */
const jobs = [
  // — Homepage hero (composed later on navy canvas; native ≤1080, no upscale) —
  { src: "03-implant-planning/3d implant planning .png", out: "hero-implant-planning.webp", width: 1800, slot: "Homepage hero" },
  // — STL / mesh / guide CAD —
  { src: "02-stl-models/MESH-DESIGN-SURGICAL-GUIDE.png", out: "workflow-guide-cad-mesh.webp", width: 1200, slot: "Homepage workflow / CTA texture" },
  // — Surgical guide —
  { src: "05-surgical-guide/METAL-GUUIDE-IMPLANT-PLACEMENT.png", out: "surgical-guide-full-arch.webp", width: 1200, slot: "Surgical guide" },
  { src: "05-surgical-guide/METALGUIDE.png", out: "surgical-guide-metal-arch.webp", width: 1200, slot: "Surgical guide" },
  { src: "05-surgical-guide/single implant guide.png", out: "surgical-guide-single-scan.webp", width: 1200, slot: "Surgical guide / workflow" },
  { src: "05-surgical-guide/surgical-guide-hand.png", out: "surgical-guide-in-hand.webp", width: 1200, slot: "Surgical guide" },
  { src: "05-surgical-guide/surgical-guide-hand-2.png", out: "surgical-guide-part-in-hand.webp", width: 1200, slot: "Surgical guide detail" },
  // — Full-arch stackable —
  { src: "06-full-arch-stackable/stackable system-black-white.png", out: "fullarch-stackable-grey.webp", width: 1200, slot: "Full-arch / CTA texture" },
  { src: "06-full-arch-stackable/METAL-GUIDE-IMMEDIATE-LOADING-STACKABLE-WORKFLOW.png", out: "fullarch-stackable-metal-model.webp", width: 1200, slot: "Full-arch" },
  { src: "05-surgical-guide/METAL-GUIDE-STACKABLE+HAND.png", out: "fullarch-prosthesis-in-hand.webp", width: 1200, slot: "Full-arch" },
  { src: "04-prosthetic-abutment/METAL-GUIDE-STACKABLE-WORKFLOW+PROSTHESIS+OCCLUSION.png", out: "fullarch-prosthesis-occlusion.webp", width: 1200, slot: "Full-arch / services" },
  // — Prosthetic / abutment / implant —
  { src: "04-prosthetic-abutment/GUIDE_TEETH_IMPLANT.png", out: "services-implant-abutment.webp", width: 1200, slot: "Services" },
  { src: "04-prosthetic-abutment/STRONG-TEMPORARY-PROSTHESIS.png", out: "services-temporary-prosthesis.webp", width: 1200, slot: "Services" },
  { src: "03-implant-planning/titanium implant-dental.png", out: "implant-titanium.webp", width: 1200, slot: "Services / CTA accent" },
  { src: "99-review-unsorted/Untitled design.png", out: "implant-titanium-gold.webp", width: 1200, slot: "Accent" },
  // — Printing / production (physical output; the only proof-of-production category) —
  { src: "02-stl-models/PRINTED-BONE-MODEL+ZYGOMA+GUIDE.png", out: "production-printed-bone-models.webp", width: 1200, slot: "Printing / About-trust" },
  { src: "05-surgical-guide/ZYGOMAUIDE+STABILISATION+PIN+VERIFICATION+ACCURACY+ON+HAND.png", out: "production-printed-zygoma-guides.webp", width: 1200, slot: "Printing / surgical guide" },
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
const rows = [];
for (const job of jobs) {
  const src = path.join(SRC, job.src);
  const out = path.join(OUT, job.out);
  await ensureDir(out);
  const info = await sharp(src)
    .rotate() // respect EXIF orientation, then drop metadata
    .trim({ threshold: 10 }) // tighten transparent padding to subject bounds
    .resize({ width: job.width, withoutEnlargement: true }) // never upscale
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 0.7 }) // light unsharp, no halo
    .webp({ quality: 90, alphaQuality: 100, effort: 5 })
    .toFile(out);
  rows.push({ source: path.basename(job.src), final: job.out, dims: `${info.width}x${info.height}`, kb: (info.size / 1024).toFixed(0), slot: job.slot });
  console.log(`✓ ${job.out.padEnd(36)} ${`${info.width}x${info.height}`.padEnd(11)} ${(info.size / 1024).toFixed(0).padStart(4)}KB  ← ${path.basename(job.src)}`);
  ok++;
}
console.log(`\nDone. ${ok}/${jobs.length} premium images written to ${OUT}/`);
console.log("\nJSON:\n" + JSON.stringify(rows, null, 2));
