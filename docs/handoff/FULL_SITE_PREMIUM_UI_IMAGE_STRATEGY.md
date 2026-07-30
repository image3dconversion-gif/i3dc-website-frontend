# Image3DConversion — Full-Site Premium UI & Image Strategy

- **Status:** 🟢 Active working strategy for the premium / live-ready development pass.
- **Base:** Accepted v0.2 frontend + `PREMIUM_DESIGN_DIRECTION.md` (accepted) + `NEXT_PHASE_IMAGE_BRIEF.md` + `IMAGE_ASSET_AUDIT.md`. This is an **evolution (richness + production-readiness pass)**, not a rebrand.
- **Standing guardrails (unchanged):** white-led, one master blue `#2F4678`; no purple/gold/dark-heavy; no stock dentist photos; no fake proof / testimonials / before-after / partner logos; no patient data/PII; no fake CBCT/DICOM/STL; no unsupported claims; no location emphasis (Guwahati/Assam/North East). Clinical imagery is always real, rendered, de-identified, consented where required, EXIF-stripped. AI only for non-representational decoration.
- **Rollback:** the pass runs on a local git repo; baseline commit is the accepted v0.2 state. Every change is reversible via `git`.

---

## 0. Quality bar (the test every change must pass)
> Does this make the site read like a **premium global digital-dentistry planning company** — calm, precise, clinical-tech — rather than a template, a local lab brochure, or a generic dental clinic site?

A change ships only if it is: (a) production-minded, (b) reversible, (c) verified (typecheck + build + preview), (d) inside the guardrails above, and (e) not dependent on an unapproved asset (if it is, it ships as a labelled slot + documented asset spec, never as fake content).

---

## 1. Visual system — evolution of v0.2 (no rebrand)
The accepted system already defines the signature: **white ground → pale-blue tints → one controlled navy band**, app-window "planning panels" with a `panel-cohere` overlay, blueprint fields, corner brackets, soft blue shadows, Bricolage Grotesque + Lato. The premium pass **sharpens** it, it does not replace it.

| Axis | Keep (accepted) | Sharpen (this pass) |
|---|---|---|
| Colour | white-led + `#2F4678` derived scale; functional colours portal-only | formalise a **render-grading target** (mute magenta) so every image shares one palette |
| Type | Bricolage display + Lato body; `--fs-h1` 38→64 | add **`--fs-hero`** (40→68) for hero H1s only; tighter uppercase eyebrow; editorial lead paragraph (~34–66ch) |
| Space | `--section-y` 56→112 rhythm; 1,280 max | add a **"calm" section variant** (more air, one idea) around hero-adjacent moments; consistent 4px spacing steps |
| Depth | planning-panel + float shadows | codify **planning-panel + transparent cut-out + soft-shadow** as the signature; add a **device/browser frame** variant for portal UI |
| Motion | hover-lift only; global reduced-motion rule already in `globals.css` | reduced-motion-safe **reveal-on-scroll**, subtle hero float/parallax, nothing flashy |
| Iconography | none (▪ bullets) | a single **line-icon set** (`#2F4678`, 1.5px) to kill bullet-walls in detail lists |

**New reusable components (all reuse existing tokens):** `IconList`, `SectionHeading`, `StickySubnav`, `DeviceFrame`, `WorkflowRail`, `TrustStrip` (gated), `RevealOnScroll` (reduced-motion-safe wrapper), `ImageOrSlot` (renders `next/image` when an approved asset exists, else the labelled `ImagePlaceholder`). None introduce a third colour or a new font.

---

## 2. Page-by-page plan (structure preserved; copy unchanged)

### Home (`/`)
| # | Section | Now | Premium move | Asset |
|---|---|---|---|---|
| 1 | Hero | app-window + 2 floats (accepted) | keep as fallback-safe; swap to Direction A cut-out **only when P0-1/P0-4 approved** (see hero impl spec) | P0-1, P0-4 (gated) |
| 2 | Start with the smile | text-only + staggered list | **editorial two-up**: copy + labelled smile slot; fix mobile stagger; number the design order as a quiet process ladder | P0-3 (gated) → slot |
| 3 | Choose the workflow | 4 cards (good) | tighten card rhythm; consistent 16:10 media; hover polish | existing |
| 4 | The guide is one part | stacked deck (good) | keep; optional reveal-on-scroll | existing |
| 5 | Five visible steps | number cards | convert to a **reveal-on-scroll rail**; icons | SVG (P2) |
| 6 | Support modes | 3 cards | icon per mode; equal-height polish | SVG |
| 7 | Global practice fit | 3 points | **route diagram** (no flags/maps); icons | SVG (P2) |
| 8 | Complex-case band | navy band + 1 image | keep single band; re-graded cut-out when P0-4 lands | P0-4 → existing |
| 9 | Trust / who we are | 3 points | quiet role diagram; reserved (empty-safe) trust strip slot | P1-5 → slot |
| 10 | Case Portal band | chips (good) | upgrade to **DeviceFrame** dummy UI | P0-2 → CSS mock (compliant) |
| 11 | Requirements | checklist | **IconList**; privacy notice as a callout | icons |
| 12 | Final action | CTA (good) | keep; ensure single-CTA discipline | — |

### Solutions / `digital-implant-workflows`
Transparent-object thumbnails on "ways to work"; compact case-type / production / geography selector; `IconList` for comparisons. Assets: existing renders + slots.

### How It Works
Horizontal **WorkflowRail** (stacks on mobile) + **StickySubnav**; per-stage thumbnail slots. Assets: existing + P1-4 lab slots.

### Case Portal (`/case-portal`)
Biggest credibility ROI. Upgrade the CSS mock to a **DeviceFrame** presentation of the dummy portal (dashboard, case list, status chips, five-step) — **dummy data only**, no real names/case-IDs/thumbnails. Replace with P0-2 de-identified screenshots when approved.

### About
Founder portrait slot (P0-5) + de-identified lab/production strip (P1-4); role block as a quiet process diagram; never "Dr." prefix for the founder.

### Discuss a Case / FAQ
Keep lean; category icons; sticky category jump-nav on FAQ.

### Workflow ×10 detail pages (shared `WorkflowPage`)
`StickySubnav` (anchors already exist: intro/seq/detail/errors/notes/faq/discuss/cta); `IconList` on detail lists; one supporting product/render per page (existing pool now; unique P1-3 renders later). This kills the "bullet wall" site-wide from one component change.

---

## 3. Image strategy — distribution, not addition
**Constraint:** only the 10 approved assets may ship until the founder approves new files. Premium gain therefore comes from **better distribution + labelled slots + grading consistency**, not new clinical images.

- **De-duplicate the pool intentionally:** map each approved asset to a *primary* home so the same render doesn't read as "reused everywhere" (see `MASTER_IMAGE_ASSET_CHECKLIST.md`).
- **Every gap = a labelled slot**, never fake content. Use `ImagePlaceholder` (or the new `ImageOrSlot`) with the *final* alt text + exact spec, so the page is complete, crawlable, and self-documents the asset need.
- **Grading target:** all future renders graded toward brand blue-grey; mute magenta so nothing reads "purple." Cut-outs delivered object-only + optional separate soft-shadow layer.
- **AI allowed only** for abstract blue-white textures, grid/mesh backdrops, icon base shapes — never anatomy, implants, guides, CBCT, smiles, patients, hands, or anything implying a real case.

**Asset → section matrix** lives in `MASTER_IMAGE_ASSET_CHECKLIST.md` (single source for producers).

---

## 4. Accessibility & performance (raise, don't regress)
- Exactly one `<h1>` per page; heading order intact; focus ring already global (`--focus-ring`).
- All decorative art `aria-hidden` / empty alt; all real imagery factual alt.
- Reveal-on-scroll must degrade to visible resting state under `prefers-reduced-motion` (global rule already collapses animations — resting state must be the final state).
- `next/image` with explicit width/height everywhere (CLS ~0); `priority` only on the hero; responsive `sizes`.
- No horizontal overflow at 390 / 768 / 1024 / 1280; verify per change.
- Keep First Load JS lean (currently ~103 kB shared); new components are server components unless interaction requires client.

---

## 5. Sequencing (safe waves, each verified)
1. **Safety + docs + CMS scaffolding** — git baseline; this doc + checklist + CMS plan; additive content models. *(no visible risk)*
2. **Shared-component polish** — `IconList`, `SectionHeading`, `ImageOrSlot`, `RevealOnScroll`; apply to home + `WorkflowPage`. *(site-wide sharpness from few files)*
3. **Section upgrades** — Smile two-up + slot; steps rail; portal `DeviceFrame`; workflow `StickySubnav`.
4. **Asset-gated swaps** — Direction A hero (P0-1/P0-4), smile imagery (P0-3), portal screenshots (P0-2), founder/lab (P0-5/P1-4), trust strip (P1-5) — each only after per-asset founder approval.
5. **CMS integration** — only after explicit approval (see `CMS_READINESS_PLAN.md`).

---

## 6. What this strategy will **not** do
- Will not change accepted copy, claims, positioning, contact values, or governance constants.
- Will not add any image to `public/` or the manifest without per-asset founder approval.
- Will not connect a CMS, add a real contact endpoint, publish final legal copy, add testimonials/partner logos, or deploy.
- Will not introduce dark-heavy, purple/gold, or stock-clinic aesthetics.

---

*Working strategy for the live-ready pass. Companions: `MASTER_IMAGE_ASSET_CHECKLIST.md` (asset production) and `CMS_READINESS_PLAN.md` (CMS structure). The accepted baseline is preserved and reversible via git.*
