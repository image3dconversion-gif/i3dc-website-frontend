# Image3DConversion — Next-Phase Image Preparation Brief

- **Status:** ✅ Approved next-phase image preparation brief
- **Date:** 2026-07-29
- **Scope:** Preparation only. This document does **not** change the accepted public website frontend baseline.
- **Standing boundaries:** No frontend edits · no images added to `public/` · no CMS build · no deployment · no fake proof/testimonials · no patient data/PII. Clinical imagery is always real, approved and de-identified. Brand stays white-led with one master blue `#2F4678` (no purple/gold/dark-flashy, no stock dentist photos).

Related references: `FRONTEND_HANDOFF_SUMMARY.md` (accepted baseline), `IMAGE_ASSET_AUDIT.md` (current 10 approved assets + PII register).

---

## 1. Asset acquisition checklist (P0 / P1 / P2)

### P0 — blocks premium & launch quality

| # | Asset | Qty | Type | Consent / license | Target slot |
|---|---|---|---|---|---|
| P0-1 | De-identified hero master (implant plan + guide, one case) | 1 | 3D render | de-id review | Home hero |
| P0-2 | Case Portal UI, **dummy data only** (dashboard, case list, statuses, upload area) | 3–4 | Screenshot | de-id review (no real case) | Case Portal page |
| P0-3 | Consented patient smile + tooth-setup pairing | 1 set | Photo + render | **signed patient consent** | Home "start with the smile", Immediate-Loading |
| P0-4 | Full-arch case re-graded to brand palette, as transparent cut-out | 1 | 3D render | de-id review | Home complex band, Full-Arch |
| P0-5 | Founder portrait reshoot (neutral, no aligner backdrop, correct orientation) | 1–2 | Photo | founder release | About |

### P1 — de-duplication & product feel

| # | Asset | Qty | Type | Consent / license | Target |
|---|---|---|---|---|---|
| P1-1 | Isolated implant + abutment | 3–5 | 3D render (transparent) | owned | Home accent, Guided |
| P1-2 | Guided drill kit / kit tray | 3–4 | Photo (white→transparent) | owned | Guided, Full-Arch, Case Requirements |
| P1-3 | Per-workflow planning views (zygoma trajectory, immediate provisional, MUA, design-only STL) | 5–6 | 3D render | de-id review | each workflow hero |
| P1-4 | Lab / production, de-identified (printer, QA bench, packaging) | 4–6 | Photo | staff release if faces | About, Design-to-Delivery, How It Works |
| P1-5 | Partner logos | as available | Vector/PNG | **written permission** | credibility strip, footer |

### P2 — polish

| # | Asset | Qty | Type | Notes |
|---|---|---|---|---|
| P2-1 | Workflow diagrams (process, stackable sequence) | 2–3 | SVG | brand blue, transparent |
| P2-2 | Icon set (process/list) | ~20 | SVG | line icons, `#2F4678` |
| P2-3 | Subtle background textures | 2–3 | SVG/PNG | very low contrast, blue-white |

Every acquired asset arrives with: source/owner, capture date, license/usage rights, and (for anyone visible) signed consent + de-identification review.

---

## 2. Exact briefs by discipline

### A. Photographer (products, lab, founder/team)
- **Background:** clean light-grey/white seamless; even, no clutter (enables cut-outs).
- **Lighting:** soft single key + fill; gentle gradient shadow; **no colored gels, no dark/dramatic mood.**
- **Angles per product:** 3/4 hero, straight-on, macro detail of sleeves/threads.
- **Resolution:** ≥ 24 MP, tack-sharp, sRGB, RAW + high-quality export.
- **Founder/team:** neutral expression, business attire, plain or softly-blurred neutral background; **no "i3D Liner / Clear Aligner" backdrop**; correct upright orientation.
- **Lab:** real work surfaces — printer, model, QA — **no patient names, records, identifier-bearing screens, or faces without release.**
- **Do NOT:** stock-style clinic/dental-chair shots, gloved-hands clichés as the hero, gold/purple accents, heavy filters.

### B. 3D / render designer (planning renders + cut-outs + grading)
- **Palette:** grade toward brand blue-grey-tan; **reduce vivid magenta/pink** so nothing reads as "purple."
- **Formats:** deliver opaque master **and** transparent version (see §3).
- **Composition:** keep critical anatomy/labels within a **mobile-safe centre crop**.
- **Resolution:** hero ≥ 2,400px wide; card masters ~1,600px; cut-outs ~2,000px long edge.
- **Never:** invent a false "case," merge unrelated screenshots into one story, or bake in text.

### C. AI image generation — tightly limited
- **Allowed ONLY for non-representational decoration:** abstract blue-white technical textures, subtle grid/mesh backgrounds, icon base shapes.
- **Forbidden (hard rule):** any AI implant, guide, anatomy, CBCT, smile, patient, hand, or "case." AI must **never** represent a real clinical case, guide, product, or outcome.
- **Prompt constraints:** blue/white, flat/technical, no people, no dental anatomy, no logos, no text; deliver SVG or high-res PNG, transparent where decorative.

---

## 3. Transparent-background asset requirements
- **Format:** WebP-with-alpha (primary) + PNG-24 fallback; SVG for logos/icons/diagrams.
- **Edges:** clean anti-aliased alpha, no white/black halo, no background fringe.
- **Shadow:** deliver the object **without** shadow, plus an **optional separate soft-shadow layer** (frontend places shadow per context).
- **Padding:** trimmed to content with a documented, consistent transparent margin (or zero-trim + focal metadata).
- **Colour:** sRGB, premultiplied alpha off.
- **Sizes:** ~2,000px long edge master; pipeline derives responsive widths.
- **Naming:** `category/key--cutout@2000.webp` (e.g. `full-arch/stackable--cutout@2000.webp`).
- **Delivery:** master + transparent variant + (if a person is shown) consent reference.

---

## 4. CMS image governance schema

| Field | Type | Required | Publish gate |
|---|---|---|---|
| `key` | slug (stable, code-facing) | ✓ | — |
| `title` | text | ✓ | — |
| `category` | enum: planning/guide/implant/smile/lab/portal-ui/logo/partner/texture/icon | ✓ | — |
| `variants[]` | {role: source/web/transparent/blur, width, format, path} | ✓ (≥ web) | — |
| `dimensions` | {w,h,aspect} | ✓ | — |
| `focalPoint` | {x,y} (mobile-safe crop) | ✓ | — |
| `backgroundType` | enum: opaque/transparent/needs-cutout | ✓ | — |
| `alt` | text (factual, matches image) | ✓ | **blocks publish if empty** |
| `caption` | text | — | — |
| `source` / `credit` / `captureDate` | text / date | ✓ | — |
| `license` / `usageRights` / `expiry` | enum + date | ✓ | **must be valid** |
| `consentStatus` / `consentRef` | enum + doc ref | ✓ if person/patient visible | **must be signed** |
| `piiSafe` / `piiReviewer` / `piiDate` | bool + who + when | ✓ | **must be true** |
| `approvalStatus` | draft→in-review→approved→published→retired | ✓ | **must be ≥ approved** |
| `approvals[]` | technical / clinical / claim / founder sign-offs | as applicable | per blueprint |
| `usageMap[]` | pages/slots consuming it | ✓ | — |
| `version[]` | history | auto | — |

**Publish rule (enforced):** `published` is only reachable when `alt` present **AND** `license` valid **AND** `piiSafe=true` **AND** (`consentStatus=signed` if a person/patient is visible) **AND** `approvalStatus ≥ approved`. This is the `IMAGE_ASSET_AUDIT.md §6` checklist expressed as a state machine.

**Pipeline note:** CMS stores master + metadata; an extended build step (based on the existing sharp `scripts/process-images.mjs`: resize, AVIF/WebP, **strip EXIF**, generate transparent + blur variants) emits the same `src/content/images.ts` manifest shape the frontend already consumes — so the frontend contract does not change.

---

## 5. Page-wise image replacement priority

| Page · slot | Current | Priority | Replace with |
|---|---|---|---|
| Home · hero | CBCT panel (~1,140px) | **P0** | ≥2,400px hero master + coming-out-of-screen cut-out |
| Home · "start with the smile" | text only | **P0** | consented smile + setup pair |
| Case Portal · illustration | CSS dummy mock | **P0** | de-identified portal UI screenshots |
| About · hero / founder | reused render / none | **P0** | founder reshoot + lab/team photo |
| Home/About/Full-Arch · shared render | magenta stackable (reused 3×) | **P0** | re-graded transparent cut-out |
| Workflow ×10 · heroes | small reused pool | **P1** | unique per-workflow view |
| Workflow ×N · detail cards | text only | **P1** | kit/implant/product accents + icons |
| How It Works · stages | numbers only | **P1** | workflow SVG diagram + thumbnails |
| Footer / credibility | none | **P1** | partner logos (permission) |
| All · list/step icons | none | **P2** | SVG icon set |

---

## 6. Founder approvals required before implementation
1. **Patient smile consent** (signed) — nothing patient-facing without it.
2. **Founder portrait** selection/release.
3. **Partner logo permissions** (written) per partner.
4. **License/usage rights** for any commissioned or licensed asset.
5. **CMS selection** and any hosted-CMS connection (external service).
6. **Claim/positioning** stays as accepted (no new numbers, addresses, or location emphasis).
7. **Per-asset go-live** on the accepted baseline.

---

## 7. What can be prepared now — without touching the accepted baseline
- Produce/commission all **P0–P2 assets** (shoots, renders, cut-outs, grading) **offline**.
- Collect **consent, license, and permission paperwork**; build the metadata sheet using the §4 schema.
- Finalize **naming conventions, folder structure, and focal-point notes**.
- Draft the **pipeline extension** (transparent + blur variants) as an **offline spec** — not merged; frontend `images.ts` contract unchanged.
- Assemble the **CMS asset model** doc + governance workflow for review.
- Everything stages in `assets-source/` and paperwork — **nothing enters `public/` or the frontend** until per-asset approval.

---

*End of brief. This document is preparation guidance only and does not modify the accepted frontend baseline.*
