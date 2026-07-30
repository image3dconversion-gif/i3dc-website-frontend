# Image3DConversion — Premium Visual Direction

- **Status:** ✅ Accepted design direction (documentation only)
- **Date:** 2026-07-29
- **Base:** Accepted v0.2 frontend structure + `NEXT_PHASE_IMAGE_BRIEF.md`. This is an **evolution** (richness pass), **not a rebrand**.
- **Standing boundaries:** no frontend/`src`/`public` edits · no images added · no CMS build · no deployment · no fake proof/testimonials · no patient data/PII · no location emphasis (Guwahati/Assam/North East) · white-led with one master blue `#2F4678` (no purple/gold/dark-flashy, no stock dentist photos).
- **Companion:** annotated Direction A wireframe (design artifact) — see §9.

---

## 1. Competitive UI/design audit
How premium global players (3Shape, Nobel Biocare, Straumann, Neoss, X-Guide, Evident/ClearGuide, BlueSkyBio) read "premium," and where I3DC stands:

| Premium pattern | I3DC today | Opportunity |
|---|---|---|
| One dominant high-res hero visual; often a **transparent 3D object floating on white** with soft shadow | App-window CBCT panel + floating cards (good), modest-res, shared across pages | Add a **transparent "hero object"** moment (guide/arch emerging from the UI) |
| **Trust bar** (compatibility logos, certifications, verified figures) | None (correctly gated) | Add a **logo/compatibility strip** once permissions exist; keep numbers gated |
| **Editorial type scale** + generous whitespace | Type good, spacing generous | Push more **editorial contrast** (bigger H1, tighter kicker) |
| **Scroll-linked / animated workflow diagrams** | Static numbered cards / bullet grids | Convert key sequences to **reveal-on-scroll diagrams** |
| **Sticky in-page sub-nav** on long pages | None | Add anchored sub-nav on workflow pages |
| Case galleries (before/after) | Framework only (no patient B/A) | Use **workflow sequences** — our constraint is a credibility advantage |
| Restrained micro-interactions & motion | Hover lift only | Tasteful reveals + hero parallax (reduced-motion safe) |
| Occasional dark "technology" band | One blue band (on-brand) | Keep single band; don't go dark-heavy |

**Verdict:** our content architecture and governance already beat much of the field (competitors over-claim; we don't). The deficit is purely **visual richness**: image repetition, no transparent product hero, text-heavy detail sections, no trust bar, limited motion. Closing those moves us from "clean/credible" to "premium/global."

## 2. Page-wise improvement ideas (structure preserved)
- **Home:** transparent guide/arch cut-out breaking the app-window frame + larger calm H1; "start with the smile" → editorial two-up (consented); "five steps" & "guide is one part" → scroll-reveal diagrams; compatibility/partner strip (gated); reserved proof slot.
- **Services:** transparent-object thumbnails on "ways to work"; compact case-type/production/geography selector.
- **How It Works:** animated horizontal workflow rail (stacks on mobile) + sticky progress sub-nav.
- **Case Portal:** upgrade CSS mock → **designed dummy portal screens** in a device frame (biggest credibility lift).
- **About:** founder portrait + de-identified lab/production strip; role block as a quiet process diagram.
- **Discuss / FAQ:** keep lean; category icons; sticky category jump-nav.
- **Workflow ×10:** unique hero + one supporting product/render each; anchored sub-nav; icons on detail lists (kills the "bullet wall").

## 3. Image strategy per section
| Section | Visual | Type |
|---|---|---|
| Home hero | Planning UI + transparent guide/arch cut-out | render + cut-out |
| Home smile | Consented smile ↔ tooth setup | real, consented |
| Home differentiation / five-steps | Scroll-reveal diagram + small real thumbnails | SVG + render |
| Home complex band | Re-graded full-arch cut-out | render (cut-out) |
| Home trust strip | Partner/compatibility logos | real, permission |
| Services / workflow cards | Per-workflow render/product | render + photo |
| Case Portal | Dummy portal UI in device frame | UI design |
| About | Founder + lab/production | real, consented |
| Workflow detail | Guided kit/implant cut-outs + planning views | photo + render |
| Global | Simple route diagram (no flags/maps) | SVG |

## 4. Which images we can use from current assets
Planning renders (194757 / 194929 / 195008 / segmentation), full-arch (130558 / 174150), guide product (12 / 14), STL mesh (113528), logo — all reusable; several are good **cut-out** candidates. **Best immediate win:** re-grade + cut-out the stackable full-arch for a transparent hero moment (no new consent).

## 5. Which images should be newly designed / rendered
≥2,400px hero master; per-workflow planning views (zygoma trajectory, immediate provisional, MUA, design-only STL); isolated implant/abutment transparent renders; dummy Case Portal UI screens; workflow SVG diagrams + icon set.

## 6. Which images may be AI-generated safely
**Only non-representational decoration:** abstract blue-white technical textures, subtle grid/mesh backgrounds, icon base shapes. **Never** AI for implants, guides, anatomy, CBCT, smiles, patients, hands, or anything implying a real case/product/outcome.

## 7. Which images must be real / owned / consented
Patient smile/setup (signed consent + de-id — hard blocker); founder & team/lab (releases); partner/compatibility logos (written permission); any real case in a render/screenshot (case consent + de-id sign-off).

## 8. Recommended visual style system (evolution of v0.2)
- **Colour:** keep white-led + `#2F4678` scale; formalize a **render-grading target** (mute magenta) so all imagery shares one palette; functional colors stay portal-only.
- **Type:** keep Bricolage Grotesque + Lato; larger H1 with tighter uppercase kicker; an editorial lead-paragraph style; ~66ch measure.
- **Space & grid:** 12-col, 1,280 max; add a "calm" section variant (more air, one idea) for hero-adjacent moments.
- **Depth:** codify **planning-panel + transparent cut-out + soft-shadow** as the signature; add a **device/browser frame** variant for portal UI.
- **Motion:** reduced-motion-safe reveal-on-scroll, subtle hero parallax, hover elevation — nothing flashy.
- **New components:** `TrustStrip`, `WorkflowRail`, `DeviceFrame`, `IconList`, `StickySubnav` — all reuse existing tokens.

## 9. Homepage design directions
**Direction A — "Planning Surface" (lowest asset risk, recommended first / prototyped):**
Hero = premium planning workspace (app-window on a blueprint field) with a transparent arch/guide cut-out emerging over the frame edge; big calm H1, two CTAs. Signals "digital workflow infrastructure." *Buildable largely from re-graded current assets.* → annotated wireframe delivered as a design artifact.

**Direction B — "Outcome-Led Editorial" (aligns with the north star):**
Hero leads with the consented smile + tooth-setup as a large editorial split, then descends into the technical system. Warmest, most human. *Blocked until the consented smile asset exists.*

**Direction C — "Product Hero" (boldest, catalog-premium):**
A single transparent surgical guide/implant object, studio-lit, floating on white with soft shadow, minimal copy. Strongest "real product company" signal. *Needs a new hero render/photograph.*

## 10. Final recommendation before implementation
1. **Evolve, don't rebrand** — v0.2 is accepted; this is a richness pass on top.
2. **Sequence:** (i) refine the **style system** (type/space/motion/components) — no new assets; (ii) ship **Direction A** homepage using re-graded current assets + a transparent full-arch cut-out (P0-4, no new consent); (iii) layer **Direction B** when the consented smile lands, and **Direction C** as a later product-hero statement; (iv) upgrade **Case Portal to designed dummy UI** (highest credibility ROI); (v) de-duplicate workflow pages with per-page renders + icon lists.
3. **Guardrails hold:** governance gates, no fake proof, no patient data, no location emphasis, blue-white only.

**Prototype first: Direction A** — biggest premium jump with assets we can prepare without new consent; a faithful evolution of the accepted hero.

---

*Documentation only. Does not modify the accepted frontend baseline. Companion: `NEXT_PHASE_IMAGE_BRIEF.md` (assets) and the Direction A annotated wireframe (design artifact).*
