# Direction A — Homepage Hero Implementation Spec (turnkey)

- **Status:** Implementation-ready specification. **Documentation only — no code changed.**
- **Scope:** Evolve the existing homepage hero into Direction A "Planning Surface." This is an **incremental change to one component + the image manifest + the image pipeline**, not a rebuild.
- **Boundaries:** no frontend/`src`/`public` edits in this doc · no images added · no CMS · no deployment. Implementation happens only after founder approval (see §13).
- **Sources:** `PREMIUM_DESIGN_DIRECTION.md`, `DIRECTION_A_HERO_MOCKUP_SPEC.md`, `NEXT_PHASE_IMAGE_BRIEF.md` (P0 assets — the standalone `P0_ASSET_CHECKLIST.md` was delivered in chat but not saved; P0 IDs are defined in `NEXT_PHASE_IMAGE_BRIEF.md §1`).

> The current accepted hero already contains most of Direction A: `wash-blue` section, blueprint backdrop, corner brackets, `PlanningPanel` app-window, and floating cards. Direction A **adds the transparent frame-breaking cut-out (P0-4)** and **swaps the in-window render to the high-res master (P0-1)**. Copy is unchanged (already accepted).

---

## 1. Exact component plan
Evolve `src/components/sections/Hero.tsx` (server component). Structure (left copy / right surface) is retained.

```
<section class="wash-blue …" (add overflow-x:clip)>
  <Container grid 43fr/57fr>
    ── LEFT (copy, unchanged) ──
      Eyebrow · H1 · lead · CTA row (Start a Case / Discuss a Complex Case)
      · portal utility link · professional note
    ── RIGHT (right grid cell — `<div class="relative">`) ──
      .blueprint backdrop (aria-hidden, -inset-5, -z-10)   ← existing
      corner brackets ×2 (aria-hidden, z-10)               ← existing
      <PlanningPanel image={img.heroPlan} …/>              ← SWAP planRestorative → P0-1 heroPlan
      figure: printed-guide card (bottom-left, media-frame) ← existing float — KEEP as-is
      div: CAD-mesh chip (top-right, hidden sm:block)       ← existing float — KEEP as-is
      <HeroCutout/> transparent P0-4 arch                   ← NEW: frame-breaking object
  </Container>
</section>
```

> **Reality check against current `Hero.tsx` (do not invent an "Approval" card):** the right cell already renders **two** floating elements, not one — (a) a bottom-left `figure.media-frame` printed-guide card (`img.printedGuideModel`, caption "Guided surgical guide, produced from the plan", `-bottom-8 -left-6 w-40 sm:w-52`), and (b) a top-right CAD-mesh chip (`img.stlMesh`, `-right-4 -top-6 hidden w-32 sm:block`, hidden below the `sm` breakpoint). Direction A **keeps both** unchanged. The new cut-out is a **third** element and must be positioned so it does **not** occlude either existing float (see §3/§4 and the §11 visual check).

- **No new page files.** Hero copy stays in `src/content/pages/home.ts` (`home.hero`).
- **New sub-part:** the cut-out can be an inline block in `Hero.tsx` or a tiny `HeroCutout.tsx`. Recommendation: inline (it's ~15 lines) to keep the surface count low.
- `PlanningPanel` (`src/components/ui/PlanningPanel.tsx`) is reused as-is (props: `image, ratio, label, chrome, priority, sizes`; its default `ratio` is `"16/10"`). Keep the hero's explicit `ratio="16/11"`, `priority`, and its `panel-cohere` overlay.
- **H1 sizing:** the current hero `<h1>` carries no local font-size — it inherits the global `h1 { font-size: var(--fs-h1) }` (38→64px) from `globals.css`. Direction A introduces `--fs-hero` (§2) applied to the hero H1 **only**, which also overrides the global `letter-spacing`/`line-height` for that one heading (see §2).

## 2. Design tokens (reuse existing; add two)
Existing tokens in `src/styles/tokens.css` — **use as-is**. Note the naming split: the **raw CSS variable** lives in `tokens.css`; `globals.css` binds it to a **Tailwind color/utility alias** via `@theme inline` (so class `text-ink` resolves to `--text`, `border-line` to `--border`, `rounded-card` to `--radius`). Use the correct name for the layer you're editing.

| Raw CSS var (tokens.css) | Tailwind alias (class) | Value | Hero use |
|---|---|---|---|
| `--brand` = `--blue-600` | `brand` (`bg-brand`, `text-brand`, `border-brand`) | `#2f4678` | CTAs, links, accents, brackets |
| `--brand-hover` = `--blue-700` | `brand-hover` | `#283c66` | primary CTA hover |
| `--bg` = `--white` | `white` / `bg` | `#ffffff` | ground (white-led) |
| `--bg-tint` = `--blue-50` | `bg-tint` | `#eef1f7` | wash |
| `--text` = `--blue-900` | `ink` (`text-ink`) | `#16213a` | body copy |
| `--text-heading` = `--blue-800` | `heading` (`text-heading`) | `#202f4f` | headings |
| `--text-muted` | `muted` (`text-muted`) | `#4b5772` | captions / meta |
| `--border` | `line` (`border-line`) | `#e3e8f1` | window / card hairlines |
| `--border-strong` = `--blue-200` | `line-strong` | `#b7c5df` | stronger borders on tint |
| `--focus-ring` = `--blue-500` | — (used by global `:focus-visible`) | `#43608f` | keyboard focus ring (§9) |
| `--radius` / `--radius-sm` | `rounded-card` / `rounded-sm` | `8px` / `4px` | window, cards, CTAs, brackets |
| `--shadow-lift` / `--shadow-float` | — (used inside `media-frame`) | soft blue shadows | window / floating cards |
| `--ring-hairline` | — | `inset 0 0 0 1px rgba(47,70,120,.08)` | hairline ring in `media-frame` |
| `--content-max` | `container-content` | `1280px` | hero width (via `<Container>`) |
| `--section-y` | `spacing-section` | `clamp(56→112px)` | rhythm (hero uses its own padding, §3) |
| `--fs-h1` | — | `clamp(38→64px)` | **current** global H1 size (hero inherits this today) |
| `--font-display` (Bricolage) / `--font-body` (Lato) | `font-display` / `font-body` | type | H1 / body |

**Add to `tokens.css` (two new vars only):**
```css
--shadow-cut: 0 26px 44px -20px rgba(31,46,77,.45);      /* cut-out drop shadow (light) */
--fs-hero: clamp(2.5rem, 1.55rem + 3.6vw, 4.25rem);      /* 40 → 68px, hero H1 only */
```
`--fs-hero` is intentionally **larger than `--fs-h1`** (40→68 vs 38→64) and is scoped to the hero H1 alone — do not change global `--fs-h1`. No new Tailwind alias is required for either new var; reference them with arbitrary values (`text-[length:var(--fs-hero)]`, `drop-shadow-[var(--shadow-cut)]`) or inline style.

Utilities already available in `globals.css` and reused: `wash-blue`, `blueprint`, `media-frame`, `panel-cohere`, `container-page` (the hero uses the `<Container>` component, which applies the same max-width/gutter). No new utility required (cut-out styles can be inline/Tailwind).

**Type scale (hero H1):** `--fs-hero`, weight `700`, `letter-spacing:-.02em`, `line-height:1.03`, `text-wrap:balance`. Applying these to the hero H1 **overrides** the global `h1` rule (which is weight `600`, `letter-spacing:-.015em`, `line-height:var(--lh-tight)`=1.15) for that one heading only — intended. Lead 18.5px / 1.6, `max-width:34ch` (current code uses `text-lg` = 18px + `max-w-xl`; keep or tighten to 34ch). Eyebrow rendered by the existing `<Eyebrow>` component (do not restyle it here).

**Spacing scale:** 4px base; hero rhythm uses 16 / 22 / 30px vertical steps between eyebrow→H1→lead→CTAs.

## 3. Desktop layout measurements
Values below reflect the **current `Hero.tsx`** (Tailwind classes in parentheses). The `md:`/`lg:` breakpoints are Tailwind defaults (`sm` 640 / `md` 768 / `lg` 1024px).
- Container: `max-width:1280px` (`--content-max`), side gutter 20px (`--gutter`, applied by `<Container>`).
- Grid: single column below `lg`, then `43fr / 57fr` (`lg:grid-cols-[43fr_57fr]`), **gap 48px** (`gap-12`); `items-center`.
- Hero padding: **64px top+bottom** below `md`, **96px** at `md`+ (`py-16 md:py-24`). *(There is no separate top/bottom asymmetry in the current code — it is symmetric `py`.)*
- CTA buttons: styled by the `<ButtonLink>` component (primary `startCase`, secondary `discussCase`); row is `flex flex-col gap-3 sm:flex-row` (stacked on mobile, row at `sm`+, gap 12px). Do not hard-code button box metrics here — reuse `ButtonLink`.
- App-window (`PlanningPanel`): `media-frame` (radius `--radius-card`=8px, `--shadow-float`+`--ring-hairline`, clipped); chrome bar `px-4 py-2.5` (~40px tall) with three `bg-blue-200` dots + truncated `text-xs` label; viewport `bg-blue-900` at `aspect-ratio:16/11`; `panel-cohere` overlay on top.
- Blueprint backdrop: `absolute -inset-5` (20px bleed), `-z-10`, `rounded-[var(--radius-card)]`, `border border-line`, `blueprint` utility (**28px** grid), radial reveal mask `radial-gradient(85% 85% at 60% 45%, black, transparent)`.
- Corner brackets ×2: **28px** (`h-7 w-7`), 2px `border-brand/50`, `z-10`, corners rounded `--radius-sm`; offsets **8px** — top-left `-left-2 -top-2`, bottom-right `-bottom-2 -right-2` (Tailwind `-2` = 0.5rem = 8px, **not** 10px).
- Floating printed-guide card: `figure.media-frame`, `absolute -bottom-8 -left-6`, width **160px** (`w-40`) → **208px** at `sm`+ (`sm:w-52`); square image (`img.printedGuideModel`) + `panel-cohere` + white `figcaption`.
- Floating CAD-mesh chip: `div.media-frame`, `absolute -right-4 -top-6`, **128px** (`w-32`), `hidden sm:block` (not shown below 640px); `img.stlMesh` at `aspect-[4/3]`.

## 4. Mobile layout measurements (below `lg` = <1024px; single-column stack)
- Layout collapses to one column below `lg` (`lg:grid-cols-…` only applies at 1024px+): **copy first, surface second**, `gap-12` (48px), `py-16` (64px). *(The current grid switches at `lg`, not 960px — do not introduce a new breakpoint; reuse the existing one.)*
- H1: `--fs-hero` lower clamp bound = **40px** (reads large on a 390px viewport).
- CTAs stack vertically below `sm` (`flex-col gap-3`), become a row at `sm`+.
- App-window (`PlanningPanel`) is full-width; `sizes="(max-width:1024px) 100vw, 620px"` already set.
- **Which floats are visible on mobile:** the bottom-left printed-guide card is **always** shown; the top-right CAD-mesh chip is `hidden sm:block`, so **below 640px only the printed-guide card is present.** Design the cut-out around that.
- **Cut-out (mobile):** width ~220px, offset `right:-18px; bottom:-24px`. It must (a) stay within the `overflow-x:clip` surface with **no horizontal page overflow** (§6), and (b) **not overlap the bottom-left printed-guide card** — if crowding occurs on ≤390px, reduce cut-out width or nudge it upward rather than moving the accepted printed-guide card.
- Do **not** re-anchor the existing floats; their positions are accepted. Only the new cut-out is positioned per this section.

## 5. P0-1 image slot specification (in-window render)
- **Manifest entry** (`src/content/images.ts`), new key added to the existing `img` object (do **not** remove `planRestorative` — it may be referenced by other pages; see §12):
```ts
heroPlan: { src: "/images/planning/hero-implant-plan.webp", width: 2400, height: 1650,
  alt: "Restoration-led implant plan aligned with a surgical guide, shown in planning software." }
```
- **Width/height must equal the actual emitted file size.** `scripts/process-images.mjs` resizes with `withoutEnlargement:true`, so the output is capped at the job `width` *and* the source's native width — it will not upscale. After running the pipeline, copy the printed `WxH` (the script logs `✓ planning/hero-implant-plan.webp  <W>x<H> …`) into the manifest. `2400×1650` is the **target** (16:11); if the source is smaller or crops differently, use the real numbers so `next/image` reserves the correct box (no CLS).
- Rendered via `PlanningPanel image={img.heroPlan} ratio="16/11" label="Restoration-led implant plan" priority sizes="(max-width:1024px) 100vw, 620px"` — same props the hero uses today, only the `image` swaps from `img.planRestorative` → `img.heroPlan`.
- `PlanningPanel` uses `next/image` `fill` + `object-cover` and keeps the `panel-cohere` overlay; the aspect box (`16/11`) — not the manifest ratio — governs layout, but explicit width/height still prevents shift.
- Master ≥2,400px wide, ~16:11, brand-graded, mobile-safe centre crop. Next.js emits AVIF/WebP responsive variants at request time from this single WebP master; the pipeline itself outputs one optimized WebP.
- **Pipeline job to add** (same object schema as the existing jobs, `{ src, out, width }`):
```js
{ src: "<approved P0-1 source>.png", out: "planning/hero-implant-plan.webp", width: 2400 },
```
The default (non-logo) branch applies EXIF-strip (`.rotate()`), resize, mild `.sharpen()`, and `.webp({ quality:90, alphaQuality:100 })` — correct for an opaque render; no job-schema change needed.

## 6. P0-4 transparent cut-out slot specification
- **Manifest entries** (new):
```ts
fullArchCutout: { src: "/images/full-arch/stackable-cutout.webp", width: 2000, height: 1500,
  alt: "" }                                   // decorative → empty alt (aria-hidden container)
fullArchCutoutShadow?: { src: "/images/full-arch/stackable-cutout-shadow.webp", … } // optional separate shadow
```
- **Markup:** absolutely-positioned `<div aria-hidden>` (inline in `Hero.tsx`) containing `next/image`. Desktop: `right:-46px; bottom:-42px; width:300px; max-width:46%; filter:drop-shadow(var(--shadow-cut))`. Mobile per §4.
- **Stacking (be explicit):** the surface children currently layer as blueprint `-z-10`, window (no z / z-0), brackets `z-10`, floats (`media-frame`, no explicit z → stacking-context order). The cut-out should sit **above the window and blueprint** but must not bury the two floats' captions — give it an explicit `z` (e.g. `z-20`) and verify visually (§11) rather than relying on source order. It participates in the `relative` right-cell context, so its offsets are relative to that cell, not the section.
- **Overflow rule (critical):** add `overflow-x:clip` to the hero `<section>` (currently `wash-blue border-b border-line` — **keep that border**). Use `overflow-x:clip`, **not** `overflow:hidden` (which would also clip any intended top overhang and could crop the top-right chip). This lets the cut-out break the window edge while **guaranteeing no horizontal page scroll**. Verify `document.documentElement.scrollWidth === clientWidth` at 390 / 768 / 1280.
- **Format:** transparent WebP-alpha primary; halo-free edges (matte against the wash, not pure white, to avoid a light fringe on `#eef1f7`); ~2,000px long edge; optional separate soft-shadow layer instead of CSS `drop-shadow` for a softer look. *(A PNG-24 fallback is optional; all target browsers for this site support WebP alpha — only add PNG if analytics later show a need.)*
- **Pipeline:** add a job to `scripts/process-images.mjs` using the **same `{ src, out, width }` schema** as the existing jobs. The default branch preserves alpha automatically — it never calls `.flatten()`, and outputs `.webp({ alphaQuality:100 })`. Do **not** add `.flatten()` or a background fill. Consider whether the mild `.sharpen()` (applied to all non-logo jobs) is wanted on a soft-edged cut-out; if it hardens the alpha edge, gate it off for this job (add an `alpha`/`noSharpen` flag to the job object and branch on it). Suggested entry:
```js
{ src: "<approved re-graded stackable cut-out>.png", out: "full-arch/stackable-cutout.webp", width: 2000 },
```
- **Source & consent:** the source is the **already-approved stackable full-arch render** (`img.stackable` lineage), re-graded with background removed → a transform of an approved asset, so **no new consent** (confirm de-identification still holds after re-grade — see §13).

## 7. Schematic SVG fallback rules
- The mockup's schematic arch SVG is a **validation stand-in — not for production.** It must **never** ship presented as a real scan/case, and must carry no numeric/measurement labels.
- **Production fallback order** if P0-1/P0-4 are not yet approved on build day:
  1. **Preferred:** keep the **current accepted hero assets** (`planRestorative` in-window + existing floats). Ship Direction A layout, defer the cut-out.
  2. **Allowed (temporary):** show the schematic SVG **only** with a visible "Illustrative — not a patient case" caption and `aria-hidden`, clearly decorative. Remove once P0-4 lands.
- Never present the schematic as CBCT/DICOM/STL or clinical data. No fake data, ever.

## 8. Motion & reduced-motion rules
- **Hero load:** window fades/rises ~200ms; cut-out settles once (subtle, single beat).
- **Cut-out float:** `@keyframes float` ±9px, 7s ease-in-out infinite.
- **Eyebrow pulse:** expanding ring on the dot, 2.6s.
- **Cards:** existing hover-lift only.
- **`@media (prefers-reduced-motion:reduce)`:** disable float + pulse + load transitions (static state). No autoplay video, carousels, counters, or parallax that requires motion to understand content.
- **Already covered globally — do not duplicate carelessly:** `globals.css` has a base-layer `@media (prefers-reduced-motion: reduce)` block that forces `animation-duration`, `animation-iteration-count`, and `transition-duration` to near-zero on `*, *::before, *::after`. So any CSS `@keyframes`/transition on the cut-out/eyebrow is **already neutralized** for reduced-motion users. Implication: (a) implement the float/pulse as CSS animations (not JS `requestAnimationFrame` loops, which the global rule cannot stop); (b) ensure the element's **resting (unanimated) state** is the correct final position — because reduced-motion collapses the animation to frame 1, the keyframe at `0%`/default must already look right (do not hide the cut-out at `0%` and only reveal it mid-animation). No extra per-component media query is required, but an explicit one is harmless if it improves clarity.

## 9. Accessibility notes
- Exactly **one `<h1>`** on `/` (the hero H1 is the only one — verify no other page section introduces a second).
- In-window render `<img>` carries **descriptive alt** (`img.heroPlan.alt`, non-empty). The new cut-out is decorative → its container is `aria-hidden` and its `next/image` `alt=""`. Blueprint, corner brackets, and both existing floats stay as they are (blueprint/brackets `aria-hidden`; the printed-guide card is a real captioned `figure` and keeps its descriptive alt).
- CTAs are the existing `<ButtonLink>` (`<a>`). Keyboard **focus is already handled globally**: `globals.css` sets `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px }` where `--focus-ring` = `--blue-500` (`#43608f`) — **not** `--brand`. Do not add a per-CTA focus style; just don't suppress the global one.
- Colour contrast AA for body, headings, CTAs on white (navy `#2f4678` passes on white; `--focus-ring` `#43608f` gives a visible ring on white). Verify the eyebrow text and any caption on the wash tint still meet AA.
- Portal utility link (`hero.utility`) has descriptive text and opens in a new tab with `rel="noopener noreferrer"` (already in code) — keep it.
- Respect reduced-motion (§8). Keyboard order is DOM order: copy → CTAs → portal link → (visual cell, all decorative/aria-hidden except the printed-guide alt). The cut-out, being non-focusable and `aria-hidden`, adds nothing to the tab order.

## 10. Implementation file list (likely to change)
| File | Change | Risk |
|---|---|---|
| `src/components/sections/Hero.tsx` | Swap in-window image → `img.heroPlan`; add cut-out block; `overflow-x:clip` on section | Low (isolated) |
| `src/content/images.ts` | Add `heroPlan`, `fullArchCutout` (+ optional shadow) | Low |
| `src/styles/tokens.css` | Add `--shadow-cut`, `--fs-hero` | Low |
| `scripts/process-images.mjs` | Add jobs for the two new assets (alpha-preserving) | Low |
| `public/images/planning/hero-implant-plan.webp` | **NEW binary** (P0-1) — added at build, gated | Gated |
| `public/images/full-arch/stackable-cutout.webp` (+ shadow) | **NEW binary** (P0-4) — added at build, gated | Gated |
| `src/app/globals.css` | *Optional only* — a `.cutout` `@utility` if not inlined, or a `@keyframes float`/pulse if not written inline in `Hero.tsx`. **No focus or reduced-motion additions needed** (both already global here). | Low |

No route, content-copy, nav, or config changes. `home.ts` hero copy stays. `src/content/cta-routes.ts`, `<Container>`, `<ButtonLink>`, `<Eyebrow>`, and `PlanningPanel` are reused **unmodified**. Scripts referenced (`process-images.mjs`, `linkcheck.mjs`, `screenshot-final.mjs`) all exist under `scripts/`.

## 11. QA checklist after implementation
Run in order; **all must pass** before the hero is considered done. Baseline counts must not regress.

**Build & types**
- [ ] `npm run typecheck` → clean (no `tsc` errors).
- [ ] `npm run build` → **exactly 26 static routes**, no errors/warnings introduced. (Image count in `public/images` becomes **12** after the two new binaries land — update any doc that asserts "10".)

**Overflow / layout (the highest-risk item for this change)**
- [ ] No horizontal page scroll at **390 / 768 / 1024 / 1280**. Programmatic check in the browser console on `/`:
  ```js
  ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    ok: document.documentElement.scrollWidth === document.documentElement.clientWidth})
  ```
  Expect `ok:true` at every width. If false, the cut-out or its shadow is bleeding past `overflow-x:clip` — reduce its `width`/offset (§4/§6).
- [ ] With the dev server on :3001, `node scripts/linkcheck.mjs` → **all crawled internal routes return 200** (the script crawls from `/`; expect ~20 routes, `✓ All internal links return 200`, zero non-200). No new routes should appear.

**Accessibility**
- [ ] Exactly **one `<h1>`** on `/` (`document.querySelectorAll('h1').length === 1`).
- [ ] In-window render alt is non-empty; the cut-out container is `aria-hidden` and its image `alt=""`; global `:focus-visible` ring visible when tabbing CTAs.
- [ ] Keyboard tab order: copy → primary CTA → secondary CTA → portal link (cut-out never receives focus).

**Rendering quality**
- [ ] Manifest `width`/`height` for both new assets equal the pipeline's printed output dims → **no layout shift (CLS ~0)** on `/`.
- [ ] Transparent cut-out has **no white/gray halo** on the `wash-blue`/`#eef1f7` field (zoom the edge).
- [ ] `prefers-reduced-motion: reduce` (DevTools → Rendering → "Emulate CSS prefers-reduced-motion") → float/pulse are static and the cut-out sits in its correct **resting** position (not mid-animation).
- [ ] Dark-theme/viewer variant (if applicable) still legible.

**Visual composition**
- [ ] Cut-out emerges from the window edge **without occluding** either existing float — the bottom-left printed-guide caption and the top-right CAD chip stay fully readable (see §12).
- [ ] Desktop + mobile screenshots captured via `node scripts/screenshot-final.mjs`; compare against the accepted mockup.

**Governance gate**
- [ ] Only approved, de-identified, EXIF-stripped files in `public/` (the pipeline strips EXIF via `.rotate()`); no PII; no fake data; the cut-out is a transform of an approved asset (§13).

## 12. Rollback safety note
- Change is **component-scoped**: `Hero.tsx` + manifest entries + two tokens + one/two pipeline jobs + two new image files. Nothing else.
- **This project is not a git repo — take real file backups first.** Before editing, snapshot the four editable files (PowerShell):
  ```powershell
  Copy-Item src/components/sections/Hero.tsx  Hero.tsx.bak
  Copy-Item src/content/images.ts             images.ts.bak
  Copy-Item src/styles/tokens.css             tokens.css.bak
  Copy-Item scripts/process-images.mjs        process-images.mjs.bak
  ```
  (Or, better, `git init` a local repo first so rollback is a `git checkout`.)
- **Do not delete `planRestorative`** from the manifest during the swap — grep for its usages first (`img.planRestorative`); it may be referenced by other pages/sections. The hero only *stops* using it; the entry stays unless every usage is gone.
- **Rollback = restore the four `*.bak` files + delete the two new binaries** (`public/images/planning/hero-implant-plan.webp`, `public/images/full-arch/stackable-cutout.webp`). No route/schema/content/nav/config changes, so reverting fully restores the accepted v0.2 hero. Zero blast radius beyond the hero.
- After a rollback, re-run `npm run build` and confirm **26 routes / 10 images** to prove the baseline is intact.

## 13. Founder approval gates before code
All gates must be explicitly cleared by the founder **before any `src/`, `public/`, or `scripts/` edit**. Documentation (this spec) is not gated; code is.

1. **P0-1 sign-off** — high-res hero master reviewed and **confirmed de-identified** (no patient name/age/clinic/case-ID/DICOM overlay visible); license/usage confirmed; **case consent** obtained if P0-1 draws on a *new* case (not required if it is a re-crop of an already-consented, already-approved planning view).
2. **P0-4 sign-off** — the re-graded, background-removed transparent cut-out reviewed; confirm the re-grade did **not** reintroduce any identifying detail. It is a **transform of the already-approved stackable render → no new consent**, but de-ID must be re-verified on the new output.
3. **Per-asset go-live** — explicit approval to move each of the two binaries into `public/images/…` (nothing enters `public/` without per-asset approval, per the frozen-baseline rule).
4. **Manifest accuracy** — confirm the manifest `width`/`height` for both assets match the real pipeline output (§5) and alt text is factual (descriptive for P0-1, empty for the decorative cut-out).
5. **Copy/claims unchanged** — confirmation that hero copy stays as accepted: **no new numbers, no address/phone, no location emphasis** (Guwahati/Assam/North East), no fake proof.
6. **Baseline-integrity acknowledgement** — accept that image count moves **10 → 12** and any doc asserting "10 images" will be updated; route count stays **26**.
7. **Explicit instruction** — the founder says, in their own words, **"implement the Direction A hero"**. Absent this, code changes remain frozen per the accepted baseline; this spec stays documentation-only.

---

## Implementation prompt (use later, only after founder approval)

> **Implement the Direction A "Planning Surface" homepage hero** per `docs/handoff/DIRECTION_A_HERO_IMPLEMENTATION_SPEC.md`. Preconditions: all §13 gates cleared; P0-1 and P0-4 approved and de-identified. Steps:
> 1. Back up the four editable files to `*.bak` (see §12) — this is **not** a git repo.
> 2. Add **only** `--shadow-cut` and `--fs-hero` to `src/styles/tokens.css`. Do not touch `--fs-h1` or any other token.
> 3. Add `heroPlan` and `fullArchCutout` keys to the existing `img` object in `src/content/images.ts` — real output dimensions + alt (descriptive for `heroPlan`, **empty alt** for the decorative cut-out). **Do not remove `planRestorative`** (§12).
> 4. Add job entries (`{ src, out, width }`) to `scripts/process-images.mjs` for the approved P0-1 render and P0-4 cut-out. The default branch already preserves alpha and strips EXIF — do not add `.flatten()`; consider disabling `.sharpen()` for the soft-edged cut-out (§6). Run `node scripts/process-images.mjs`, then copy the printed `WxH` back into the manifest (§5).
> 5. In `src/components/sections/Hero.tsx`: apply `--fs-hero` to the H1 only (e.g. `text-[length:var(--fs-hero)] font-bold tracking-[-0.02em] leading-[1.03]`); swap the in-window image `img.planRestorative` → `img.heroPlan`; add the `aria-hidden` transparent cut-out `<div>` in the `relative` right cell (`z-20`, `right:-46px; bottom:-42px; max-width:46%; drop-shadow(var(--shadow-cut))`, CSS float `@keyframes`); add `overflow-x:clip` to the `<section>` **while keeping** its `border-b border-line`. **Keep unchanged:** copy, `<ButtonLink>` CTAs, portal link, blueprint backdrop, corner brackets (8px offsets), `panel-cohere`, and **both** existing floats (bottom-left printed-guide card + top-right CAD chip).
> 6. Focus and reduced-motion are already global (`globals.css`) — do not re-add them; just ensure the cut-out's resting state is its final position (§8).
> 7. Run the full QA checklist (§11): typecheck, build (26 routes), zero horizontal overflow at 390/768/1024/1280, one H1, linkcheck 200s, no halo, reduced-motion static, floats not occluded. Do **not** change routes, copy, or other pages. Do not deploy.
> Constraints: white-led, `#2F4678` only, no purple/gold/dark-heavy, no patient data, only approved de-identified assets in `public/`.

---

*Documentation only. The accepted v0.2 baseline is unchanged. No code will be written until the §13 gates are cleared and you give an explicit go-ahead.*
