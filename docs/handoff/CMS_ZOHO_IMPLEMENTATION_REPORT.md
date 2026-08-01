# Image3DConversion — CMS + Zoho-Ready Form Implementation Report

**Status:** Implemented and verified locally. **Not committed. Not deployed.**
**Baseline protected:** Frontend Wave 15 (`7e2368004bb8644873d6ea0f7125afaecb97fa11`).
**Scope:** CMS content layer + SEO enrichment + server-side Zoho-ready form architecture, added *over* the approved frontend without redesign.

---

## 1. CMS selected
**Keystatic (git-based, local storage).** `@keystatic/core@0.6.4` + `@keystatic/next@5.0.4` — compatible with Next 15.5 / React 19 / Tailwind 4. Content lives in-repo under `content/**` (JSON); nothing goes to a third-party media library, so no patient-identifiable content can leak to an external service. Admin UI at `/keystatic` (noindex + robots-disallowed).

## 2. Architecture decision
- **Data-source abstraction** `src/content/source.ts`: async getters return the *same typed shapes* components already consume. They read CMS content first and **always fall back** to the approved static modules when a CMS entry is absent/blank/unreadable. Result: if the CMS is empty or down, the frontend renders **identically** — no drift, no broken build.
- **Governance stays in code:** canonical URL, route slugs, disclaimers, CTA discipline, claim gate and image publish gate are locked/validated, not freely editable.
- **Chrome gate** `SiteChrome.tsx`: hides the public Header/Footer only on `/keystatic*` (verified: no public route affected).

## 3. Content models created (13)
Singletons: `siteSettings`, `contactSettings`, `footerSettings`, `seoDefaults`.
Collections: `navigation`, `ctas`, `services`, `workflowPages`, `pages`(sections), `faqs`, `testimonials`, `caseEvidence`, `imageAssets`(governance), `seoMeta`.
Locked/validated fields: service slugs, workflow routes, canonical structure, disclaimers, image approval gate (`approvalStatus`, `piiSafe`, `consentStatus`), CTA variants. Testimonials/caseEvidence are consent+approval gated before they can ever render.

## 4. Frontend files changed (8, additive only)
- `src/app/layout.tsx` — chrome gate + Organization/ProfessionalService JSON-LD + OG/Twitter defaults.
- `src/components/layout/Footer.tsx` — now sources text through the resolver (identical output via fallback).
- `src/components/sections/ContactForm.tsx` — real submit + consent + UTM/page-source + inquiry types + success/error states (same design tokens).
- `src/components/sections/WorkflowPage.tsx` — FAQ + Breadcrumb JSON-LD (no per-page edits; uses existing `canonical`).
- `src/app/faq/page.tsx` — FAQPage + Breadcrumb JSON-LD from existing Q&A.
- `src/app/robots.ts` — disallow `/keystatic/`, `/api/`.
- `package.json` / `package-lock.json` — Keystatic deps.
No typography, spacing, layout, color, image treatment, route or slug was changed.

## 5. CMS files created
`keystatic.config.ts`; `src/app/keystatic/**` (admin); `src/app/api/keystatic/[...params]/route.ts`; `src/content/source.ts`; `src/components/layout/SiteChrome.tsx`; seed content `content/settings/{site,contact,footer,seo}.json`.

## 6. Form architecture
`ContactForm` → `POST /api/enquiry` (same-origin route handler) → honeypot → per-IP rate limit → validation + clinical-leak guard → inquiry-type routing → guarded Zoho submit.
Files: `src/lib/enquiry/{types,validate}.ts`, `src/lib/zoho/{mapping,client}.ts`, `src/app/api/enquiry/route.ts`, `.env.example`.
Five inquiry types supported: Discuss a Case, Service Inquiry, White-Label, Lab/Vendor, Existing Customer (→ Case Portal redirect, no CRM record). Fields captured: name, email, phone, city, organization, role, service interest, workflow interest, inquiry type, urgency, message, preferred callback, existing-customer, consent, page source, lead source (`I3DC Website`, fixed server-side), business tag (`Image3DConversion`, fixed), UTM source/medium/campaign/content.

## 7. Zoho CRM mapping recommendation
Route to the standard **Leads** module with `Lead_Source="I3DC Website"` + `Business_Unit="Image3DConversion"` (separates I3DC from SurgiGuide in the shared org). Live submission is **guarded**: dry-run until `ZOHO_SUBMIT_ENABLED=true` and OAuth refresh-token creds are set server-side. Mapping packs all context into `Description` so nothing is lost if a custom field is missing; suggested custom fields (`Inquiry_Type`, `Workflow_Interest`, UTM_*) are listed for creation. **Open:** confirm whether an existing Zoho webform/endpoint already exists — if so, do not silently replace it.

## 8. SEO improvements
JSON-LD: Organization + ProfessionalService (site-wide), FAQPage (FAQ page 22 Q&A; each workflow page's FAQ), BreadcrumbList (FAQ + 10 workflow pages). Per-page canonical retained; OG image + Twitter summary_large_image added; `seoMeta` collection enables per-page overrides. Claim-free: no invented location, scale, turnaround or partner claims. **Open:** a dedicated 1200×630 OG social image should be produced (currently points to the real logo to avoid 404s).

## 9. Verification results
- `tsc --noEmit`: **pass**.
- `next build`: **pass** — 26 routes; all public pages statically prerendered; public First-Load JS unchanged (102 kB); Keystatic (887 kB) isolated to `/keystatic`.
- Lint: skipped — no ESLint config present (interactive setup), per instruction.
- `/api/enquiry` tested: valid→200 dry-run (routed "Case Enquiries"); missing consent / invalid email / clinical-leak / honeypot → 422; rate limit → 429; existing-customer → 200 redirect to `/case-portal/`.
- Structured data verified in-browser on home/FAQ/workflow pages.
- Footer parity confirmed (CMS resolver output identical to approved static).
- Keystatic admin loads all 13 models; public chrome correctly gated out.
- Mobile (375px): no horizontal overflow. No console errors.
- No-clinical-data check: CMS schema is marketing-only (no file/DICOM/STL/patient fields); form rejects clinical identifiers.

## 10. Risks / open decisions
1. Existing Zoho webform/endpoint — confirm before enabling live (do not replace silently).
2. Zoho target module — Leads (recommended) vs purpose-built Inquiries layout; create suggested custom fields + confirm API names.
3. Contact values (`email/phone/whatsapp`) still `null` pending founder approval.
4. Rate limiter is in-memory (per instance) — add durable KV/Upstash for production/serverless.
5. Dedicated OG social image asset to be produced.
6. 3 high-severity npm advisories are in the **pre-existing** `sharp`/libvips chain (not introduced here); `npm audit fix --force` would break and was not applied.
7. Deploy host needed for CMS write-back + server-side Zoho secrets.

## 11. Recommended commit message
```
feat: add Keystatic CMS layer, Zoho-ready enquiry API, and JSON-LD SEO

- Keystatic (git/local) with 13 marketing content models + admin at /keystatic
- src/content/source.ts data-source abstraction with static fallback (no drift)
- server-side /api/enquiry: validation, honeypot, rate-limit, UTM, 5 inquiry
  types, guarded Zoho Leads mapping (dry-run until approved)
- JSON-LD Organization/ProfessionalService/FAQPage/BreadcrumbList + OG/Twitter
- frontend design unchanged; all public pages stay static; build + typecheck green
```

## 12. No deployment — confirmed. Nothing was deployed or committed.
## 13. No paulsudeep.com work — confirmed. Untouched.
## 14. No I3DC Case Portal changes — confirmed. Only linked/redirected to, never modified.
