# Image3DConversion — New-Session Handoff

- **Prepared:** 2026-07-31
- **Purpose:** Hand the Image3DConversion website design work to a new session with full context.
- **Standing rule for the new session:** the public website frontend is an **accepted, frozen baseline**. Do **not** edit the frontend, `src/`, `public/`, add images, start CMS, or deploy unless the founder gives an explicit new instruction. Design/planning work continues in `docs/handoff/` only.

---

## 0. FIRST — directory access audit (run before any work)
The new session must confirm it can access the correct project directory **before** doing any design or code work.

```bash
# 1) Confirm the directory exists and is the project root
ls -la "E:/image3dconversion_wesbite/i3dc-website-frontend"
# 2) Confirm the expected structure is present
ls "E:/image3dconversion_wesbite/i3dc-website-frontend"/{package.json,src,public,docs}
# 3) Confirm the handoff docs are readable
ls "E:/image3dconversion_wesbite/i3dc-website-frontend/docs/handoff"
```
If any of these fail, **stop and report** — do not attempt design/code work against a wrong or inaccessible path.

## 1. Correct project directory path
```
E:\image3dconversion_wesbite\i3dc-website-frontend
```
(POSIX/Bash tool: `/e/image3dconversion_wesbite/i3dc-website-frontend`.) Windows 11 · PowerShell primary shell · Bash tool available. **Not a git repo** (take file backups before any edit).

## 2. Current accepted frontend baseline status
**Accepted & frozen** — public website frontend is complete through: visual v0.2 → full-site consistency pass → trust-density pass. Stack: **Next.js 15 (App Router) + TypeScript + Tailwind v4**, dev **port 3001**. Design system: white-led, one master blue **`#2F4678`**, Bricolage Grotesque + Lato. `node_modules` present.

## 3. Current route / page count
- **21 route folders** (`page.tsx`) → build prerenders **26 static routes** (incl. `/robots.txt`, `/sitemap.xml`, `/_not-found`).
- **18 full content pages** + `/privacy` & `/terms` (intentional legal placeholders) + `/design-system` (noindex).
- Public routes: `/ · /about · /case-data-preparation · /case-evidence · /case-portal · /case-requirements · /design-only-workflow · /design-to-delivery · /digital-implant-workflows · /discuss-a-case · /faq · /full-arch-stackable-workflow · /global-practices · /guided-implant-workflow · /how-it-works · /immediate-loading-workflow · /white-label-workflow-partner · /zygoma-pterygoid-planning · /privacy · /terms` (+ `/design-system`).

## 4. Current approved public image count
**10** approved, PII-free, EXIF-stripped WebP in `public/images/` (logo; 4 planning renders; 2 full-arch renders; 2 guide product; 1 CAD mesh). Manifest: `src/content/images.ts`.

## 5. Important documents in `docs/handoff/`
| Doc | What it is |
|---|---|
| `FRONTEND_HANDOFF_SUMMARY.md` | Accepted frontend baseline + build/quality + launch checklist |
| `IMAGE_ASSET_AUDIT.md` | Audit of raw assets, PII register, the 10 shipped images |
| `NEXT_PHASE_IMAGE_BRIEF.md` | Approved next-phase image prep brief (P0/P1/P2, governance schema) |
| `PREMIUM_DESIGN_DIRECTION.md` | Accepted premium visual direction + 3 homepage directions |
| `DIRECTION_A_HERO_MOCKUP_SPEC.md` | Accepted Direction A hero concept + notes |
| `DIRECTION_A_HERO_IMPLEMENTATION_SPEC.md` | **Turnkey** hero implementation spec + implementation prompt |
| `NEW_SESSION_HANDOFF.md` | This file |
| `I3DC_Website_Claude_Code_Frontend_Handoff_Summary_v1.0.md` | Original founder handoff |
| `source-documents/` | Original DOCX/MD content pack |
| `screenshots/final`, `/trust`, `/mockups` | Verified screenshots (site + trust pass + hero mockups) |

## 6. Accepted design decisions so far
- Brand blue **`#2F4678`** (sampled from logo; replaced provisional `#2E74B5`).
- **Visual system v0.2** accepted: white-led, app-window "planning panel" frames, `panel-cohere` brand overlay, blueprint grids, soft blue shadows.
- **Trust-density pass** accepted: India-based / remote-first positioning (no Guwahati/Assam/North East), role-based team block (no staff names), controlled contact routing (values pending), operational depth on workflow pages.
- **Case Portal = public explainer only** (abstract dummy-data illustration; no backend, no upload).
- Governance: no fake proof/testimonials, no patient data/PII, no unsupported numbers/claims, no purple/gold/dark-flashy, no stock dentist photos.

## 7. Premium Visual Direction status
**Accepted** (`PREMIUM_DESIGN_DIRECTION.md`). It is an **evolution of v0.2, not a rebrand**. Three homepage directions defined; **Direction A "Planning Surface"** selected as the first prototype.

## 8. Direction A "Planning Surface" hero status
**Hi-fi hero mockup visually accepted as a design concept.** A **turnkey implementation spec exists** (`DIRECTION_A_HERO_IMPLEMENTATION_SPEC.md`) — but **not implemented in code** (frozen pending P0 assets + explicit founder go-ahead). The hero swaps in **P0-1** (in-window render) and **P0-4** (transparent frame-breaking cut-out); P0-4 is a transform of an already-approved asset (no new consent). Copy unchanged.

## 9. Hero mockup artifact links (private)
- **Hi-fi hero mockup:** https://claude.ai/code/artifact/dbe980af-2d8c-4524-89c0-948808d7af4f
- **Annotated homepage wireframe:** https://claude.ai/code/artifact/f94ce9af-2ba7-4861-8c5e-29a4ea069e61
- Local screenshots: `docs/handoff/screenshots/mockups/`.

## 10. Asset constraints & P0 checklist
**Constraints:** only approved, de-identified, PII-free assets ship; clinical imagery always real/rendered (never AI); AI only for non-representational decoration; consent/license/permission required per governance schema in `NEXT_PHASE_IMAGE_BRIEF.md §4`.

**P0 assets (from `NEXT_PHASE_IMAGE_BRIEF.md §1`):**
- **P0-1** ≥2,400px de-identified hero master (3D designer)
- **P0-2** dummy Case Portal UI screens (UI designer)
- **P0-3** consented smile + tooth-setup pair (photographer + 3D; **signed consent**)
- **P0-4** re-graded full-arch **transparent cut-out** (3D designer; no new consent)
- **P0-5** founder portrait reshoot (photographer; release)

*(A standalone `P0_ASSET_CHECKLIST.md` was delivered in chat but not saved as a file; P0 detail lives in `NEXT_PHASE_IMAGE_BRIEF.md`.)*

## 11. What IS approved
- The **frontend baseline** (26 routes) as-is.
- **v0.2 visual system**, trust-density pass, brand blue `#2F4678`.
- **Premium Visual Direction** + **Direction A** as the first prototype.
- The **hero mockup as a design concept** and its **implementation spec** (as a plan).
- Producing **P0–P2 assets + paperwork offline** (nothing enters `public/` without per-asset approval).

## 12. What is NOT approved (do not do without explicit founder instruction)
- Implementing the Direction A hero **in code**.
- Adding any image to `public/` / the manifest.
- Contact values (email/phone/WhatsApp), social handles, privacy/terms legal copy.
- Wiring the contact-form intake endpoint; Case Portal production URLs.
- Testimonials/proof (until real + consented); CMS build; **deployment**.

## 13. What must NOT be touched
- The **accepted frontend baseline** (`src/`, routes, components, copy) — frozen.
- **`public/`** and the 10 approved images.
- **Case Portal backend** (separate app — not in this repo).
- **No patient data / PII / DICOM / STL / clinical upload.**
- **No location emphasis** (Guwahati/Assam/North East). No purple/gold/dark-heavy. No fake proof.

## 14. Next recommended task for the new session
Two safe, design-only options (pick per founder):
1. **Pre-write the "Start with the smile" section spec** (the next homepage section after the hero) — same turnkey format as the hero spec. Its consented smile asset (P0-3) stays gated; the spec can be written now.
2. **Save the standalone `P0_ASSET_CHECKLIST.md`** as a file (currently only the brief covers it) for the photographer/3D/UI producers.

**Implementation of the hero** should happen only **after** P0-1 & P0-4 are produced and signed off, and the founder explicitly says "implement" — then follow the implementation prompt in `DIRECTION_A_HERO_IMPLEMENTATION_SPEC.md`.

## 15. Exact verification commands to run first
```bash
# (after the §0 directory audit passes)
cd "E:/image3dconversion_wesbite/i3dc-website-frontend"

# dependencies present?
ls node_modules >/dev/null 2>&1 && echo "deps ok" || npm install

# type + build health (baseline must stay green)
npm run typecheck
npm run build            # expect: 26 static routes, no errors

# asset + route integrity
find public/images -name '*.webp' | wc -l     # expect 10
find src/app -name page.tsx | wc -l           # expect 21

# link check (start server first in another step, then:)
# npm run start &  → wait for :3001 → node scripts/linkcheck.mjs   # expect 20/20 → 200
```
Do not change any `src/` or `public/` file as part of verification. If typecheck/build is not green on a clean checkout, **report before proceeding**.

---

*Handoff prepared as documentation only. Accepted v0.2 baseline unchanged: 26 static routes, 10 approved PII-free images, no CMS, not deployed.*
