/**
 * Global site identity and immutable governance constants.
 * Source: Website Strategy Blueprint v1.2 + Homepage Content v1.2.
 *
 * NOTE ON CLAIMS: Do not add scale numbers (cases, dentists, years, active
 * users), turnaround promises, security/HIPAA statements, or partner names
 * here until each passes the evidence gate (definition + source + owner +
 * review date). This file is intentionally claim-free.
 */

export const site = {
  name: "Image3DConversion",
  shortName: "I3DC",
  descriptor: "The Digital Workflow Partner for Guided Implantology",
  northStar: "Plan the outcome. Guide the execution.",
  footerLine:
    "Digital implant planning, surgical guide workflows and case coordination for dental professionals.",
  professionalNotice:
    "Image3DConversion works with dental professionals and authorised workflow partners. Patients should consult their treating dentist.",
  // Public marketing origin. The authenticated Case Portal lives elsewhere and
  // is intentionally NOT built in this project.
  url: "https://www.image3dconversion.com",
  locale: "en",
} as const;

/**
 * Controlled positioning language. India-based + globally reachable + remote-
 * first, WITHOUT foregrounding a specific city/region (per founder direction:
 * do not prominently publish Guwahati / Assam / North East as brand identity).
 * Any legally-required registered address stays in future Terms/Privacy copy
 * only — never used as homepage/footer brand positioning.
 */
export const positioning = {
  base: "India-based digital implant workflow team",
  reach: "Serving practices across India and international partner workflows",
  model: "Remote-first planning and guide workflow support",
} as const;

/**
 * Contact routing. WORDING ONLY — real email/phone/WhatsApp values are pending
 * founder approval and must NOT be invented. When approved, set the values
 * below and the UI reveals them automatically; until then the UI shows the
 * routing wording with a "details on request" state.
 */
export const contact = {
  enquiriesLabel: "General & workflow enquiries",
  discussHint: "Tell us your case type and workflow — no patient records on the public site.",
  portalHint: "For existing cases, use the Case Portal.",
  // TODO(founder): provide approved public business values. Keep null until then.
  email: null as string | null,
  phone: null as string | null,
  whatsapp: null as string | null,
} as const;

/**
 * The authenticated Case Portal is a SEPARATE application. The public website
 * only links to it. These are placeholders until the portal team confirms the
 * production login/registration URLs (Blueprint §14 decision gate).
 */
export const portal = {
  // TODO(portal-lead): replace with tested production URLs before launch.
  loginUrl: "/case-portal/",
  startCaseUrl: "/case-portal/",
  label: "Case Portal",
} as const;
