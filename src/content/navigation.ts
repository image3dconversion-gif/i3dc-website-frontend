/**
 * Site navigation — primary nav, the Solutions mega-menu, and the footer.
 * Source: Homepage v1.2 §3 (header) + Blueprint v1.2 §3 (sitemap & footer).
 *
 * Discrepancy note: the Frontend Handoff Summary v1.0 lists a slightly
 * different primary nav ("Guided Surgery / Full Arch / Partners / Contact").
 * The v1.2 documents are the authoritative, latest versions and are used here.
 * See IMAGE_ASSET_AUDIT.md §1.7.
 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

/** Primary header navigation (left of the persistent actions). */
export const primaryNav: NavLink[] = [
  { label: "Solutions", href: "/digital-implant-workflows/" },
  { label: "How It Works", href: "/how-it-works/" },
  { label: "Case Workflows", href: "/case-evidence/" },
  { label: "For Partners", href: "/white-label-workflow-partner/" },
  { label: "About", href: "/about/" },
];

/** Grouped "Solutions" menu (Blueprint §3). */
export const solutionsMenu: NavGroup[] = [
  {
    label: "Implant workflows",
    links: [
      {
        label: "Guided Implant Workflow",
        href: "/guided-implant-workflow/",
        description: "Single & multiple implant cases, restoration-led.",
      },
      {
        label: "Full-Arch Stackable Workflow",
        href: "/full-arch-stackable-workflow/",
        description: "Reduction, placement, MUA and provisional in sequence.",
      },
      {
        label: "Zygoma & Pterygoid Planning",
        href: "/zygoma-pterygoid-planning/",
        description: "Advanced anchorage where anatomy and restoration must agree.",
      },
      {
        label: "Immediate-Loading Workflow",
        href: "/immediate-loading-workflow/",
        description: "Align plan, guide and provisional before surgery.",
      },
    ],
  },
  {
    label: "Ways to work with us",
    links: [
      {
        label: "Case Data & Diagnostic Preparation",
        href: "/case-data-preparation/",
        description: "DICOM/STL, segmentation and scan alignment.",
      },
      {
        label: "Design-Only Workflow",
        href: "/design-only-workflow/",
        description: "Reviewed, ready-to-print files for your own production.",
      },
      {
        label: "Design-to-Delivery Workflow",
        href: "/design-to-delivery/",
        description: "One coordinated path from case data to delivery.",
      },
      {
        label: "White-Label Workflow Partnership",
        href: "/white-label-workflow-partner/",
        description: "Capacity behind your lab, DSO or practice network.",
      },
    ],
  },
];

/** Footer columns (Blueprint §3 / Homepage §5). */
export const footerNav: NavGroup[] = [
  {
    label: "Clinical workflows",
    links: [
      { label: "Guided Implant", href: "/guided-implant-workflow/" },
      { label: "Full-Arch Stackable", href: "/full-arch-stackable-workflow/" },
      { label: "Zygoma & Pterygoid", href: "/zygoma-pterygoid-planning/" },
      { label: "Immediate Loading", href: "/immediate-loading-workflow/" },
    ],
  },
  {
    label: "Ways to work",
    links: [
      { label: "Design Only", href: "/design-only-workflow/" },
      { label: "Design to Delivery", href: "/design-to-delivery/" },
      { label: "White-Label Partnership", href: "/white-label-workflow-partner/" },
      { label: "Case Portal", href: "/case-portal/" },
    ],
  },
  {
    label: "Case support",
    links: [
      { label: "How It Works", href: "/how-it-works/" },
      { label: "Case Requirements", href: "/case-requirements/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Discuss a Complex Case", href: "/discuss-a-case/" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "/about/" },
      { label: "Case Workflows", href: "/case-evidence/" },
      { label: "Privacy", href: "/privacy/" },
      { label: "Terms", href: "/terms/" },
    ],
  },
];

/** Education is an EXTERNAL destination — it must leave the I3DC journey. */
export const educationLink: NavLink = {
  label: "SurgiGuideExcellence at PaulSudeep.com",
  href: "https://www.paulsudeep.com",
};
