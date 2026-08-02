# I3DC Public Website — Final Launch Checklist

**Scope:** public website (`i3dc-website-frontend`) + Zoho Leads integration only. Case Portal is a separate system (only the routing destination here).
**Prepared:** 2026-08-02. **Current state:** build green, dry-run, ready for a Vercel **preview** deploy.
**Golden rules:** Zoho stays **dry-run** until Phase 5 approval. No production deploy, no DNS change, no live Zoho submit without explicit **founder approval** (gates marked 🔴).

Sequence: **1 → 2 → 3 → 4 → 5 → 6**. Phases 1–2 (site) and 3–4 (Zoho) can run in parallel; Phase 5 needs 1+3+4 done.

---

## Phase 1 — Vercel preview deployment (safe, no production)
Goal: a working preview URL, still dry-run.

- [ ] Push branch `cms-foundation-keystatic-zoho-dryrun` to `origin` (no merge to `main`). 🔴 *merge to main = approval-gated; preview does not need it.*
- [ ] Vercel → New Project → import `image3dconversion-gif/i3dc-website-frontend`. Framework auto-detects Next.js; no `vercel.json` needed.
- [ ] Env vars for preview: **none required** to build/serve. Leave all `ZOHO_*` unset/`ZOHO_SUBMIT_ENABLED=false` → dry-run. Leave `KEYSTATIC_ENABLED` unset → admin 404.
- [ ] Deploy → confirm preview URL builds green.
- [ ] Preview smoke test (DEPLOYMENT_VERCEL.md §7):
  - [ ] `/` 200, hero + footer, email `info@image3dconversion.com`, WhatsApp "WhatsApp only — no calls".
  - [ ] a workflow page + `/faq/` 200; JSON-LD present.
  - [ ] `/sitemap.xml`, `/robots.txt` 200.
  - [ ] `/discuss-a-case/` → submit → success state; dry-run **sends nothing to Zoho**.
  - [ ] `/case-portal/` 200 (interim portal page; portal-routed enquiries land here).
  - [ ] `/keystatic/` + `/api/keystatic/config/` → **404**.
  - [ ] No console errors; mobile layout clean.

### Phase 1 local production verification — ✅ PASS (2026-08-02)
Ran `next build` + `next start` (production mode) locally and smoke-tested the real production artifact:
- All public routes 200: `/`, `/guided-implant-workflow/`, `/faq/`, `/sitemap.xml`, `/robots.txt`, `/discuss-a-case/`, `/case-portal/`.
- `/keystatic/` and `/api/keystatic/config/` → **404** (production fail-safe confirmed in prod mode).
- Home: email `info@image3dconversion.com` present, "WhatsApp only" present, 2 JSON-LD blocks, footer + h1 present, **no console errors**.
- `sitemap.xml` + `robots.txt` carry the production canonical `https://www.image3dconversion.com`; robots disallows `/keystatic/` + `/api/`.
- Form **not** submitted (Zoho dry-run boundary respected).

Branch committed + pushed: `cms-foundation-keystatic-zoho-dryrun` @ `b2323f0`.

### Vercel preview — ✅ FOUNDER MANUALLY VERIFIED (2026-08-02)
Vercel preview is live; founder confirmed on the preview URL:
- ✅ Public pages working
- ✅ `robots.txt` opens
- ✅ `sitemap.xml` opens
- ✅ `/keystatic/` → not found (404)
- ✅ `/api/keystatic/config/` → not found (404)

(Deploy stayed dry-run — no env vars set; no lead sent. DNS/production untouched.)

**Exit:** ✅ **MET** — preview URL green + smoke test passed (local production run + founder manual verification). No production/DNS change made.

---

## Phase 2 — GoDaddy DNS connection 🔴 (prepare now, execute only on approval)
Goal: point `image3dconversion.com` at Vercel. **Do not change DNS yet.**

- [ ] In Vercel → Project → Domains, add `www.image3dconversion.com` (primary) + `image3dconversion.com` (apex → redirects to www).
- [ ] Record the exact records Vercel shows (defaults): `CNAME www → cname.vercel-dns.com`, `A @ → 76.76.21.21`.
- [ ] 🔴 **Founder approval to edit GoDaddy DNS.** Then: remove conflicting parking A/CNAME for `@`/`www`; add the records above.
- [ ] Wait for propagation; Vercel auto-provisions SSL.
- [ ] Verify apex redirects to `www`; canonicals show production domain.

**Exit:** custom domain resolves with SSL. (Can be deferred until just before public launch.)

---

## Phase 3 — Zoho UI setup 🔴 (Zoho writes — approval-gated; assistant will show exact actions first)
Layout is built; these are the remaining Zoho-side items. **Do in Zoho One UI or via approved MCP writes, one at a time.**

- [ ] **Add `Lead_Source` value** `Website - Image 3D Conversion` on the Leads module (add-only; never remove workshop values). *Note: MCP `updateField` returns SUCCESS but does not add new picklist values — use the UI, or an alternative confirmed API path.*
- [ ] **Create 2 fields on the `I3DC Website` layout** (id `6607227000004071789`), reversible/scoped (`updateLayout`, no new layout, no delete):
  - [ ] `Journey_Stage` (picklist): New Website Inquiry · Inquiry Classified · Information Shared · Portal Guidance Needed · Portal Invitation Shared · Collaboration / Partner Review · Nurture / Educational Follow-up · Converted to Portal / Partner Review · Closed - Generic Resolved · Closed - Not Relevant. Default `New Website Inquiry`.
  - [ ] `Inquiry_Category` (picklist): Generic · Service-Info · Collaboration · Portal-Routed.
- [ ] Re-audit via MCP (read-only): confirm both fields exist with API names `Journey_Stage` / `Inquiry_Category`, the `Lead_Source` value exists, and only `Last_Name` is mandatory. Confirm no leak to paulsudeep.com / Mr Paul A/C / Standard.
- [ ] Capture final field IDs → record in handoff.

**Exit:** Lead_Source value + both fields present and verified; layout count still 4.

---

## Phase 4 — Workflow scoping 🔴 (Zoho automation — approval-gated; MCP cannot edit rule criteria)
Goal: I3DC website leads must NOT trigger workshop-branded automation.

- [ ] In Zoho One UI, review create-triggered Leads rules: `gallabox`, `W/A`, `Sudeep Paul SGE AD`, `AC – WhatsApp`, `AC – Meta Paid`, `AC – Referral:`, **`SGE Ack Enquiry`**.
- [ ] Scope each so it **excludes** `Lead_Source = "Website - Image 3D Conversion"` (or add positive criteria that never match I3DC website leads).
- [ ] (Optional) Create `I3DC Website — New Enquiry` rule: on create where `Lead_Source = "Website - Image 3D Conversion"` → I3DC-branded acknowledgement + owner assignment. 🔴
- [ ] Note: `src/lib/zoho/client.ts` sends `trigger:["workflow"]` on live submit, so unscoped rules WILL fire. Scope before any live/staging lead.

**Exit:** confirmed no workshop rule fires on I3DC website leads.

---

## Phase 5 — One controlled staging test lead 🔴 (explicit approval required; not before Phases 1+3+4)
Goal: prove end-to-end into Zoho exactly once, safely.

- [ ] Prerequisites met: Phase 3 (Lead_Source value + both fields) ✅, Phase 4 (workflow scoping) ✅.
- [ ] Set env on the **preview** deployment only (not production): `ZOHO_SUBMIT_ENABLED=true`, `ZOHO_ACCOUNTS_URL`, `ZOHO_API_DOMAIN`, `ZOHO_CLIENT_ID/SECRET/REFRESH_TOKEN`, `ZOHO_MODULE=Leads`, `ZOHO_LAYOUT_ID=6607227000004071789`. 🔴
- [ ] 🔴 **Founder approval to submit ONE staging test lead** (clearly-fake test data; not a real person).
- [ ] Submit once from the preview form. Verify in Zoho: lead lands on `I3DC Website` layout, `Lead_Source` + `Business_Unit` + `Inquiry_Type` + `Journey_Stage` + `Inquiry_Category` populated correctly; no workshop auto-reply fired.
- [ ] Test the portal-routing path (e.g. `Existing Customer Support`) → confirm `Journey_Stage=Portal Guidance Needed`, `Inquiry_Category=Portal-Routed`, user redirected to `/case-portal/`.
- [ ] Clean up the test lead per founder instruction (do not bulk-delete real data).
- [ ] Revert preview to dry-run (`ZOHO_SUBMIT_ENABLED=false`) until production go-live.

**Exit:** one clean end-to-end confirmed; dry-run restored.

---

## Phase 6 — Production launch approval 🔴 (founder sign-off)
Non-code prerequisites (DEPLOYMENT_VERCEL.md §10): legal Privacy/Terms copy, a 1200×630 OG image (advisable before public launch).

- [ ] Legal copy + OG image done (or founder accepts launching without).
- [ ] Phases 1–5 complete.
- [ ] 🔴 **Founder approval to promote to Production** in Vercel.
- [ ] Set production env: same Zoho vars as Phase 5 (only if live CRM at launch is approved), `KEYSTATIC_*` only if in-prod editing is wanted (else leave 404).
- [ ] Execute Phase 2 DNS if not already done. 🔴
- [ ] Run the full smoke test on the production domain.
- [ ] Update `src/content/site.ts` `portal.*` URLs when the live portal is available (DEPLOYMENT_VERCEL.md §9).

**Exit:** production live, verified, Zoho live-or-dry-run per founder decision.

---

## Approval gates summary (🔴 — none performed without explicit founder approval)
merge to `main` · GoDaddy DNS edit · any Zoho write (Lead_Source value, field creation, workflow scoping) · enabling live Zoho submit · submitting the staging test lead · production deploy · env secret changes.

## Assistant boundaries honored this session
No Zoho lead submitted · live Zoho submit not enabled · no DNS change · no production deploy · no Zoho field/workflow change.
