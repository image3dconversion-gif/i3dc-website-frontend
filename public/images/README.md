# public/images

Only **optimised, approved, de-identified** web-ready images belong here. Raw
photos stay in `assets-source/`; source documents stay in `docs/handoff/`.

Before a file lands in this folder it must pass the checklist in
`docs/handoff/IMAGE_ASSET_AUDIT.md §6`:

1. Consent + de-identification confirmed; owner and review date logged.
2. Orientation fixed; off-journey branding / patient-identifier bands cropped.
3. Aspect ratios normalised (hero ≥2,400px wide; case cards a consistent 4:3/16:10).
4. Exported as responsive AVIF/WebP + fallback, with explicit width/height.
5. Descriptive filename + factual alt text that matches the final image.

**Never place a file here that contains a patient name, ID, DOB, scan metadata
or portal identifier.** Two raw renders are already flagged for burned-in
patient names — see the audit's PII register.

Folders map to asset categories used by the content layer:
`founder, cases, planning, guides, full-arch, portal, workshops, partners,
global-practice, office-lab, logos`.
