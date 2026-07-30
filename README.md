# Image3DConversion — Public Website (Frontend)

The public marketing website for Image3DConversion: a digital dentistry
workflow-infrastructure company. It explains the guided-implant digital
workflow, routes dentists to the right service, and links to the authenticated
**Case Portal** — a **separate application** that this project does **not**
implement.

- **Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4
- **Dev port:** **3001**
- **Design direction:** Blue + White, white-led, premium clinical. One master
  blue (`#2F4678`, sampled from the master logo), no decorative third accent.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3001
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build on :3001
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Boundaries (do not cross)

This is a **public B2B marketing site**. It must **not** implement:

- clinical file upload (DICOM/STL/photos) — those go through the Case Portal;
- patient data intake, authenticated case tracking, approvals, finance, or any
  internal operations screen;
- unsupported claims (accuracy %, guaranteed fit/timelines, HIPAA/security,
  scale numbers, worldwide reach, named partners) until they pass the evidence
  gate documented in the content pack.

The public site **explains and links to** the Case Portal — nothing more.

## Structure

```
docs/handoff/            Handoff summary, source DOCX/MD, IMAGE_ASSET_AUDIT.md
assets-source/           Raw, unoptimised photos (NOT web-ready)
public/images/           Approved, de-identified, optimised web assets only
src/
  app/                   Routes (App Router). Homepage + navigable page stubs.
  components/
    layout/              Header, Footer, StubPage
    ui/                  Button, Container, Section, Eyebrow, ImagePlaceholder
    sections/            Homepage section compositions (Hero, WorkflowCards…)
  content/               Content-driven data: site, navigation, cta-routes,
                         page-stubs, pages/*  (visitor copy, no internal notes)
  styles/tokens.css      Design tokens — single source of truth
```

## Design system

- Tokens live in `src/styles/tokens.css` and are bound to Tailwind utilities in
  `src/app/globals.css` (`@theme inline`).
- Preview everything at **`/design-system`** (noindex).
- Typography: **Bricolage Grotesque** (display 600) + **Lato** (body 400/700),
  loaded via `next/font`.

## Content & images

- Page copy is extracted from the approved content pack into `src/content/` —
  **visitor-facing copy only**; internal handoff notes are never rendered.
- Images are handled through `ImagePlaceholder` until an approved,
  de-identified asset exists. See **`docs/handoff/IMAGE_ASSET_AUDIT.md`** —
  including the PII register (two raw renders contain burned-in patient names).

## Release order (Blueprint §14)

Release 1 (service journey): Home · Solutions hub · Guided · Full-Arch · Zygoma
& Pterygoid · How It Works · Case Requirements · About · Discuss a Case · Case
Portal gateway · Privacy · Terms. Release 2 deepens commercial fit; Release 3
consolidates SEO/legacy redirects.

### Current build status

**Built (full pages):** Home, Digital Implant Workflows (Services), Guided
Implant, Full-Arch Stackable, Zygoma & Pterygoid, Immediate-Loading, Case Data
& Diagnostic Preparation, Design-Only, Design-to-Delivery, White-Label
Partnership, Global Practices, Case Requirements, Case Evidence, How It Works,
About, Discuss a Case (public enquiry form — no upload), Case Portal (public
explainer with an abstract, dummy-data illustration), FAQ. Plus `/design-system`
(noindex).

**Intentional placeholders:** `/privacy/` and `/terms/` — legal wording is held
for the privacy/legal owner (not fabricated).

Mobile navigation is a hamburger drawer (`components/layout/MobileNav.tsx`).
Verify visuals with `node scripts/screenshot-final.mjs`, links with
`node scripts/linkcheck.mjs` (dev/prod server must be running).
