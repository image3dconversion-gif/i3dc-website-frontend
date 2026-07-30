# Image Asset Audit — Image3DConversion Website

- **Prepared for:** Sudeep Paul / Image3DConversion
- **Prepared by:** Frontend Architect (Claude Code)
- **Date:** 2026-07-29
- **Scope:** Raw images in `assets-source/` audited against the Website Strategy Blueprint v1.2, the Homepage Content & Design Psychology v1.2, and the Frontend Handoff Summary v1.0.
- **Status:** Pre-build audit. **No asset in `assets-source/` is web-ready as-is.** Every candidate must pass de-identification review, cropping/rotation, and WebP/AVIF optimisation before it moves to `public/images/`.

> **Update — 2026-07-29 (homepage high-fidelity build).** 10 approved, PII-free
> assets have been optimised (WebP, metadata stripped) into `public/images/` via
> `scripts/process-images.mjs` and are now live on the homepage. The PII-bearing
> renders, the education marketing screenshot, and the blue-lit dark guide are
> **excluded at the processing step** and never reach `public/`. See the
> "Images now in production" list at the end of this file.

> **How to read this document.** Section 1 is the headline decisions. Section 2 is the per-folder inventory with a per-file verdict. Section 3 is the patient-data (PII) register — the most important governance output. Section 4 maps assets to pages. Section 5 lists gaps to fill before Release 1. Section 6 lists the processing actions.

---

## 1. Headline findings (read first)

1. **Brand-blue correction.** The docs carry `#2E74B5` as a *provisional* token and explicitly say the real HEX must be sampled from the master logo before UI sign-off. I sampled `assets-source/08-logos-certificates/logo 1.png` (the master vector-style logo, 4253×1340, transparent). The dominant brand blue is **`#2F4678`** — a deep navy, materially different from the provisional azure `#2E74B5`. **The design system is being built on `#2F4678` (sampled), not `#2E74B5`.** This is still a *sampled* value from a raster export; confirm against the original vector asset before final sign-off.

2. **Confirmed patient PII in raw assets.** At least **two** full-arch renders contain a visible patient name burned into the image and **must not be published in any form** until masked/cropped:
   - `04-full-arch-stackable/Untitled design (3).png` — “**CT, Model Master: Nkuna Takalani Gloria**” + case-ID hash + capture date (top-left).
   - `04-full-arch-stackable/Screenshot 2026-03-31 174128.png` — “**MRS. …AGARWAL, 44YRS**” (top-left).
   This confirms the blueprint’s de-identification rule is not theoretical: planning-software full-view exports routinely burn in patient identifiers. **Every screenshot requires a manual PII sign-off**, not just these two.

3. **Off-journey / education content mixed into the pool.**
   - `04-full-arch-stackable/Screenshot 2026-04-30 102434.png` is a screenshot of an **education “Pro Master Class” marketing page** (Meet Your Coach / Apply). It uses **forbidden decorative accent colours (purple + gold/yellow)**, carries a gated “18+ years” claim, and contains typos (“Implantogy”). It belongs to the SurgiGuideExcellence education ecosystem, not the I3DC service site. **Do not use.**
   - The **“i3D Liner — The Clear Aligner”** sub-brand appears in the founder backdrop (`sudeep_paul.JPG`) and a workshop banner (`IMG_6367.JPG`). Clear aligners are explicitly *off the primary I3DC journey*. Founder/workshop photos are still usable, but crop or de-emphasise the aligner branding so the service site does not surface a product it has removed from the journey.

4. **No hero-ready master exists.** The homepage spec requires a hero master **≥ 2,400 px wide**, horizontal, showing one de-identified case (restoration + implant plan + guide). The widest clean planning asset today is ~1,466 px, and the best full-arch renders are the two PII-flagged files. **A compliant hero asset must be produced** (re-render a consented/de-identified case at high resolution) before the homepage hero can ship.

5. **Empty categories block several Release-1/2 pages.** `05-lab-production`, `07-case-portal-ui`, `09-background-textures`, and `10-do-not-use-patient-data` are empty. The **Case Portal public page has zero de-identified portal-UI mockups** — a hard blocker for that page’s hero and five-step visuals.

6. **Duplicates.** Three founder photos are duplicated across `01-founder-team` and `06-workshops-training` (`IMG_5524`, `IMG_7023`, `IMG_9144 (1)`). De-duplicate on import; keep one canonical copy per image.

7. **Doc discrepancies to resolve (noted, not silently “fixed”):** the Handoff Summary lists a different primary nav and “Inter” typography, while Blueprint v1.2 and Homepage v1.2 (the authoritative, latest versions) specify the nav `Solutions · How It Works · Case Workflows · For Partners · About` and typography **Bricolage Grotesque (display) + Lato (body)**. I am following the v1.2 documents. Flagging so the owner can confirm.

---

## 2. Per-folder inventory & verdicts

Legend — **Verdict:** ✅ usable after standard processing · ⚠️ usable only after a specific fix · ⛔ do not use / quarantine · ❓ not individually reviewed (assume review still required).

### 01-founder-team (5 files)

| File | Dimensions | Notes | Verdict |
|---|---|---|---|
| `sudeep_paul.JPG` | 6720×4480 (7.8 MB) | High-res professional portrait, suit, step-and-repeat backdrop. **Rotated 90° (sideways)** — needs rotation. Backdrop shows I3DC + “The Clear Aligner” text; crop tighter to subject. Lens flare top corner. Best founder portrait available. | ⚠️ rotate + crop |
| `IMG_1590.JPG` | 4032×3024 | Phone photo, 4:3. Founder/team candidate. | ❓ review |
| `IMG_5524.JPG` | 4032×3024 | **Duplicate** of `06-workshops-training/IMG_5524.JPG`. | ❓ de-dupe |
| `IMG_7023.JPG` | 4032×3024 | **Duplicate** of workshops copy. | ❓ de-dupe |
| `IMG_9144 (1).JPEG` | 4032×3024 | **Duplicate** of workshops copy. | ❓ de-dupe |

**Assessment:** These are phone snapshots, not a controlled portrait set. `sudeep_paul.JPG` is the only studio-grade image and needs rotation. Recommend a small dedicated founder shoot (neutral portrait + speaking/mentoring) for About-page credibility. Governance note: introduce Sudeep Paul as **Founder & CEO / Biomedical Application Expert — never prefixed “Dr.”**

### 02-3d-planning-screens (4 files)

| File | Dimensions | Notes | Verdict |
|---|---|---|---|
| `Screenshot 2026-01-27 194757.png` | 1071×771 | Clean CBCT + implant + prosthetic viewport (zygoma/pterygoid trajectory look). No PII visible. Dark viewport. | ✅ |
| `Screenshot 2026-01-27 194929.png` | 1147×790 | Clean CBCT/implant viewport. No PII visible. | ✅ |
| `Screenshot 2026-01-27 195008.png` | 1143×834 | Clean CBCT/implant viewport. No PII visible. | ✅ |
| `full arch.PNG` | 964×815 | Colour-segmented anatomy + implant trajectories (nice zygoma/full-arch planning view). No PII visible. Small. | ✅ (small) |

**Assessment:** Strong, on-brand planning views — exactly the “real planning screenshot” the docs ask for. All are viewport-only crops (no software chrome/patient panel), which is why they read clean. Resolution is modest (≤1,150 px) → good for cards/inline, **not** for a full-bleed hero. Confirm each is a consented case even though no identifier is on-screen.

### 03-surgical-guides (4 files)

| File | Dimensions | Notes | Verdict |
|---|---|---|---|
| `12.jpg` | 600×600 | Excellent printed resin guide on model, gloved hand. Clean product shot. Low-ish res. | ✅ (small) |
| `14.jpg` | 600×600 | Product shot (not individually opened). | ❓ review |
| `15.jpg` | 600×600 | Product shot (not individually opened). | ❓ review |
| `Screenshot 2026-04-25 113528.png` | 1027×739 | Clean STL/mesh of a guide, grey studio background. Good design-only visual. No PII. | ✅ |

**Assessment:** Good mix of physical guide photography + CAD/STL mesh. 600×600 squares suit card thumbnails but not heroes. Great fit for Design-Only and Guided pages.

### 04-full-arch-stackable (5 files) — **PII HOTSPOT**

| File | Dimensions | Notes | Verdict |
|---|---|---|---|
| `Untitled design (3).png` | 1466×781 | **Superb** colour-coded stackable sequence (pin/reduction/implant/MUA/prosthesis). **Burns in patient name “Nkuna Takalani Gloria” + ID + date.** | ⛔→⚠️ mask/crop then use |
| `Screenshot 2026-03-31 174128.png` | 893×637 | Full-arch guide render. **Burns in “MRS. …AGARWAL, 44YRS”.** | ⛔→⚠️ mask/crop then use |
| `Screenshot 2026-03-31 174150.png` | 868×534 | MUA/implant guide render. No PII visible. | ✅ |
| `Screenshot 2025-11-11 130558.png` | 875×724 | Clean stackable guide sequence (layered), black bg. No PII. | ✅ |
| `Screenshot 2026-04-30 102434.png` | 1282×811 | **Education marketing screenshot** (Pro Master Class). Forbidden purple/gold accents, gated “18+ years” claim, typos. | ⛔ do not use |

**Assessment:** This folder holds the most compelling full-arch visuals **and** the highest PII risk. The two burned-in-name renders are the best-looking assets in the whole pool — worth reprocessing (crop out the top-left text band or re-export the case anonymised) rather than discarding, provided the case is consented.

### 05-lab-production (0 files) — **EMPTY / GAP**

Needed for production-credibility strips (About, Design-to-Delivery, How It Works step 4). No images.

### 06-workshops-training (5 files)

| File | Dimensions | Notes | Verdict |
|---|---|---|---|
| `IMG_6367.JPG` | 4032×3024 | Sudeep Paul presenting to a seated audience of dentists w/ laptops. Good teaching-credibility photo. Shows “i3D Liner / Clear Aligner” banner (off-journey) and **identifiable attendee faces (consent needed)**. | ⚠️ consent + crop |
| `e8666bdc-…JPEG` | 1280×960 | Workshop candidate (not individually opened). | ❓ review |
| `IMG_5524.JPG` | 4032×3024 | Duplicate of founder copy. | ❓ de-dupe |
| `IMG_7023.JPG` | 4032×3024 | Duplicate of founder copy. | ❓ de-dupe |
| `IMG_9144 (1).JPEG` | 4032×3024 | Duplicate of founder copy. | ❓ de-dupe |

**Assessment:** Workshop imagery is **secondary** per governance — education must not compete with clinical case CTAs. Use only in About/trust contexts, never the homepage hero. Event photos with recognisable attendees need at least event-level consent; blur/loose-crop where identity is not required.

### 07-case-portal-ui (0 files) — **EMPTY / CRITICAL GAP**

The Case Portal public page needs de-identified portal mockups (dashboard, case list, status chips, five-step). None exist. **Blocker for that page.** These must be produced with **dummy data only** — no real patient names, case IDs, file URLs, or thumbnails.

### 08-logos-certificates (3 files)

| File | Dimensions | Notes | Verdict |
|---|---|---|---|
| `logo 1.png` | 4253×1340 (transparent) | **Master logo.** Deep-navy wordmark + 3D-cube mark on transparent bg. **Source of the sampled brand blue `#2F4678`.** Wide lockup (ratio 3.17). | ✅ primary logo |
| `logo 2.jpg` | 4253×1340 | Same lockup as JPG (white bg, no transparency). | ✅ fallback |
| `logo enhance copy (1).jpg` | 1080×1080 | Square 1:1 variant (icon/social/favicon candidate). Not individually opened. | ❓ review |

**Assessment:** Use `logo 1.png` (transparent) as the header/footer logo and the colour source of truth. Need to generate: SVG version, monochrome/reverse (white-on-blue) variant, and favicon/app icons from the square variant.

### 09-background-textures (0 files) — **EMPTY**

Not blocking — the brand is white-led with derived pale-blue tints; textures are optional and must stay subtle if introduced.

### 10-do-not-use-patient-data (0 files) — quarantine folder (empty)

**Action:** move the confirmed PII originals here (or a `_quarantine/` mirror) so they cannot be accidentally imported. See Section 3.

---

## 3. Patient-data (PII) register — governance-critical

The blueprint forbids publishing any patient identifier, and requires recording **de-identification review status** per asset. Result of this pass:

| Asset | PII found | Required action before ANY use |
|---|---|---|
| `04-…/Untitled design (3).png` | Patient name **“Nkuna Takalani Gloria”**, case-ID hash, capture date (top-left) | Confirm case consent → crop/mask identifier band → re-export → new de-id sign-off |
| `04-…/Screenshot 2026-03-31 174128.png` | Patient name **“MRS. …AGARWAL, 44YRS”** (top-left) | Same as above |
| `01-…/sudeep_paul.JPG` | No patient data (founder). Backdrop shows off-journey aligner sub-brand | Rotate + crop aligner text; not a PII issue |
| `06-…/IMG_6367.JPG` | Identifiable third-party attendees (not patients) | Event consent or crop/blur faces where identity is not needed |

**Reviewed and clean (no on-screen identifier):** `02-…/194757`, `02-…/194929`, `02-…/195008`, `02-…/full arch`, `03-…/12.jpg`, `03-…/113528`, `04-…/174150`, `04-…/130558`.

**Not individually opened — still require sign-off before use:** `01-…/IMG_1590`, all remaining phone duplicates, `03-…/14.jpg`, `03-…/15.jpg`, `06-…/e8666…`, `08-…/logo enhance copy (1)`.

**Rule going forward (enforce in the import step):** an asset moves into `public/images/` only after (a) named owner, (b) consent/permission status recorded, (c) de-identification confirmed, (d) review date logged. “Clean crop” ≠ “consented” — track both.

---

## 4. Asset → page mapping (best current fit)

| Page / section | Best available asset(s) | Status |
|---|---|---|
| **Homepage hero** | *None compliant.* Closest: `04-…/130558` (clean stackable) or a de-identified `Untitled design (3)` | ⛔ produce ≥2,400px de-id hero |
| Homepage “start with the smile” | Needs consented smile + tooth-setup pairing | ⛔ gap |
| Guided Implant card | `02-…/194757`, `02-…/195008` | ✅ |
| Full-Arch Stackable card / page | `04-…/130558`, `04-…/174150`; (`Untitled design (3)` after de-id) | ✅ / ⚠️ |
| Zygoma & Pterygoid | `02-…/194929`, `02-…/full arch` (segmented anatomy + trajectory) | ✅ |
| Immediate-Loading | Partial: `04-…/174150` (plan+guide). Needs provisional reference | ⚠️ partial |
| Design-Only Workflow | `03-…/113528` (STL mesh), `03-…/12.jpg` (printed guide) | ✅ |
| Design-to-Delivery / production | `05-lab-production` empty | ⛔ gap |
| Case Data & Diagnostic Prep | `02-…` viewports (segmentation/alignment) | ✅ |
| Case Portal (public page) | `07-case-portal-ui` empty | ⛔ blocker |
| About — founder | `sudeep_paul.JPG` (rotated/cropped) | ⚠️ |
| About / trust — teaching | `IMG_6367.JPG` (consent/crop) | ⚠️ |
| Global Practice Workflows | Concept visuals (route/collaboration) not present | ⛔ gap |
| White-Label Partnership | Partner logos (permission-gated) not present | ⛔ gap |
| Header/footer logo | `logo 1.png` (transparent) | ✅ |

**Build approach:** ship the frontend with labelled **placeholder image slots** (correct aspect ratios + alt-text direction from the homepage shot list) so pages are complete and crawlable while approved photography is produced. No placeholder should imply a real clinical outcome.

---

## 5. Gaps to fill before Release 1

1. **Hero master** — one de-identified, consented case at ≥2,400px wide (restoration + implant plan + guide), horizontal, mobile-safe centre crop.
2. **Case Portal UI mockups** — dashboard, case list, status chips, five-step, dummy data only.
3. **De-identified full-arch case sequence** — the five-stage sequence (pin → reduction → implant → MUA → pickup) from one consented case (reprocess the PII renders or re-export).
4. **Founder portrait set** — neutral studio portrait + one speaking/mentoring shot, no off-journey aligner branding.
5. **Production/lab credibility** — 2–3 clean shots for `05-lab-production`.
6. **Partner logos** — only with current written permission (BlueSkyPlan, AB, Prevest, etc.).
7. **Logo derivatives** — SVG, reverse/mono, favicon/app-icon set.

---

## 6. Processing checklist (per approved asset)

- [ ] Confirm consent + de-identification; log owner and review date.
- [ ] Fix orientation (esp. `sudeep_paul.JPG`, 90°) and crop off-journey/identifier bands.
- [ ] Normalise aspect ratios: hero ≥2,400px wide; **case cards 4:3 or 16:10 (consistent set)**; keep critical anatomy/labels inside the mobile-safe centre.
- [ ] Export responsive **AVIF/WebP + fallback**, with explicit width/height to protect CLS.
- [ ] Descriptive, factual filename + alt text matching the *final* image (see homepage shot list §7); no keyword stuffing; decorative shapes use empty alt.
- [ ] Place only optimised, approved files in `public/images/<category>/`; keep raws in `assets-source/`; move PII originals to `10-do-not-use-patient-data/`.

---

## 7. Brand-blue token (sampled)

| Token | Value | Source | Note |
|---|---|---|---|
| Master blue (sampled) | **`#2F4678`** | `logo 1.png` dominant pixel cluster | Replaces provisional `#2E74B5`. **Confirm against original vector before final sign-off.** |
| Provisional (docs) | `#2E74B5` | Blueprint v1.2 | Wireframe-only; **not** the production colour. |

The derived tint/shade scale, deep-ink body value, and functional (portal-only) status colours are implemented in `src/styles/tokens.css` / `src/app/globals.css`, all derived from the single master blue per the two-colour rule (white leads; no decorative third accent).

---

---

## 8. Images now in production (as of 2026-07-29)

Processed by `scripts/process-images.mjs` → `public/images/`. All are
de-identified viewports / product shots with **no** patient name, age, clinic,
DICOM/case ID or visible patient identity, and EXIF stripped on export.

| File in `public/images/` | Source (approved) | Used on homepage |
|---|---|---|
| `logos/i3dc-logo.webp` | 08 `logo 1.png` | Header logo |
| `planning/implant-plan-restorative.webp` | 02 `…195008.png` | Hero main panel |
| `planning/implant-plan-frontal.webp` | 02 `…194757.png` | Guided card; layered deck |
| `planning/full-arch-segmentation.webp` | 02 `full arch.PNG` | Zygoma & Pterygoid card; deck |
| `planning/implant-plan-anterior.webp` | 02 `…194929.png` | (manifest; reserve) |
| `full-arch/stackable-sequence.webp` | 04 `…130558.png` | Full-Arch card; complex-case band |
| `full-arch/mua-guide.webp` | 04 `…174150.png` | Immediate-Loading card |
| `guides/printed-guide-model.webp` | 03 `12.jpg` | Hero floating product card; deck |
| `guides/printed-guide-sleeves.webp` | 03 `14.jpg` | (manifest; reserve) |
| `guides/guide-stl-mesh.webp` | 03 `…113528.png` | Hero CAD chip |

**Explicitly NOT processed / NOT in `public/`:** `04 Untitled design (3).png`
and `04 …174128.png` (burned-in patient names), `04 …102434.png` (education
marketing, forbidden accents), `03 15.jpg` (blue-lit/dark), `sudeep_paul.JPG`
and all raw phone photos.

---

*End of audit. This file lives at `docs/handoff/IMAGE_ASSET_AUDIT.md` and should be updated as assets are de-identified, produced, and approved.*
