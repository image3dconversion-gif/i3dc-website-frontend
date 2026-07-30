# Image3DConversion — Public Website Frontend Handoff

- **Status:** ✅ **Accepted frontend baseline** (after visual v0.2 + full-site pass + trust-density pass)
- **Date:** 2026-07-29
- **Scope:** Public marketing website only. The authenticated Case Portal is a **separate application** and is not built here.
- **Preserve current state** — remaining items below are launch/operations tasks, not frontend polish.

---

## Stack & run

- Next.js (App Router) · TypeScript · Tailwind CSS v4 · **dev port 3001**
- One master blue **`#2F4678`** (sampled from the logo) + white. No decorative third accent.
- Typography: Bricolage Grotesque (display) + Lato (body) via `next/font`.

```bash
npm install
npm run dev        # http://localhost:3001
npm run build      # production build (26 static routes)
npm run start      # serve production build on :3001
npm run typecheck  # tsc --noEmit
```

Verification helpers: `node scripts/linkcheck.mjs` (links), `node scripts/screenshot-final.mjs` (screenshots) — server must be running. Approved images are produced by `node scripts/process-images.mjs`.

---

## Build & quality (last run)

- **Typecheck:** ✅ clean (`tsc --noEmit`)
- **Production build:** ✅ compiles, **26/26 routes prerendered static**, ~103 kB shared JS
- **Links:** ✅ all 20 public routes return 200 (crawled from `/`)
- **Mobile (390px):** ✅ no horizontal overflow, exactly one `<h1>` per page
- **PII:** ✅ only 10 approved, de-identified, EXIF-stripped images ship; no patient identity anywhere

---

## Page inventory

**Full pages (18):** Home · Digital Implant Workflows (Services) · Guided Implant · Full-Arch Stackable · Zygoma & Pterygoid · Immediate-Loading · Case Data & Diagnostic Preparation · Design-Only · Design-to-Delivery · White-Label Partnership · Global Practices · Case Requirements · Case Evidence · How It Works · About · Discuss a Case (Contact) · Case Portal (public explainer) · FAQ.
**Internal:** `/design-system` (noindex).
**Intentional legal placeholders:** `/privacy/`, `/terms/` (await legal owner — not fabricated).

## Key boundaries held
- No clinical upload; no DICOM/STL/patient-file intake on the public site.
- Case Portal is a **public explainer + link only**; abstract dummy-data illustration, no real screenshots, no backend.
- Contact form collects a **non-identifying** enquiry only, has **no file input**, and **does not transmit** yet.
- No CMS, CRM, payment, email/Zoho/WhatsApp integration; not deployed.
- Location positioning is India-based + remote-first + globally reachable, **without** foregrounding Guwahati/Assam/North East.
- No fabricated testimonials, client names, logos, numbers, addresses, or legal claims.

## Screenshots
`docs/handoff/screenshots/final/` — desktop + mobile for all main pages, full-page home, mobile menu.
`docs/handoff/screenshots/trust/` — trust-density pass (About, workflow depth, Case Evidence, footer/contact).

---

## Remaining launch / operations checklist (not frontend polish)

| # | Item | Where it plugs in | Owner |
|---|------|-------------------|-------|
| 1 | **Approved public contact values** (email / phone / WhatsApp) | `src/content/site.ts` → `contact` (currently `null`; UI reveals automatically) | Founder |
| 2 | **Confirmed live social handle(s)** (LinkedIn suggested) | Footer badge (none rendered until provided) | Founder |
| 3 | **Privacy & Terms legal copy** | `/privacy/`, `/terms/` (replace placeholders) | Legal owner |
| 4 | **Contact form intake endpoint** | `src/components/sections/ContactForm.tsx` — wire the approved/tested route; **do not** silently replace the live Zoho form | Ops / Zoho owner |
| 5 | **Real testimonials / proof** (consented) | mount `src/components/sections/ProofStrip.tsx` (built, intentionally unmounted) | Founder + case-evidence owner |
| 6 | **Case Portal production URLs** (login / start-a-case) | `src/content/site.ts` → `portal` (placeholders today) | Portal lead |
| 7 | **Proof-point verification** before publishing any numbers | gated per blueprint | Founder + data owner |
| 8 | **Deployment approval** | — do not deploy without explicit approval | Founder |

Also pending real assets (see `IMAGE_ASSET_AUDIT.md`): a ≥2,400px de-identified hero master, de-identified Case Portal UI screenshots, and consent-cleared case examples.
