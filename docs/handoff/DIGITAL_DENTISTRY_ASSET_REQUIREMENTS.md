# Image3DConversion — Digital Dentistry Asset Requirements

- **Prepared:** 2026-07-31
- **Purpose:** Define the approved visual resources the premium site needs (digital-dentistry imagery + brand/logo assets), with a safety rule and priority per slot, so production can be commissioned and gated correctly. **No asset here has been added to `public/`** — every row is a requirement, and the site currently ships approved images + clearly-labelled placeholders only.
- **Governance:** clinical imagery must be real, rendered, de-identified, consented where a person is visible, and EXIF-stripped. AI only for non-representational decoration. No patient data, no fake proof, no before/after, no competitor images. Publish gate: `NEXT_PHASE_IMAGE_BRIEF.md §4` (alt + PII-safe + license + consent + approval ≥ approved). Companion: `MASTER_IMAGE_ASSET_CHECKLIST.md`.
- **Status legend:** ✅ approved & shipping · 🟡 partial (a reused approved image stands in) · 🔴 missing (labelled placeholder or text-only today).

---

## 1. Current approved images → sections they support
The 10 shipping assets in `public/images/` (see `MASTER_IMAGE_ASSET_CHECKLIST.md §1`) and where they carry weight today:

| Approved asset | Currently supports |
|---|---|
| `logo` | Header (light surface only — see §3) |
| `planRestorative` | Home hero panel, About "why", Case Requirements, Services hero |
| `planFrontal` | Guided Implant, Home guide-deck, How It Works hero |
| `planAnterior` | Case Data Prep, Global Practices |
| `segmentation` | Zygoma & Pterygoid, Home workflow card, guide-deck |
| `stackable` | Full-Arch, Home complex band, About hero |
| `muaGuide` | Immediate-Loading |
| `printedGuideModel` | Design-to-Delivery, Home hero float, guide-deck |
| `printedGuideSleeves` | White-Label |
| `stlMesh` | Design-Only, Home hero chip |

**Reality:** planning renders + guide shots are covered; **most storytelling sections (five-steps, support, global, trust, portal questions, smile) have no dedicated visual** and reuse the same few renders. That thin density is the main reason premium visibility reads ~5/10.

---

## 2. Digital-dentistry visual requirements

| Page / section | Needed visual | Purpose | Accepted source type | Safety rule | Current status | Priority |
|---|---|---|---|---|---|---|
| Home hero / Guided | CBCT / DICOM implant planning view (de-identified) | Signal real planning depth | Rendered planning-software capture (viewport only) | De-ID review; no burned-in patient name/ID | 🟡 `planRestorative`/`planFrontal` reused | P0 |
| Case Data Prep | STL model workflow (DICOM→STL, mesh) | Show data-prep capability | 3D render / CAD mesh | Owned; no case ID | 🟡 `stlMesh`/`planAnterior` | P1 |
| Home "start with the smile" | Intraoral scan / dental arch model + **smile design from patient photo** | Aesthetic-first story | Photo + render **pair** | **Signed patient consent** + de-ID (hard blocker) | 🔴 labelled slot (P0-3) | P0 |
| Guided / Home | Implant planning (restoration-led) | Core service proof | Rendered viewport | De-ID | ✅ `planFrontal` | — |
| Immediate-Loading | Abutment / prosthetic (MUA, emergence) planning | Prosthetic coordination | 3D render | De-ID | 🟡 `muaGuide` | P1 |
| Guided / Design-Only | Surgical guide design (CAD) | Design capability | CAD/STL render | Owned | ✅ `stlMesh` | — |
| Full-Arch | Full-arch / stackable guide sequence | Complex-case authority | Rendered sequence | De-ID; no PII band | 🟡 `stackable` (single view) | P0 |
| Design-to-Delivery / About | Guide printing / nesting / production (printer, QA, packaging) | Production credibility | De-identified lab photo | Staff release if faces; no identifier screens | 🔴 labelled slot (P1-4) | P1 |
| Case Portal | Case-portal / planning dashboard mockups | Portal credibility | **Dummy-data** UI screens | No real names/case-IDs/thumbnails/CRM | 🟡 synthetic `PortalMock`/`DeviceFrame` (labelled) | P0 |
| Zygoma & Pterygoid | Anatomy + trajectory (extended FOV) | Advanced planning | Rendered viewport | De-ID | ✅ `segmentation` | — |
| About | Founder portrait | Founder credibility | Photo | Founder release; no aligner backdrop | 🔴 slot (P0-5) | P1 |
| Trust strip / Footer | Compatibility / partner logos | Ecosystem trust | Vector/PNG | **Written permission per partner** | 🔴 none (gated) | P2 |
| Global | Route/collaboration diagram (no flags/maps) | Cross-border story | SVG (brand) | Schematic, not a claim | 🔴 text-only | P2 |
| All / lists | Line-icon set (process/records) | Reduce text walls | SVG line icons `#2F4678` | Decorative | 🟡 partial (IconList inline) | P2 |
| Backgrounds | Abstract blue-white technical textures | Section richness | AI-allowed (non-representational) | No anatomy/people/logos/text | 🟡 blueprint utilities in code | P2 |

**Legend on source types:** "Rendered" = real planning software / CAD output; "Photo" = real photography; "AI-allowed" = only abstract/non-representational decoration. AI is **never** allowed for implants, guides, anatomy, CBCT, smiles, patients, hands, or anything implying a real case/product/outcome.

---

## 3. Brand / logo asset requirements (raised by founder)
The shipped `public/images/logos/i3dc-logo.webp` **appears to have a white background (not true alpha)**. It is currently used **only in the Header (white surface)** → safe today. It must **not** be placed on the new navy heroes / CTA bands / any dark surface. Dark surfaces use `ui/Wordmark` (typographic lockup) until proper assets exist.

| Asset | Needed | Purpose | Accepted source type | Safety rule | Status | Priority |
|---|---|---|---|---|---|---|
| Transparent PNG logo | Verified alpha (no white box) | Use on tinted/light surfaces cleanly | Owned brand file | Verify true transparency before ship | 🔴 required | P0 |
| SVG logo | Vector wordmark + mark | Crisp at any size; header/footer | Owned vector | Owned | 🔴 required | P0 |
| Inverse / white logo | Light-on-dark variant | Use on navy heroes / CTA / dark footer | Owned brand file | Only after approval; no recolor hacks | 🔴 required | P0 |
| Favicon / app icons | 16–512px set + `app/icon` | Browser tab / PWA / bookmarks | Derived from approved logo | **No favicon exists**; do not fabricate — derive from approved mark | 🔴 missing | P0 |

**Interim handling (in code now):** `ui/Wordmark` renders "Image**3D**Conversion" (display face, "3D" in brand accent) for dark/brand contexts — a text treatment, **not** a fake logo mark. The raster logo stays on light surfaces only. `src/content/image-meta.ts` carries a warning on the `logo` entry.

**Do not:** stretch, crop, recolor, or key-out the raster logo to fake transparency; add any new logo/favicon file to `public/` without founder approval; create a final logo.

---

## 4. What is safe to do now (no new assets)
- Use the 10 approved images confidently where they fit; everywhere else keep a **clearly-labelled** `ImageOrSlot` / "sample/illustrative" placeholder.
- Improve premium feel with **non-image** richness: navy gradient bands (`band-navy`), blueprint textures (`blueprint`, `blueprint-invert`), stronger cards/borders, device frames, controlled shadows, typography.
- Keep the synthetic Case Portal UI labelled "illustrative / Sample data".

## 5. Approval gates before any asset ships
Per-asset founder go-live + the publish gate (`NEXT_PHASE_IMAGE_BRIEF.md §4`): named owner, license/permission, de-ID confirmed, consent signed if a person is visible, PII-safe, approval ≥ approved. Partner logos require **written** permission. Patient smile requires **signed consent**. Logo variants + favicon require founder-supplied brand files.

---

*Requirements only. Nothing here is in `public/`. The premium pass proceeds with approved assets + labelled placeholders until these are produced and gated.*
