# Image3DConversion Website Frontend Handoff Summary v1.0

Date: 2026-07-28
Owner: Sudeep Paul / Image3DConversion
Purpose: Give Claude Code a clean frontend-programming summary from the generated website content pack.

## 1. Current Development Status

The Image3DConversion public website content system has been developed as a structured content and design handoff pack. The pack separates:

- Publishable visitor-facing copy.
- Internal implementation guidance for frontend, design, SEO and routing.
- Publication controls to prevent unsupported claims, public clinical-upload routes, and confusion between the public website and authenticated Case Portal.

The approved public direction is Blue + White, globally credible, operational, and workflow-led. The website should feel like a digital dentistry workflow infrastructure company, not a generic dental-service brochure.

## 2. Authoritative Governance Documents

Claude Code should read these first before programming pages:

1. `Image3DConversion_Master_Content_Strategy_v1.0.docx`
   - Master content strategy, positioning, claim controls, audience logic, CTA discipline and publication rules.

2. `Image3DConversion_Website_Strategy_Blueprint_v1.2.docx`
   - Current website blueprint and strategic structure. Use v1.2 as the active version.

3. `Image3DConversion_Blueprint_01_Homepage_Global_Shell.md`
   - Homepage/global shell implementation guidance. Use as the frontend layout spine.

4. `Image3DConversion_Homepage_Content_Design_Psychology_v1.2.docx`
   - Current homepage content and design psychology. Use v1.2 as active.

## 3. Developed Page Documents

Use the latest version when duplicates exist.

| Page / Area | Active Document | Purpose |
| --- | --- | --- |
| Homepage | `Image3DConversion_Homepage_Content_Design_Psychology_v1.2.docx` | Main public entry, global positioning, service routing and visual standard. |
| Guided Implant Workflow | `Image3DConversion_Guided_Implant_Workflow_Content_Design_Psychology_v1.1.docx` | Guided implant planning/design service page. |
| Full-Arch Stackable Workflow | `Image3DConversion_Full_Arch_Stackable_Workflow_Content_Design_Psychology_v1.1.docx` | Full-arch stackable/sequential guide workflow page. |
| Zygoma & Pterygoid Planning | `Image3DConversion_Zygoma_Pterygoid_Planning_Content_Design_Psychology_v1.0.docx` | Advanced implant planning page. |
| Immediate Loading Prosthetic Workflow | `Image3DConversion_Immediate_Loading_Prosthetic_Workflow_Content_Design_Psychology_v1.0.docx` | Immediate-loading and prosthetic workflow page. |
| Case Data / Diagnostic Preparation | `Image3DConversion_Case_Data_Diagnostic_Preparation_Content_Design_Psychology_v1.0.docx` | Records and diagnostic-readiness page. |
| Design-Only Workflow | `Image3DConversion_Design_Only_Workflow_Content_Design_Psychology_v1.0.docx` | Global/local-production route: I3DC designs, practice/lab produces locally. |
| Design-to-Delivery Workflow | `Image3DConversion_Design_to_Delivery_Workflow_Content_Design_Psychology_v1.0.docx` | Coordinated design-to-delivery route. |
| Global Practice Workflows | `Image3DConversion_Global_Practice_Workflows_Content_Design_Psychology_v1.0.docx` | International collaboration, remote review, local production, cross-border practice fit. |
| White-Label Workflow Partnership | `Image3DConversion_White_Label_Workflow_Partnership_Content_Design_Psychology_v1.0.docx` | Partner/lab/DSO/implant-company workflow support page. |
| Case Portal Page | `Image3DConversion_Case_Portal_Page_Content_Design_Psychology_v1.0.docx` | Public explanation of the authenticated Case Portal. |
| About Image3DConversion | `Image3DConversion_About_Page_Content_Design_Psychology_v1.0.docx` | Company credibility, founder-led story and ecosystem positioning. |
| Contact / Discuss a Case | `Image3DConversion_Contact_Discuss_a_Case_Content_Design_Psychology_v1.0.docx` | Public enquiry route. Must not collect clinical files. |
| How It Works / Workflow Overview | `Image3DConversion_How_It_Works_Workflow_Overview_Content_Design_Psychology_v1.0.docx` | Website workflow-orientation page and navigation bridge. |
| FAQ / Practice Questions | `Image3DConversion_FAQ_Practice_Questions_Content_Design_Psychology_v1.0.docx` | Absolute-attention FAQ, reducing dentist hesitation before enquiry or portal use. |

## 4. Recommended Frontend Storage Structure

Store the website implementation in a clean frontend repository or app folder, separate from the generated DOCX handoff files.

Recommended local structure for Claude Code:

```text
i3dc-website-frontend/
  docs/
    handoff/
      I3DC_Website_Claude_Code_Frontend_Handoff_Summary_v1.0.md
      source-documents/
        [all active DOCX and MD handoff files]
  src/
    app/
      page.tsx
      services/
      workflows/
      global-practices/
      partners/
      case-portal/
      about/
      contact/
      how-it-works/
      faq/
    components/
      layout/
      sections/
      workflow/
      cta/
      cards/
      forms/
    content/
      pages/
      services/
      navigation.ts
      cta-routes.ts
    assets/
      images/
        founder/
        cases/
        planning/
        guides/
        portal/
        workshops/
        partners/
      video/
      icons/
    styles/
      tokens.css
      globals.css
```

If using Next.js, the frontend source should live in `i3dc-website-frontend/`. The generated documents should stay in `docs/handoff/source-documents/` and should not be mixed into `src/`.

## 5. Suggested Website Navigation

Primary navigation:

- Home
- Workflows
- Guided Surgery
- Full Arch
- Global Practices
- Partners
- Case Portal
- About
- Contact

Recommended workflow dropdown:

- How It Works
- Case Data / Diagnostic Preparation
- Guided Implant Workflow
- Full-Arch Stackable Workflow
- Zygoma & Pterygoid Planning
- Immediate Loading Prosthetic Workflow
- Design-Only Workflow
- Design-to-Delivery Workflow

Footer should include:

- Workflows
- Case Portal
- Global Practices
- White-Label Partnership
- FAQ
- Contact / Discuss a Case
- Legal/privacy pages when available

## 6. Frontend Build Priorities

Build in this order:

1. Global design system
   - Blue + White palette.
   - Inter typography unless existing brand system overrides it.
   - Restrained, premium, clinical-technology feel.
   - Avoid purple gradients, beige/tan, generic medical stock style and decorative blobs.

2. Homepage/global shell
   - Use `Image3DConversion_Blueprint_01_Homepage_Global_Shell.md`.
   - Route visitors by workflow need, not by generic service categories.

3. Workflow overview and service pages
   - Build reusable page sections: hero, workflow steps, evidence block, visual direction block, CTA band, FAQ preview.

4. Case Portal public page
   - Public page explains portal value only.
   - No public DICOM/STL/photo upload.
   - Authenticated case submission stays separate.

5. Contact / Discuss a Case
   - General enquiry form only.
   - Use route selector: Start a case, discuss workflow, global practice, partnership, support.
   - If clinical records are needed, CTA should route to Case Portal login/sign-up.

6. FAQ
   - Put top anxiety questions first.
   - Group by Starting a Case, Guided Surgery, Design-Only, Design-to-Delivery, Global Practices, Case Portal and Pricing Discussion.

## 7. Content Extraction Guidance for Claude Code

Each DOCX contains two layers:

- Publishable visitor copy: this becomes page content.
- Internal handoff notes: these guide design, SEO, mobile behaviour, CTA routing and publication controls.

Claude Code should not paste internal notes into the public UI. Internal sections are for implementation discipline only.

Use the DOCX files to populate structured content files, for example:

```text
src/content/pages/home.ts
src/content/pages/how-it-works.ts
src/content/pages/case-portal.ts
src/content/pages/contact.ts
src/content/pages/faq.ts
src/content/services/guided-implant.ts
src/content/services/full-arch.ts
src/content/services/zygoma-pterygoid.ts
src/content/services/immediate-loading.ts
src/content/services/design-only.ts
src/content/services/design-to-delivery.ts
```

## 8. Photos and Visual Assets to Collect

Create one shared asset folder before frontend build:

```text
assets-source/
  founder/
  team/
  clinical-workflow/
  planning-screens/
  surgical-guides/
  printed-guides/
  full-arch-stackable/
  zygoma-pterygoid/
  case-portal-ui/
  workshops-training/
  partner-logos/
  global-practice/
  office-lab/
```

### Must-Collect Photos

| Asset Type | What to Collect | Use |
| --- | --- | --- |
| Founder photos | Clean professional photos of Sudeep Paul, speaking/mentoring photos, neutral portrait | Homepage credibility, About page, founder note. |
| Team/workflow photos | Planning desk, review screen, team discussion, operations desk | About, How It Works, workflow credibility. |
| Planning screenshots | BlueSkyPlan-style planning, implant plan, guide design, restoration-first planning overlays | Homepage, guided implant, full-arch, zygoma/pterygoid pages. |
| Surgical guide photos | Clear guide close-ups, guide on model, printed guide, stackable guide components | Service pages and hero/support visuals. |
| Full-arch assets | Pin guide, bone reduction guide, implant guide, MUA guide, prosthesis pickup or model images | Full-Arch Stackable Workflow page. |
| Zygoma/pterygoid visuals | Planning screenshots, trajectory visuals, anatomical planning references without patient identity | Zygoma & Pterygoid page. |
| Immediate loading visuals | Temporary prosthesis workflow, planning-to-prosthetic visuals, model/prosthetic output | Immediate Loading page. |
| Portal screenshots | Dashboard, case listing, status visibility, upload area mock screenshots with no real patient data | Case Portal page. |
| Workshop photos | Teaching, hands-on guide design, live class, audience, certificates | About and trust sections. |
| Partner logos | BlueSkyPlan, AB Implant, Prevest Denpro and approved partners only with permission | Credibility strip, footer, partnership page. |
| Global workflow visuals | Dentist/lab collaboration, remote planning, file review, local production concept | Global Practice Workflows page. |

## 9. Photo Collection Rules

Use only images that are:

- High resolution and clear.
- Horizontally usable for hero sections when possible.
- Free from patient identifiers.
- Free from visible names, phone numbers, scans, medical records or unapproved case details.
- Clinically relevant to the exact page.
- Not dark, heavily filtered, blurred or generic stock-like.

Avoid:

- Random dental chair photos that do not show digital workflow.
- Abstract 3D medical graphics unless they are only background support.
- Patient-face clinical photos unless explicit written consent exists and the page truly needs them.
- Screenshots containing patient name, clinic name, phone number, scan ID or private file details.

## 10. Website Visual Direction

Preferred visual system:

- White or very light background.
- Deep blue / clinical blue accents.
- Clean workflow diagrams.
- Real planning screenshots and generated/approved 3D visuals.
- Clear surgical guide/product photography.
- Compact cards, radius 8px or less.
- No nested cards.
- Mobile-first sections with strong hierarchy.

Hero visuals should show the actual subject:

- Homepage: guided digital dentistry workflow, not abstract technology.
- Case Portal: portal UI mockup or authenticated workflow screenshot without patient data.
- Full Arch: stackable guide or full-arch planning image.
- Global Practice: remote collaboration and local production workflow.
- White Label: partner-branded workflow support, not anonymous business handshake stock.

## 11. Critical Boundaries

Claude Code must preserve these rules:

- Do not redesign the existing Case Portal architecture.
- Do not create public clinical-file upload forms.
- Do not expose authenticated screens in public sitemap.
- Do not claim HIPAA/security/compliance unless explicitly approved in the source docs.
- Do not promise clinical outcomes, guaranteed fit, guaranteed timelines or universal global availability.
- Do not confuse I3DC’s planning/design support with the treating clinician’s clinical responsibility.
- Use the Case Portal as the authenticated route for real case records, uploads, approvals and tracking.

## 12. Immediate Next Step for Claude Code

1. Create the frontend project folder.
2. Copy this handoff summary and active DOCX/MD files into `docs/handoff/source-documents/`.
3. Create the design tokens and global layout.
4. Build homepage from `Image3DConversion_Homepage_Content_Design_Psychology_v1.2.docx` and `Image3DConversion_Blueprint_01_Homepage_Global_Shell.md`.
5. Build reusable workflow/service page template.
6. Implement pages from the active document list above.
7. Add placeholder image slots using the asset categories until approved photos are collected.

## 13. Recommended Founder Folder Location

Store this handoff pack in the project repository at:

```text
i3dc-website-frontend/docs/handoff/
```

Store raw collected photos outside `src/` first:

```text
i3dc-website-frontend/assets-source/
```

Only optimized, approved web-ready images should move into:

```text
i3dc-website-frontend/public/images/
```

This keeps source documents, raw photos and production frontend assets cleanly separated.
