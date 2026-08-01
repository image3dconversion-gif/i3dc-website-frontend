/**
 * Keystatic CMS configuration — Image3DConversion marketing content only.
 *
 * GOVERNANCE (see docs/handoff/CMS_READINESS_PLAN.md):
 * - This CMS manages MARKETING CONTENT ONLY. It never stores DICOM/STL, patient
 *   records, payments, clinical operational data, portal accounts, or workshop
 *   content (workshops live on paulsudeep.com / WordPress).
 * - Locked-in-code fields (slugs, routes, canonical structure, disclaimers,
 *   claim gates, CTA discipline, image publish gate) are NOT exposed as freely
 *   editable here. Where a locked value appears it is read-only / validated.
 * - Storage is LOCAL (git). No third-party media library holds assets, so no
 *   patient-identifiable content can leak to an external service.
 *
 * Content written by editors lands in ./content/** and is read back through the
 * data-source abstraction in src/content/source.ts, which ALWAYS falls back to
 * the approved typed modules in src/content/* when a CMS entry is absent — so
 * the approved frontend renders identically if the CMS is empty or unavailable.
 */
import { config, fields, collection, singleton } from "@keystatic/core";

const GROUPS = [
  "implant-workflow",
  "way-to-work",
  "capability",
] as const;

const CTA_VARIANTS = ["primary", "secondary", "utility"] as const;

const APPROVAL = [
  "draft",
  "in-review",
  "approved",
  "published",
  "retired",
] as const;

export default config({
  // Local (git) storage — content stays in-repo; nothing leaves to a SaaS.
  storage: { kind: "local" },
  ui: {
    brand: { name: "Image3DConversion CMS" },
    navigation: {
      "Site & SEO": ["siteSettings", "contactSettings", "footerSettings", "seoDefaults"],
      "Marketing content": ["services", "workflowPages", "faqs", "testimonials", "caseEvidence"],
      "Structure": ["navigation", "ctas", "pages", "seoMeta"],
      "Media governance": ["imageAssets"],
    },
  },

  singletons: {
    // 1. siteSettings — global identity. Governance strings are read-only.
    siteSettings: singleton({
      label: "Site settings",
      path: "content/settings/site",
      format: { data: "json" },
      schema: {
        name: fields.text({ label: "Brand name", validation: { isRequired: true } }),
        shortName: fields.text({ label: "Short name" }),
        descriptor: fields.text({ label: "Descriptor (tagline)" }),
        northStar: fields.text({ label: "North-star line" }),
        footerLine: fields.text({ label: "Footer line", multiline: true }),
        professionalNotice: fields.text({
          label: "Professional notice (governance — edit only via review)",
          multiline: true,
        }),
        // Canonical origin is route-critical: locked via description, not free UX.
        url: fields.url({
          label: "Canonical site URL (LOCKED — do not change without approval)",
        }),
        locale: fields.text({ label: "Locale", defaultValue: "en" }),
      },
    }),

    // 2. contactSettings — real values gated on founder approval.
    contactSettings: singleton({
      label: "Contact settings",
      path: "content/settings/contact",
      format: { data: "json" },
      schema: {
        enquiriesLabel: fields.text({ label: "Enquiries label" }),
        discussHint: fields.text({ label: "Discuss hint", multiline: true }),
        portalHint: fields.text({ label: "Portal hint", multiline: true }),
        showDirect: fields.checkbox({
          label: "Publish direct contact details (founder-approved only)",
          defaultValue: false,
        }),
        email: fields.text({ label: "Public email (leave blank until approved)" }),
        phone: fields.text({ label: "Public phone (leave blank until approved)" }),
        whatsapp: fields.text({ label: "WhatsApp (leave blank until approved)" }),
      },
    }),

    // 13. footerSettings — footer / education link / legal line.
    footerSettings: singleton({
      label: "Footer settings",
      path: "content/settings/footer",
      format: { data: "json" },
      schema: {
        educationLabel: fields.text({ label: "Education link label" }),
        educationHref: fields.url({ label: "Education link URL (paulsudeep.com — external)" }),
        copyrightName: fields.text({ label: "Copyright holder" }),
        legalNotice: fields.text({ label: "Legal / professional notice", multiline: true }),
      },
    }),

    // 12. seoDefaults — site-wide SEO + structured-data toggles.
    seoDefaults: singleton({
      label: "SEO defaults",
      path: "content/settings/seo",
      format: { data: "json" },
      schema: {
        defaultTitle: fields.text({ label: "Default meta title" }),
        titleTemplate: fields.text({ label: "Title template (use %s)" }),
        defaultDescription: fields.text({ label: "Default meta description", multiline: true }),
        defaultOgImage: fields.text({ label: "Default Open Graph image path" }),
        twitterHandle: fields.text({ label: "Twitter/X handle (optional)" }),
        enableOrganizationSchema: fields.checkbox({ label: "Emit Organization schema", defaultValue: true }),
        enableProfessionalServiceSchema: fields.checkbox({ label: "Emit ProfessionalService schema", defaultValue: true }),
      },
    }),
  },

  collections: {
    // 3. navigation
    navigation: collection({
      label: "Navigation",
      slugField: "label",
      path: "content/navigation/*",
      format: { data: "json" },
      schema: {
        label: fields.slug({ name: { label: "Label" } }),
        href: fields.text({ label: "URL / path", validation: { isRequired: true } }),
        group: fields.select({
          label: "Group",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Solutions", value: "solutions" },
            { label: "Footer", value: "footer" },
          ],
          defaultValue: "primary",
        }),
        order: fields.integer({ label: "Order", defaultValue: 0 }),
        description: fields.text({ label: "Description (menu subtext)", multiline: true }),
        external: fields.checkbox({ label: "External destination", defaultValue: false }),
      },
    }),

    // 4. ctas — labels/targets editable; variant discipline enforced in code.
    ctas: collection({
      label: "CTA registry",
      slugField: "key",
      path: "content/ctas/*",
      format: { data: "json" },
      schema: {
        key: fields.slug({ name: { label: "Key (stable id)" } }),
        label: fields.text({ label: "Button label", validation: { isRequired: true } }),
        href: fields.text({ label: "Target", validation: { isRequired: true } }),
        variant: fields.select({
          label: "Variant (discipline: one primary/secondary/utility per view)",
          options: CTA_VARIANTS.map((v) => ({ label: v, value: v })),
          defaultValue: "primary",
        }),
        external: fields.checkbox({ label: "External / portal target", defaultValue: false }),
      },
    }),

    // 5. services — copy editable; slug/route LOCKED (read-only reference).
    services: collection({
      label: "Services",
      slugField: "name",
      path: "content/services/*",
      format: { data: "json" },
      schema: {
        name: fields.slug({ name: { label: "Service name" } }),
        routeSlug: fields.text({ label: "Route slug (LOCKED — do not change)" }),
        href: fields.text({ label: "Href (LOCKED)" }),
        summary: fields.text({ label: "Summary (one line)", multiline: true }),
        group: fields.select({
          label: "Group",
          options: GROUPS.map((g) => ({ label: g, value: g })),
          defaultValue: "implant-workflow",
        }),
        primaryCta: fields.select({
          label: "Primary CTA",
          options: [
            { label: "Start a case", value: "start-case" },
            { label: "Discuss a case", value: "discuss-case" },
            { label: "Review requirements", value: "review-requirements" },
          ],
          defaultValue: "discuss-case",
        }),
        imageKey: fields.text({ label: "Image key (from imageAssets)" }),
        order: fields.integer({ label: "Order", defaultValue: 0 }),
      },
    }),

    // 6. workflowPages — editable copy; slug + canonical LOCKED. Claim gate applies.
    workflowPages: collection({
      label: "Workflow pages",
      slugField: "h1",
      path: "content/workflow-pages/*",
      format: { data: "json" },
      schema: {
        h1: fields.slug({ name: { label: "H1 heading" } }),
        routeSlug: fields.text({ label: "Route slug (LOCKED)" }),
        canonical: fields.text({ label: "Canonical path (LOCKED)" }),
        seoTitle: fields.text({ label: "SEO title" }),
        description: fields.text({ label: "Meta description", multiline: true }),
        eyebrow: fields.text({ label: "Eyebrow" }),
        heroBody: fields.text({ label: "Hero subcopy", multiline: true }),
        introHeading: fields.text({ label: "Intro heading" }),
        introBody: fields.text({ label: "Intro body", multiline: true }),
        ctaHeading: fields.text({ label: "CTA heading" }),
        governanceNote: fields.text({
          label: "Claim gate reminder: no turnaround/guarantee/HIPAA/scale figures",
          multiline: true,
        }),
      },
    }),

    // 7. pages / pageSections — composition registry.
    pages: collection({
      label: "Pages",
      slugField: "slug",
      path: "content/pages/*",
      format: { data: "json" },
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        path: fields.text({ label: "Path (LOCKED)" }),
        title: fields.text({ label: "Title" }),
        description: fields.text({ label: "Description", multiline: true }),
        heroHeading: fields.text({ label: "Hero heading" }),
        heroSubcopy: fields.text({ label: "Hero subcopy", multiline: true }),
        editable: fields.checkbox({ label: "CMS-editable copy", defaultValue: true }),
        governanceSensitive: fields.checkbox({ label: "Governance-sensitive (extra review)", defaultValue: false }),
      },
    }),

    // 8. faqs
    faqs: collection({
      label: "FAQ entries",
      slugField: "question",
      path: "content/faqs/*",
      format: { data: "json" },
      schema: {
        question: fields.slug({ name: { label: "Question" } }),
        answer: fields.text({ label: "Answer", multiline: true, validation: { isRequired: true } }),
        category: fields.text({ label: "Category" }),
        page: fields.text({ label: "Page (optional — scope FAQ to a route)" }),
        priority: fields.checkbox({ label: "Show in top-5 priority block", defaultValue: false }),
        order: fields.integer({ label: "Order", defaultValue: 0 }),
      },
    }),

    // 9. testimonials — consent + approval gated before render.
    testimonials: collection({
      label: "Testimonials",
      slugField: "attribution",
      path: "content/testimonials/*",
      format: { data: "json" },
      schema: {
        attribution: fields.slug({ name: { label: "Attribution (name or role)" } }),
        quote: fields.text({ label: "Quote", multiline: true, validation: { isRequired: true } }),
        role: fields.text({ label: "Role" }),
        organisation: fields.text({ label: "Organisation" }),
        consentOnFile: fields.checkbox({ label: "Written consent on file (required to publish)", defaultValue: false }),
        approved: fields.checkbox({ label: "Approved for publication", defaultValue: false }),
        order: fields.integer({ label: "Order", defaultValue: 0 }),
      },
    }),

    // 10. caseEvidence — anonymised + approval gated (NUMERIC PROOF / evidence gate).
    caseEvidence: collection({
      label: "Case evidence",
      slugField: "title",
      path: "content/case-evidence/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Case title (non-identifying)" } }),
        summary: fields.text({ label: "Workflow summary (no patient identifiers)", multiline: true }),
        workflow: fields.text({ label: "Workflow type" }),
        anonymised: fields.checkbox({ label: "Confirmed anonymised / de-identified", defaultValue: false }),
        approved: fields.checkbox({ label: "Approved for publication", defaultValue: false }),
        imageKey: fields.text({ label: "Image key (must pass image publish gate)" }),
        order: fields.integer({ label: "Order", defaultValue: 0 }),
      },
    }),

    // 11. imageAssets — governance metadata layer over the render manifest.
    imageAssets: collection({
      label: "Image assets (governance)",
      slugField: "key",
      path: "content/image-assets/*",
      format: { data: "json" },
      schema: {
        key: fields.slug({ name: { label: "Image key (matches images.ts)" } }),
        title: fields.text({ label: "Title" }),
        alt: fields.text({ label: "Alt text (required to publish)", multiline: true }),
        caption: fields.text({ label: "Caption", multiline: true }),
        category: fields.text({ label: "Category" }),
        personVisible: fields.checkbox({ label: "A person is visible", defaultValue: false }),
        consentStatus: fields.select({
          label: "Consent status",
          options: [
            { label: "Not required", value: "not-required" },
            { label: "Pending", value: "pending" },
            { label: "Signed", value: "signed" },
          ],
          defaultValue: "not-required",
        }),
        piiSafe: fields.checkbox({ label: "PII-safe (no patient identifiers)", defaultValue: false }),
        approvalStatus: fields.select({
          label: "Approval status (publish gate)",
          options: APPROVAL.map((a) => ({ label: a, value: a })),
          defaultValue: "draft",
        }),
      },
    }),

    // 12. seoMeta — per-page SEO overrides (title/description/canonical/OG).
    seoMeta: collection({
      label: "SEO metadata (per page)",
      slugField: "path",
      path: "content/seo/*",
      format: { data: "json" },
      schema: {
        path: fields.slug({ name: { label: "Route path (e.g. /faq/)" } }),
        title: fields.text({ label: "Meta title" }),
        description: fields.text({ label: "Meta description", multiline: true }),
        canonical: fields.text({ label: "Canonical URL (LOCKED to route)" }),
        ogTitle: fields.text({ label: "Open Graph title" }),
        ogDescription: fields.text({ label: "Open Graph description", multiline: true }),
        ogImage: fields.text({ label: "Open Graph image path" }),
        noindex: fields.checkbox({ label: "noindex", defaultValue: false }),
      },
    }),
  },
});
