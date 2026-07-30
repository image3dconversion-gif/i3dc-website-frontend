# Image3DConversion — CMS-Readiness Plan

- **Status:** 🟢 Active plan. **Preparation only — no CMS is connected.** No hosted-CMS account, API key, or webhook is created until the founder explicitly approves a CMS choice (`NEXT_PHASE_IMAGE_BRIEF.md §6.5`).
- **Goal:** shape the code/content so that dropping in a CMS later is a **data-source swap**, not a rewrite. The frontend already consumes typed content modules from `src/content/`; this plan formalises that into stable models a CMS can populate.
- **Guardrails:** no patient-sensitive content in any content model; claims stay gated; governance constants stay in code, not CMS-editable.

---

## 1. Current state (already CMS-shaped)
The site is fully **content-driven** today:
- Page copy → `src/content/pages/*.ts` (`home.ts`, `workflows.ts`).
- Global identity / governance → `site.ts` (claim-free; `null` contact values).
- Navigation → `navigation.ts`. CTAs → `cta-routes.ts`. Images → `images.ts` (typed manifest).
- Pages compose typed section components; no copy is hardcoded in JSX beyond structural labels.

**Implication:** we are ~70% CMS-ready. The gaps are (a) an explicit **service data model**, (b) an **image governance metadata** layer, (c) a documented **page-section model**, and (d) a clear **editable vs locked** boundary.

---

## 2. Content model taxonomy (target)
Each becomes one CMS collection later; each already maps to a `src/content` module now.

| Model | Code home (now) | CMS collection (later) | Editable by CMS? |
|---|---|---|---|
| **Site settings** | `site.ts` | Singleton `siteSettings` | Partial — descriptor/footer yes; **governance + claims locked** |
| **Contact routing** | `site.ts` `contact` | Singleton `contact` | Values yes (gated approval), wording yes |
| **Navigation** | `navigation.ts` | `navItem` / `navGroup` | Yes |
| **CTA registry** | `cta-routes.ts` | `cta` | Labels/targets yes; discipline enforced in code |
| **Service / workflow** | `workflows.ts` + new `services.ts` | `service` | Yes (copy); slugs/routes locked |
| **Page (composed sections)** | `pages/*.ts` | `page` → `section[]` | Yes (copy); section *types* locked |
| **Image asset + governance** | `images.ts` + new `image-meta.ts` | `imageAsset` (with publish gate) | Metadata yes; **publish gated by state machine** |
| **FAQ** | inline in `workflows.ts` | `faq` | Yes |

---

## 3. What this pass adds (code, additive & non-breaking)
1. **`src/content/services.ts`** — a normalised **service data model** (`Service` type: slug, name, summary, audience, engagement, primary CTA, hero image key, related workflow slugs). Derives from existing `workflows.ts`/`home.ts` content; does not replace them yet. Gives a CMS a single `service` collection to target.
2. **`src/content/image-meta.ts`** — the **governance metadata layer** over `images.ts` keys, expressing the `NEXT_PHASE_IMAGE_BRIEF.md §4` schema + the publish-gate state machine as a typed record. `images.ts` (the render contract) stays unchanged; `image-meta.ts` annotates it.
3. **Section-model convention (documented here)** — page content is authored as an array of typed section objects (`{ type, ... }`) so a CMS can render a page from a section list. `home.ts` is refactored toward this shape incrementally, keeping the existing object API working.

All three are **additive**: existing imports keep working; nothing is forced to migrate in one step.

---

## 4. Editable vs locked boundary (critical for governance)
A CMS must **not** be able to publish a claim, a patient identifier, or an unapproved image. Enforce in code, not editorial trust:

**Locked in code (never CMS-editable):**
- Governance constants in `site.ts` (positioning language, professional notice).
- Claim gate — no scale numbers / turnaround / HIPAA / partner names until sourced.
- CTA discipline (one primary/secondary/utility; no fourth CTA).
- Image **publish gate** (`image-meta.ts` state machine) — alt required, PII-safe, consent-signed if person visible, license valid, approval ≥ approved.
- Route slugs, canonical URLs, robots/sitemap.

**CMS-editable (with approval where noted):**
- Section copy, FAQ, service summaries, nav labels, image captions/alt (alt still required to publish).
- Contact values (only after founder approval unlocks them).

---

## 5. Candidate CMS options (decision deferred to founder)
Presented for a later decision — **do not connect any of these now.**

| Option | Fit | Notes |
|---|---|---|
| **Git-based (Keystatic / TinaCMS / Contentlayer + MDX)** | High | Content stays in-repo as typed files (matches current design); no external service; editors get a UI; zero PII leaves the repo. **Recommended default.** |
| **Headless (Sanity / Contentful / Payload)** | Medium-High | Richer editing/roles/media library; adds an external dependency + API keys + build webhook; media governance must replicate the publish gate. |
| **Sanity self-hosted / Payload (self-host)** | Medium | Full control incl. media; more ops. |

**Selection criteria:** keeps governance enforceable in code; no patient data ever stored in a third-party media library without the gate; static export / ISR compatible with the current Next.js 15 App Router build; editor UX for non-technical founder.

---

## 6. Migration path (when approved)
1. Founder selects CMS (§5) — explicit approval required.
2. Map the §2 models to CMS collections; import current `src/content` values as seed data.
3. Add a thin **data-access layer** (`src/content/source.ts`) that reads from CMS at build time and returns the **same typed shapes** the components already consume — components don't change.
4. Re-implement the **publish gate** as CMS validation + a build-time assertion (fail the build if a gate is violated).
5. Extend `scripts/process-images.mjs` into the pipeline described in `NEXT_PHASE_IMAGE_BRIEF.md §4` (CMS stores master + metadata → emits the `images.ts` manifest shape).
6. Keep git-based fallback so the site builds even if the CMS is unreachable.

---

## 7. Explicitly NOT in this pass
- No CMS account, API key, webhook, or SDK install.
- No moving content out of the repo.
- No editorial workflow tooling connected.
- No change to the render contract (`images.ts` shape) or routes.

---

*Preparation plan only. The code scaffolding in §3 makes future CMS integration a data-source swap. No CMS is connected until the founder approves a choice.*
