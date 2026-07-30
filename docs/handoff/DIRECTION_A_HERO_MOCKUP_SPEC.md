# Direction A — Homepage Hero Mockup Spec ("Planning Surface")

- **Status:** ✅ Hi-fi hero mockup **visually accepted as a design concept** (2026-07-29)
- **Scope:** Documentation + implementation notes only. Does **not** modify the accepted v0.2 frontend baseline.
- **Standing boundaries:** no frontend/`src`/`public` edits · no images added · no CMS · no deployment · no fake proof · no patient data/PII · no fake CBCT/DICOM/STL · white-led with master blue `#2F4678` (no purple/gold/dark-heavy, no stock dentist photos).
- **References:** `PREMIUM_DESIGN_DIRECTION.md` (Direction A), `NEXT_PHASE_IMAGE_BRIEF.md` (P0 assets). Design artifact: hi-fi hero mockup (private). Mockup screenshots: `docs/handoff/screenshots/mockups/`.

---

## 1. Hero concept summary
A premium, white-led clinical-tech hero built on the "Planning Surface" idea: copy leads on the left (~44%); on the right (~56%) an **app-window planning surface** sits on a **blueprint field** with corner brackets, and a **transparent guide/arch cut-out breaks the bottom-right frame** — the signature "coming out of screen" depth moment. It signals *digital workflow infrastructure*, not a brochure. Copy states the outcome and clinician-approval; the visual proves the workflow.

## 2. Visual hierarchy
1. **Eyebrow** — pulsing dot + uppercase "Digital implant planning & surgical guide services".
2. **H1 (dominant)** — "Plan the outcome. Guide the execution." Tight grotesque, navy, second line in brand blue; `clamp(40–68px)`, `line-height ~1.03`, balanced.
3. **Short supporting copy** — two crisp sentences (smile-led + clinician approval), ~34ch measure.
4. **Two CTAs** — solid navy *Start a Case* + outline *Discuss a Complex Case*; below them the *Open the Case Portal* utility link and a quiet professional note.
5. **Planning surface (right)** — app-window ("Restoration-led implant plan") + case-setup side panel + floating "Approval" card + the transparent cut-out with a "produced from the plan" capsule.

## 3. Desktop layout notes
- Grid split **44 / 56**; ~74–88px vertical padding; 1,240px max container.
- App-window uses the lift shadow; **blueprint grid masked** with a radial fade so it reads as atmosphere, not a hard texture.
- **Corner brackets** (top-left / bottom-right) frame the surface; **cut-out floats** (~7s) with a soft drop shadow.
- Floating "Approval" card overlaps the top-left window edge for depth.

## 4. Mobile layout notes
- Copy + **primary CTA first**; planning surface stacks **below**, full-width.
- Side panel wraps from a right column to a **row**; cut-out **shrinks** and the floating card re-anchors — **no negative-offset overflow**; exactly **one H1**.
- Recommended: sticky bottom action (Start a Case + small Portal link) after the hero on the live page (the live site's `MobileNav` hamburger is unchanged).

## 5. Light / dark theme notes
- **Light is the production default** — white-led premium; this is the brand expression.
- **Dark is the viewer-toggle/OS variant only** (`prefers-color-scheme` + `data-theme`): a restrained deep-navy ground (not pure black, not "dark-heavy") with the arch/accents shifted to light-blue so contrast and the accent keep working. Provided for accessibility/theme-toggle completeness — it does not change the white-led production intent.

## 6. Exact asset slots
| Slot | Asset | Purpose |
|---|---|---|
| **In-window planning render** | **P0-1** — ≥2,400px de-identified hero render | Replaces the schematic viewport inside the app-window |
| **Frame-breaking cut-out** | **P0-4** — re-graded full-arch **transparent** WebP/PNG + **separate soft-shadow layer** | The "coming out of screen" object overlapping the frame |
| Logo | owned (present) | Header wordmark |

Both slots must keep critical detail within a **mobile-safe centre crop**; cut-out edges must be **halo-free** with premultiplied alpha off.

## 7. Current schematic SVG disclaimer
The mockup's arch/guide is a **schematic, clearly-illustrative SVG** (line-art sleeves + trajectories) — **not a patient case, CBCT/DICOM/STL, or clinical data.** The mockup carries an on-page disclaimer to that effect. It is a stand-in for validation only and is **replaced in production** by the approved de-identified render (P0-1 / P0-4). No schematic implying real measurements or a real case ships.

## 8. What current approved assets can support
- **P0-4 cut-out is a transform of the already-approved stackable full-arch render** → **no new consent** needed; re-grade (mute magenta) + background removal + shadow layer.
- The in-window render can **initially** use existing approved planning captures (upscaled/graded) so a first build needs **no new patient consent**.
- Logo is owned and in place.

## 9. What P0 assets are still required
- **P0-1** — high-res (≥2,400px) de-identified hero master for maximum crispness.
- **P0-4** — properly produced **transparent cut-out + shadow layer** with clean edges.
- (Both feed the existing sharp pipeline for AVIF/WebP + EXIF-strip; frontend `images.ts` contract unchanged.)

## 10. Implementation risks
- **Composition:** in the mockup the cut-out slightly overlaps the side-panel rows — during build, nudge it to emerge more from the bottom edge to keep the right side uncluttered.
- **Edges:** real cut-out must be halo-free; transparent WebP + PNG fallback.
- **Crop safety:** keep key detail centre for mobile.
- **Fonts:** mockup used a system grotesque stand-in; production keeps **Bricolage Grotesque + Lato** (already loaded via `next/font`).
- **Motion:** honor `prefers-reduced-motion` (float/pulse off) — already specified.
- **Resolution risk:** current planning captures are ~1,000–1,150px; without P0-1, the hero should stay at moderate size until the high-res master lands.

## 11. Founder approval gates before code implementation
1. **P0-1 / P0-4 sign-off** — de-identification review (and case consent if a *new* case is used for P0-1).
2. **License/usage rights** for any commissioned render.
3. **Consented smile (P0-3)** — only if extending toward Direction B later (not needed for this hero).
4. **Per-asset & hero go-live** onto the accepted baseline, and any move of files into `public/`.
5. Confirmation that **copy/claims stay as accepted** (no new numbers, address, or location emphasis).

---

*Documentation only. The accepted frontend baseline is unchanged; the hero is validated as a design concept and awaits asset production + founder go-live approval before any code implementation.*
