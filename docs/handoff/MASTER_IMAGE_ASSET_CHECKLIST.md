# Image3DConversion — Master Image Asset Checklist

- **Status:** 🟢 Active production checklist for image producers (photographer / 3D / UI designer).
- **Purpose:** One place that lists (a) the **10 approved assets** now in `public/images/` and their primary home, and (b) every **missing slot** with an exact spec, so pages self-document what they need and nothing unapproved or PII-bearing ships.
- **Governance:** an asset moves into `public/images/<category>/` only after the publish gate in `NEXT_PHASE_IMAGE_BRIEF.md §4` passes: named owner · consent/permission recorded · de-identification confirmed · license valid · review date logged · factual alt present. "Clean crop" ≠ "consented" — track both.
- **Sources:** `IMAGE_ASSET_AUDIT.md` (verdicts + PII register), `NEXT_PHASE_IMAGE_BRIEF.md` (P0/P1/P2 + schema), `FULL_SITE_PREMIUM_UI_IMAGE_STRATEGY.md` (distribution).

---

## 1. Approved & shipping (10) — the current pool

| Manifest key (`images.ts`) | File | Dims | Primary home (avoid over-reuse) | Also used |
|---|---|---|---|---|
| `logo` | `logos/i3dc-logo.webp` | 1000×250 | Header / footer wordmark | — |
| `planFrontal` | `planning/implant-plan-frontal.webp` | 1071×771 | Guided Implant workflow | Home card, guide deck |
| `planAnterior` | `planning/implant-plan-anterior.webp` | 1147×790 | Case Data Preparation | Global Practices |
| `planRestorative` | `planning/implant-plan-restorative.webp` | 1143×834 | Home hero in-window | Case Requirements |
| `segmentation` | `planning/full-arch-segmentation.webp` | 964×815 | Zygoma & Pterygoid | Home card, guide deck |
| `stackable` | `full-arch/stackable-sequence.webp` | 875×724 | Full-Arch Stackable | Home card, complex band |
| `muaGuide` | `full-arch/mua-guide.webp` | 868×534 | Immediate-Loading | Home card |
| `printedGuideModel` | `guides/printed-guide-model.webp` | 600×600 | Design-to-Delivery | Home hero float, deck |
| `printedGuideSleeves` | `guides/printed-guide-sleeves.webp` | 600×600 | White-Label Partnership | reserve |
| `stlMesh` | `guides/guide-stl-mesh.webp` | 1027×739 | Design-Only workflow | Home hero chip |

**Distribution rule:** each asset has ONE primary home so the same render does not read as "reused everywhere." Secondary uses are deliberate, not accidental. Low-res assets (≤1,150px, 600×600) are **card/inline only — never full-bleed hero**.

**Empty, ready category folders (with `.gitkeep`):** `cases/ founder/ global-practice/ office-lab/ partners/ portal/ workshops/` — these are the drop-targets for the slots below.

---

## 2. Missing slots — exact specs (produce offline, gate before ship)

Priority mirrors `NEXT_PHASE_IMAGE_BRIEF.md`. Each row is a real slot a page renders today as a labelled placeholder.

### P0 — blocks premium & launch quality
| ID | Slot | Spec | Consent / license | Ship as until approved |
|---|---|---|---|---|
| P0-1 | Home hero in-window master | 3D render, ≥2,400px wide, ~16:11, brand-graded, mobile-safe centre crop, de-identified | de-id review (case consent if new case) | current `planRestorative` (accepted) |
| P0-2 | Case Portal UI screens ×3–4 | Dashboard, case list, status chips, upload area; **dummy data only**, no real names/case-IDs/thumbnails | de-id (no real case) | compliant CSS `PortalMock` / `DeviceFrame` |
| P0-3 | "Start with the smile" pair | Consented patient smile photo + tooth-setup render, graded, de-identified | **signed patient consent** (hard blocker) | labelled slot |
| P0-4 | Full-arch transparent cut-out | Re-graded stackable render, background removed, halo-free WebP-alpha (~2,000px) + optional shadow layer | de-id (transform of approved → no new consent) | current `stackable` in-band |
| P0-5 | Founder portrait | Neutral studio + one speaking shot; **no "i3D Liner / Clear Aligner" backdrop**; upright orientation | founder release | labelled slot |

### P1 — de-duplication & product feel
| ID | Slot | Spec | Consent | 
|---|---|---|---|
| P1-1 | Isolated implant + abutment | 3–5 transparent renders | owned |
| P1-2 | Guided drill kit / tray | 3–4 photos, white→transparent | owned |
| P1-3 | Per-workflow planning views | 5–6 renders (zygoma trajectory, immediate provisional, MUA, design-only STL) — one unique hero per workflow page | de-id |
| P1-4 | Lab / production | 4–6 de-identified photos (printer, QA bench, packaging) | staff release if faces |
| P1-5 | Partner / compatibility logos | vector/PNG, as available | **written permission per partner** |

### P2 — polish
| ID | Slot | Spec |
|---|---|---|
| P2-1 | Workflow diagrams | 2–3 SVG (process, stackable sequence), brand blue, transparent |
| P2-2 | Icon set | ~20 line icons, `#2F4678`, 1.5px, SVG — feeds `IconList` |
| P2-3 | Background textures | 2–3 very-low-contrast blue-white SVG/PNG |

---

## 3. Transparent-asset requirements (P0-4, P1-1, P1-2)
- WebP-with-alpha primary + PNG-24 fallback (optional); SVG for logos/icons/diagrams.
- Clean anti-aliased alpha; **no white/black halo**, no background fringe; premultiplied alpha off; sRGB.
- Object delivered **without** shadow + an optional separate soft-shadow layer (frontend places shadow per context).
- ~2,000px long edge master; trimmed to content with a documented consistent transparent margin (or zero-trim + focal metadata).
- Naming: `category/key--cutout@2000.webp` (e.g. `full-arch/stackable--cutout@2000.webp`).

---

## 4. Per-asset governance record (fill one per produced asset)
Mirror of the `NEXT_PHASE_IMAGE_BRIEF.md §4` schema — attach to each delivery:

```
key:            full-arch/stackable--cutout
title:          Full-arch stackable cut-out
category:       guide            # planning|guide|implant|smile|lab|portal-ui|logo|partner|texture|icon
dimensions:     { w: 2000, h: 1500, aspect: "4/3" }
focalPoint:     { x: 0.5, y: 0.5 }   # mobile-safe crop centre
backgroundType: transparent      # opaque|transparent|needs-cutout
alt:            "..."            # REQUIRED — blocks publish if empty
caption:        "..."
source/credit/captureDate:  ...
license/usageRights/expiry: ...  # must be valid
consentStatus/consentRef:   ...  # signed if a person/patient is visible
piiSafe/piiReviewer/piiDate: true / ... / ...   # must be true
approvalStatus: draft→in-review→approved→published→retired   # must be ≥approved to ship
usageMap:       [ pages/slots consuming it ]
```

**Publish rule (enforced):** `published` only when `alt` present AND `license` valid AND `piiSafe=true` AND (`consentStatus=signed` if a person/patient visible) AND `approvalStatus ≥ approved`. Expressed in code as `src/content/image-meta.ts`.

---

## 5. Do-not-use register (quarantine — never process)
From `IMAGE_ASSET_AUDIT.md §3`:
- `04-full-arch-stackable/Untitled design (3).png` — burned-in patient name "Nkuna Takalani Gloria" + case-ID.
- `04-full-arch-stackable/Screenshot 2026-03-31 174128.png` — burned-in "MRS. …AGARWAL, 44YRS".
- `04-full-arch-stackable/Screenshot 2026-04-30 102434.png` — education marketing (purple/gold, gated claim, typos).
- `03-surgical-guides/15.jpg` — blue-lit/dark guide (off-palette).
- `sudeep_paul.JPG` + all raw phone photos — not web-ready as-is (rotation/crop/consent).

The two burned-in-name renders are the best-looking full-arch assets — **reprocess only** (crop/mask identifier band or re-export anonymised) **if the case is consented**, then run the full gate. Otherwise they stay quarantined.

---

## 6. Ready-to-ship checklist (per asset, before it enters `public/`)
- [ ] Consent/permission recorded; de-identification confirmed; owner + review date logged.
- [ ] Orientation fixed; off-journey/identifier bands cropped.
- [ ] Aspect normalised (hero ≥2,400px; cards 16:10 or 4:3 consistent); key detail in mobile-safe centre.
- [ ] Optimised WebP (+ AVIF via `next/image`); **EXIF stripped**; explicit width/height for CLS.
- [ ] Factual filename + alt matching the final image; decorative → empty alt.
- [ ] Added to `src/content/images.ts` (real dims) + governance record in `src/content/image-meta.ts`.
- [ ] Page swaps its `ImageOrSlot`/placeholder for the real asset with the SAME alt.
- [ ] Founder per-asset go-live approval obtained.

---

*Master checklist for producers. Update as assets are produced, gated, and shipped. No asset ships without the §6 checklist complete and founder per-asset approval.*
