# Image3DConversion — Production Launch Checklist

**Status:** Engineering complete and verified. Awaiting founder/business inputs + human deploy decision.
**Branch:** `cms-foundation-keystatic-zoho-dryrun` · **Baseline protected:** Wave 15 (`7e23680`).
**Not deployed. Zoho dry-run. `/keystatic` protected in production.**

---

## A. Engineering readiness — DONE ✅
- [x] Build green (`typecheck` + `next build` exit 0); all public pages statically prerendered.
- [x] All public routes return 200 (link crawler, 20 routes).
- [x] No broken images — all 32 manifest assets exist in `public/`.
- [x] No console errors; desktop (1280) + mobile (375) layouts clean, no horizontal overflow.
- [x] SEO: per-page title/description, absolute canonicals, Open Graph + Twitter cards, JSON-LD (Organization, ProfessionalService, FAQPage, BreadcrumbList); sitemap.xml + robots.txt valid.
- [x] CMS (Keystatic) editable areas wired with static fallback; edits proven to appear on the frontend.
- [x] Enquiry form: server-side `/api/enquiry` with validation, honeypot, rate-limit, clinical-leak guard; all 5 inquiry types verified in **dry-run**.
- [x] `/keystatic` + `/api/keystatic/*` return **404 in production** unless explicitly enabled with Basic Auth (verified via `next start`).
- [x] CMS admin navigation grouped **Live** vs **Advanced (not yet wired)** for editor clarity.

## B. Business / founder inputs — REQUIRED before launch ⚠️
- [ ] **Contact values** — approve public email / phone / WhatsApp, then enter in CMS → *Live · Site & contact → Contact settings*, tick **Publish direct contact details**. Until then the site shows the professional "Shared on request" structure (safe).
- [ ] **Privacy & Terms** — legal/privacy owner to supply final copy (both pages currently show an honest "being finalised" notice; no legal text is fabricated). Then replace the stub content.
- [ ] **Case Portal URLs** — portal lead to confirm production login / start-case URLs (currently placeholder `/case-portal/`).
- [ ] **OG social image** — provide a dedicated **1200×630** PNG/JPG; set it as `defaultOgImage` (CMS → SEO) and/or `public/images/`. Currently OG points to the brand logo (no 404, but not an ideal social card).
- [ ] **Proof / case evidence** — add real, consent-cleared testimonials and de-identified case evidence in the CMS (they stay hidden until `approved` + `consent`/`anonymised` flags are true). No claims invented.
- [ ] **Claim gate** — approve any scale/turnaround/partner numbers with source before publishing (kept out of code today).

## C. Zoho CRM go-live — when approved 🔌
Live submission stays **OFF** until ALL of these server-side env vars are set (never commit real values; see `.env.example`):
```
ZOHO_SUBMIT_ENABLED=true
ZOHO_ACCOUNTS_URL=https://accounts.zoho.in     # match your Zoho DC (.in/.com/.eu/…)
ZOHO_API_DOMAIN=https://www.zohoapis.in
ZOHO_CLIENT_ID=…
ZOHO_CLIENT_SECRET=…
ZOHO_REFRESH_TOKEN=…
ZOHO_MODULE=Leads
```
- [ ] Confirm whether an existing Zoho webform/endpoint already exists — if so, do not silently replace it.
- [ ] Confirm target module (recommended: **Leads** with `Lead_Source="I3DC Website"` + `Business_Unit="Image3DConversion"`) and create/confirm custom-field API names (`Inquiry_Type`, `Workflow_Interest`, UTM_*).
- [ ] Set env on the host, then submit **one test lead** and confirm it lands in the right pipeline before go-live.

## D. Hosting / deploy configuration — at deploy time 🚀
- [ ] Set `NEXT_PUBLIC`-free server env on the host.
- [ ] **Keystatic admin:** either omit `/keystatic` from the deployed app, OR set `KEYSTATIC_ENABLED=true` + `KEYSTATIC_ADMIN_USER` + `KEYSTATIC_ADMIN_PASSWORD` (all three) to expose it behind Basic Auth. Missing any → stays 404 (fail-safe).
- [ ] Consider a durable rate-limiter (KV/Upstash) for `/api/enquiry` on serverless (current limiter is per-instance, best-effort).
- [ ] Verify `site.url` (`https://www.image3dconversion.com`) matches the production domain for canonicals/sitemap.
- [ ] Point DNS / configure the host; run one post-deploy smoke test (home, a workflow page, /faq, enquiry submit).

## E. Known non-blockers
- 3 high-severity npm advisories are in the **pre-existing `sharp`/libvips** chain (image optimization), not introduced by CMS/forms work; `npm audit fix --force` would break the build and is not applied.
- Advanced CMS collections (services, workflowPages, pages, navigation, ctas, seoDefaults) are schema-only — editing them has no frontend effect until wired (labeled "Advanced · wire before editing" in the CMS). Optional future work.
- `assets-source/**` raw images remain untracked and are intentionally **not** committed.

---
**Production deploy remains a human decision.** When B–D are satisfied, the site is ready to ship.
