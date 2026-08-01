# Image3DConversion — Vercel Deployment Guide

**Hosting decision:** Vercel (Next.js runtime) + GoDaddy (domain/DNS only).
**Status:** Deployment-ready. **Do NOT deploy without founder approval.** Zoho stays dry-run.

---

## 1. Why Vercel (not GoDaddy shared hosting)
This app is **not** a static site — it needs a Node/serverless runtime for:
- `src/app/api/enquiry/route.ts` (server enquiry intake → Zoho),
- `src/middleware.ts` (the `/keystatic` production protection),
- `/keystatic` + `/api/keystatic/*` admin routes.

GoDaddy shared hosting cannot run these. Vercel auto-detects Next.js and runs them. GoDaddy stays **domain + DNS only**.

## 2. Is a `vercel.json` needed?
**No.** Standard Next.js App Router is auto-detected by Vercel:
- Framework: Next.js (auto)
- Build command: `next build` (auto)
- Install: `npm install` (auto)
- Output: `.next` (auto) — API routes → serverless functions; `middleware.ts` → Edge Middleware; static pages → CDN.

No `vercel.json` is committed (none required). Add one later only for advanced needs (region pinning, headers, redirects).

## 3. Deploy steps (Vercel)
1. Push this branch and open a PR to `main` (or deploy the branch as a preview first).
2. Vercel → **New Project** → import the GitHub repo. Framework auto-detects as Next.js.
3. Set **Environment Variables** (Production + Preview) — see §4. None are required for the site to build/serve; add Keystatic/Zoho vars only when wanted.
4. **Deploy.** Confirm the preview URL builds green and passes the smoke test (§7).
5. Add the custom domain (§5) and set GoDaddy DNS (§6).
6. Promote to Production only after founder approval.

## 4. Environment variables (set in Vercel → Project → Settings → Environment Variables)
**Runtime:** Node.js (default). Do NOT commit any of these — they live in Vercel only.

| Variable | When | Purpose |
|---|---|---|
| *(none required)* | — | Site builds and serves with **zero** env vars; contact details are already in content/code. |
| `KEYSTATIC_ENABLED` | optional | `true` to expose `/keystatic` in prod (else 404). |
| `KEYSTATIC_ADMIN_USER` | with above | Basic-Auth username for the admin. |
| `KEYSTATIC_ADMIN_PASSWORD` | with above | Basic-Auth password. **All three** required or admin stays 404. |
| `ZOHO_SUBMIT_ENABLED` | Zoho go-live | `true` to enable live CRM submit (default off → dry-run). |
| `ZOHO_ACCOUNTS_URL` | Zoho go-live | e.g. `https://accounts.zoho.in` (match your DC). |
| `ZOHO_API_DOMAIN` | Zoho go-live | e.g. `https://www.zohoapis.in`. |
| `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_REFRESH_TOKEN` | Zoho go-live | OAuth credentials (server-only). |
| `ZOHO_MODULE` | Zoho go-live | Target module (default `Leads`). |

> Keystatic note: on Vercel's read-only serverless filesystem, the admin's local-git writes **do not persist**. Recommended model: **edit content locally, commit to git** (Vercel redeploys). If the team needs in-browser editing in prod, switch Keystatic to **GitHub storage** (separate setup) rather than local. The admin is optional in production.

## 5. Domain setup (Vercel)
- Canonical host is **`www.image3dconversion.com`** (matches `site.url` used for canonicals/sitemap/OG).
- In Vercel → Project → **Domains**, add both `www.image3dconversion.com` (primary) and `image3dconversion.com` (apex → redirects to www).

## 6. GoDaddy DNS records (domain stays at GoDaddy)
In GoDaddy → DNS management, set the records Vercel shows for your project (current Vercel defaults):

| Type | Host / Name | Value | Purpose |
|---|---|---|---|
| CNAME | `www` | `cname.vercel-dns.com` | points www → Vercel |
| A | `@` (apex) | `76.76.21.21` | points apex → Vercel (redirects to www) |

- Remove any conflicting existing A/CNAME for `@`/`www` (e.g. GoDaddy parking).
- Alternative: switch the domain to **Vercel nameservers** (Vercel will list them) — simpler but moves DNS control to Vercel. Founder preference is to keep DNS at GoDaddy, so use the A/CNAME records above.
- Allow up to a few hours for DNS propagation; Vercel auto-provisions SSL.

## 7. Post-deploy smoke test
- [ ] `https://www.image3dconversion.com/` → 200, hero + footer render, contact = `info@image3dconversion.com`, WhatsApp shows "WhatsApp only — no calls."
- [ ] apex `https://image3dconversion.com` → redirects to `www`.
- [ ] A workflow page (e.g. `/guided-implant-workflow/`) and `/faq/` → 200; JSON-LD present.
- [ ] `/sitemap.xml` and `/robots.txt` → 200; canonicals show the production domain.
- [ ] `/discuss-a-case/` → submit a test enquiry → success state; while Zoho is dry-run this **sends nothing** (validation only).
- [ ] `/keystatic/` and `/api/keystatic/config/` → **404** (unless `KEYSTATIC_ENABLED` + creds are set → then 401 without auth).
- [ ] No console errors; mobile layout clean.

## 8. Keystatic in production — safe enable (optional)
Default: `/keystatic` is **404** in production. To allow admin editing after deploy, set **all three** in Vercel: `KEYSTATIC_ENABLED=true`, `KEYSTATIC_ADMIN_USER`, `KEYSTATIC_ADMIN_PASSWORD` → the admin then requires HTTP Basic Auth. Missing any one → stays 404 (fail-safe). Public pages never expose the admin (it's a separate route, `noindex`, robots-disallowed, and behind middleware).

## 9. Case Portal transition (when `portal.image3dconversion.com` goes live)
Until the portal is live, keep it **text-only** (no links). Once deployed, update:
1. `src/content/site.ts` → `portal.loginUrl` / `portal.startCaseUrl` → the live `https://portal.image3dconversion.com/...` URLs.
2. CTA destinations flow from `portal.*` via `cta-routes.ts` → "Open Case Portal" / "Start a case" then point to the live portal automatically.
3. CMS → *Contact settings* → update **Case Portal availability line** from "will be available at…" to a live-access message, and adjust the support-direction wording.
4. Re-run the smoke test on the portal CTAs.

## 10. Remaining before a clean production launch
Legal (Privacy/Terms copy), a 1200×630 OG image, Zoho field mapping + credentials, and future testimonials/case evidence — see `LAUNCH_CHECKLIST.md`. None block a Vercel **preview** deploy; the OG image + legal copy are advisable before the **public** launch.
