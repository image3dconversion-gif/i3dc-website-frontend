/**
 * Content for workflow / support detail pages. Copy source: Website Strategy
 * Blueprint v1.2 §6–7 (visitor copy + page briefs). No unsupported claims
 * (no turnaround numbers, guarantees, HIPAA, scale figures) — those stay gated.
 *
 * Each page carries operational depth: what the workflow protects (intro),
 * what to prepare and what we check (lists), where cases commonly stall
 * (commonErrors), when to discuss first (discussFirst) and common questions.
 */
import { WorkflowContent } from "@/components/sections/WorkflowPage";
import { img } from "@/content/images";
import { cta } from "@/content/cta-routes";

export interface WorkflowEntry extends WorkflowContent {
  seoTitle: string;
  description: string;
  canonical: string;
}

const startCase = { href: cta.startCase.href, external: true };

export const workflows: Record<string, WorkflowEntry> = {
  "guided-implant-workflow": {
    seoTitle: "Dental Implant Planning & Surgical Guide Design | I3DC",
    description:
      "Restoration-led implant planning and surgical guide support for single and multiple implant cases, with clinician review before production.",
    canonical: "/guided-implant-workflow/",
    eyebrow: "Guided implant workflow",
    h1: "Guided implant planning built around the planned restoration.",
    heroBody:
      "Restoration-led planning and surgical guide support for single and multiple implant cases. We coordinate data, plan and guide design, and share the plan for clinician review before production.",
    note: "Image3DConversion supports digital planning and workflow preparation. The treating clinician remains responsible for diagnosis, indication, consent and final approval.",
    primary: { label: "Start a Guided Implant Case", ...startCase },
    image: img.planFrontal,
    imageLabel: "Guided implant plan",
    intro: {
      h2: "What this workflow protects",
      body: "A guide is only as good as the plan behind it. This workflow protects the restorative result: the planned restoration is made visible first, then the implant position, guide support and drilling protocol are checked against it — so the guide serves the intended outcome, not the other way around.",
    },
    lists: [
      { title: "Cases this workflow fits", items: ["Single implant cases", "Multiple implant cases", "Tooth-, tissue- and bone-supported guides where applicable", "Restoration-led planning for routine placement"] },
      { title: "What the practice prepares", items: ["CBCT / DICOM dataset", "Intraoral or model scan", "Bite and prosthetic reference", "Implant system and prosthetic objective"] },
      { title: "What we review before production", items: ["File completeness and scan alignment", "Anatomy visibility", "Prosthetic reference and guide support", "Drilling protocol information"] },
      { title: "What the dentist reviews", items: ["Proposed implant position", "Guide concept", "Case-specific notes before approval"] },
      { title: "What the dentist receives", items: ["Planning files", "Guide design files", "Printed guide or associated components — by selected scope"] },
    ],
    gallery: {
      h2: "From plan to produced guide",
      body: "The restoration-led plan carried through to a produced, seated surgical guide.",
      items: [
        { image: img.pGuideSingleScan, caption: "Single-implant guide referenced to the scan model." },
        { image: img.pGuideFullArch, caption: "Full-arch guide with guided sleeves and fixation." },
        { image: img.pGuideInHand, caption: "Produced guide, checked in hand before dispatch." },
      ],
    },
    commonErrors: [
      "CBCT field of view too small to show the planned sites and adjacent anatomy",
      "Intraoral scan and CBCT that do not align",
      "No prosthetic reference, so the plan cannot be restoration-led",
      "Implant system or drill-kit not specified, delaying guide design",
    ],
    discussFirst:
      "the implant system is undecided, the restorative objective is still open, or the case combines guided placement with grafting or soft-tissue work that changes the sequence.",
    faq: [
      { q: "Pilot-guided or fully guided?", a: "Both can be supported depending on the case, the implant system and the drill-kit information provided. The guide concept is confirmed with you before production." },
      { q: "How do revisions work?", a: "Revision handling is part of the agreed review workflow. Revision scope and approval steps are confirmed before the case begins." },
      { q: "When does turnaround start?", a: "Production begins after complete data, confirmed scope and recorded approval. Timing is confirmed against the actual case, not a fixed promise." },
    ],
    ctaHeading: "Start a guided implant case.",
  },

  "full-arch-stackable-workflow": {
    seoTitle: "Full-Arch Stackable Surgical Guide Workflow | I3DC",
    description:
      "Coordinate bone reduction, implant placement, MUA positioning and provisional delivery through a planned full-arch stackable guide sequence.",
    canonical: "/full-arch-stackable-workflow/",
    eyebrow: "Full-arch stackable workflow",
    h1: "One planned sequence for full-arch surgery and provisional delivery.",
    heroBody:
      "A full-arch case is one sequence, not a collection of products. We coordinate the prosthetic objective, guide stack and approval gates so bone reduction, implant placement, MUA positioning and the provisional stay aligned.",
    primary: { label: "Discuss a Full-Arch Case", href: cta.discussCase.href },
    image: img.pStackableGuided,
    imageLabel: "Full-arch stackable sequence",
    heroCutout: true,
    intro: {
      h2: "What this workflow protects",
      body: "In a full-arch case, small mismatches compound across stages. This workflow protects the continuity between them: the prosthetic objective is fixed first, and every guide in the stack references it, so reduction, implant position, MUA plan and provisional all point at the same result.",
    },
    sequence: {
      h2: "The stackable sequence",
      body: "The prosthetic objective is established before the guide stack is finalised, so each stage references the intended result.",
      steps: ["Foundation / pin guide", "Bone reduction", "Osteotomy / implant guide", "MUA positioning", "Prosthetic pickup or delivery reference"],
    },
    lists: [
      { title: "Records by presentation", items: ["Dentate presentations", "Terminal dentition", "Edentulous presentations", "Prosthetic reference and smile setup where the outcome is patient-facing"] },
      { title: "Approval gates", items: ["Bone reduction plan", "Implant positions", "MUA plan", "Provisional design"] },
      { title: "What the dentist receives", items: ["Coordinated guide sequence", "Planning and design files", "Provisional / delivery reference — by selected scope"] },
    ],
    gallery: {
      h2: "The produced full-arch sequence",
      body: "One prosthetic objective, carried across the guide stack and into the delivered prosthesis.",
      items: [
        { image: img.pStackableGrey, caption: "Stackable guide system, shown layer by layer." },
        { image: img.pStackableMetalModel, caption: "Guide and metal framework seated on the model." },
        { image: img.pProsthesisOcclusion, caption: "Full-arch prosthesis verified in occlusion." },
      ],
    },
    commonErrors: [
      "Provisional or prosthetic objective not defined before the guide stack is built",
      "Records that do not capture the full arch and opposing dentition",
      "Foundation/pin strategy unclear, so the stack cannot be indexed reliably",
      "MUA direction decided too late to inform the implant plan",
    ],
    discussFirst:
      "the surgical sequence or provisional strategy is still being defined, or the case involves grafting, staged loading or a treatment team spread across locations.",
    notes: [
      "Same-day teeth are not promised. Immediate provisional delivery depends on the treatment team, components and the confirmed provisional workflow.",
    ],
    faq: [
      { q: "Do you support terminal-dentition and edentulous cases?", a: "Yes. Records differ by presentation; we confirm the exact records needed for dentate, terminal-dentition and edentulous cases before starting." },
      { q: "Are approval gates recorded?", a: "Yes — bone reduction, implant positions, MUA plan and provisional design each have a review and recorded approval before the workflow moves on." },
    ],
    ctaHeading: "Discuss a full-arch case.",
  },

  "zygoma-pterygoid-planning": {
    seoTitle: "Zygomatic & Pterygoid Implant Planning | I3DC",
    description:
      "Advanced digital planning support for zygomatic and pterygoid implant cases, coordinated around anatomy, restorative intent and clinician approval.",
    canonical: "/zygoma-pterygoid-planning/",
    eyebrow: "Zygoma & pterygoid planning",
    h1: "Advanced implant planning where anatomy and restoration must agree.",
    heroBody:
      "Planning and workflow support for qualified treating clinicians managing zygomatic and pterygoid cases, coordinated around anatomy, implant trajectory and the prosthetic plan.",
    note: "This is planning and workflow support for qualified treating clinicians. Digital planning does not remove the clinical risk of advanced surgery; diagnosis, indication, consent and execution remain with the treating team.",
    primary: { label: "Discuss an Advanced Case", href: cta.discussCase.href },
    image: img.pZygomaImplantPlan,
    imageLabel: "Anatomy & trajectory review",
    intro: {
      h2: "What this workflow protects",
      body: "Advanced anchorage cases live or die on the agreement between anatomy, trajectory and the intended prosthesis. This workflow protects that agreement by reviewing each as a distinct, documented stage — and by keeping responsibility and approval boundaries explicit for the treating team.",
    },
    sequence: {
      h2: "Distinct planning stages",
      steps: ["Anatomy review", "Implant trajectory", "Prosthetic reference", "Guide concept", "Recorded approval"],
    },
    lists: [
      { title: "Records that may be required", items: ["Extended field-of-view CBCT / DICOM", "Intraoral or model scans", "Prosthetic reference and smile setup", "Clinical context and professional leadership"] },
      { title: "What is coordinated", items: ["Anatomy and trajectory alignment", "Restorative intent against anatomy", "Guide concept where applicable", "Documented review and approval"] },
    ],
    gallery: {
      h2: "Produced models and guides",
      body: "Physical verification models and guides produced alongside advanced-anchorage planning.",
      items: [
        { image: img.pPrintedZygomaGuides, caption: "Printed zygomatic model with surgical guides." },
        { image: img.pPrintedBoneModels, caption: "Printed anatomical bone models for verification." },
      ],
    },
    commonErrors: [
      "Field of view that does not fully capture the zygomatic or pterygoid region",
      "Prosthetic intent not shared, so trajectory review lacks a target",
      "Unclear clinical leadership for a case that demands it",
      "Expecting a guide to substitute for surgical judgement",
    ],
    discussFirst:
      "always. Advanced cases should begin with a workflow conversation and a non-identifying summary before any records are submitted, so responsibility and scope are clear from the start.",
    faq: [
      { q: "Is this a clinical or a planning service?", a: "Planning and workflow support only, for qualified treating clinicians. It does not replace surgical judgement or remove clinical risk." },
      { q: "What imaging is needed?", a: "Typically an extended field-of-view CBCT plus scans and prosthetic reference. Exact records are confirmed during the case discussion." },
    ],
    ctaHeading: "Discuss an advanced case.",
  },

  "immediate-loading-workflow": {
    seoTitle: "Immediate-Loading Implant & Prosthetic Workflow | I3DC",
    description:
      "Coordinate the implant plan, surgical guide and immediate provisional references before the planned loading appointment.",
    canonical: "/immediate-loading-workflow/",
    eyebrow: "Immediate-loading workflow",
    h1: "Align the plan, the guide and the provisional before surgery.",
    heroBody:
      "Coordinate the approved implant plan, surgical guide and immediate provisional references so they stay aligned before the planned loading appointment.",
    primary: { label: "Review Immediate-Loading Requirements", href: "/case-requirements/" },
    image: img.muaGuide,
    imageLabel: "Plan · guide · provisional",
    intro: {
      h2: "What this workflow protects",
      body: "Immediate loading fails when the plan, the guide and the provisional drift apart. This workflow protects their alignment: smile reference, vertical dimension, occlusion and restorative space are agreed up front, and preoperative design, intraoperative pickup and the definitive restoration are kept as distinct stages — not merged into one promise.",
    },
    lists: [
      { title: "Prosthetic classification", items: ["FP1, FP2 and FP3 language clarified where it affects the design", "Restorative space and emergence", "Occlusion and vertical dimension"] },
      { title: "What must be approved first", items: ["Implant plan", "Guide concept", "Provisional reference — before guide and provisional production"] },
      { title: "What the dentist receives", items: ["Aligned plan and guide", "Provisional reference for the appointment", "Clear separation of preoperative and intraoperative stages"] },
    ],
    gallery: {
      h2: "Plan, guide and provisional as produced output",
      body: "The aligned guide and provisional references that support the loading appointment.",
      items: [
        { image: img.pGuideMetalArch, caption: "Metal-reinforced guide for the placement stage.", ratio: "1/1" },
        { image: img.pProsthesisOcclusion, caption: "Provisional verified in occlusion before delivery.", ratio: "1/1" },
        { image: img.pTemporaryProsthesis, caption: "Printed temporary prosthesis for the appointment.", ratio: "1/1", pad: "p-3" },
      ],
    },
    commonErrors: [
      "Provisional reference missing, so alignment cannot be confirmed before surgery",
      "Vertical dimension and occlusion not captured with the records",
      "Preoperative design and intraoperative pickup treated as one step",
      "Restorative space underestimated for the intended prosthesis",
    ],
    discussFirst:
      "the loading protocol, provisional type or aesthetic expectation is still being defined, or the surgical and restorative steps are handled by different providers.",
    faq: [
      { q: "Do you decide the loading protocol?", a: "No. The treating team decides loading suitability and protocol. We align the plan, guide and provisional references to support it." },
      { q: "What must be approved before production?", a: "The implant plan, guide concept and provisional reference are approved before guide and provisional production begin." },
    ],
    ctaHeading: "Review immediate-loading requirements.",
  },

  "case-data-preparation": {
    seoTitle: "DICOM to STL, CBCT Segmentation & Case Preparation | I3DC",
    description:
      "Prepare dental case data with DICOM-to-STL conversion, CBCT segmentation, scan alignment and diagnostic support for digital workflows.",
    canonical: "/case-data-preparation/",
    eyebrow: "Case data & diagnostic preparation",
    h1: "Reliable planning begins with usable case data.",
    heroBody:
      "DICOM handling, CBCT segmentation, intraoral and model scan use, and scan alignment — prepared so your case reaches a clean planning stage.",
    primary: { label: "Review File Requirements", href: "/case-requirements/" },
    image: img.planAnterior,
    imageLabel: "CBCT & scan data",
    intro: {
      h2: "What this step protects",
      body: "Most planning delays start with the data, not the design. Clean, aligned, complete records let planning begin on the first pass — so this step protects your timeline and the reliability of every decision that follows.",
    },
    lists: [
      { title: "What we prepare", items: ["DICOM handling and conversion", "CBCT segmentation", "IOS / model scan use", "Scan alignment"] },
      { title: "Accepted file types", items: ["DICOM", "STL", "Supporting JPG / PNG", "Other formats only after portal validation"] },
      { title: "What the dentist receives", items: ["Records confirmed usable for planning", "A clear list of anything missing", "A clean starting point for the selected workflow"] },
    ],
    commonErrors: [
      "Compressed or partial DICOM exports",
      "CBCT and intraoral scans that will not align",
      "Field of view that misses the planned region",
      "Scans with scatter or movement that obscure the anatomy",
    ],
    discussFirst:
      "you are unsure which records a specific workflow needs, or whether existing imaging is sufficient before repeating a scan.",
    notes: [
      "Technical data preparation is separate from radiology interpretation. Diagnostic interpretation remains a clinical responsibility of the treating or reporting professional.",
    ],
    faq: [
      { q: "Do you interpret the CBCT?", a: "No. We prepare and align data for planning. Radiological interpretation is a separate clinical responsibility of the treating or reporting professional." },
      { q: "What if a scan is not usable?", a: "We tell you exactly what is missing or misaligned before planning, so you can re-capture only what is needed." },
    ],
    ctaHeading: "Prepare your case data.",
  },

  "design-only-workflow": {
    seoTitle: "Dental Surgical Guide Design & Ready-to-Print STL | I3DC",
    description:
      "Receive reviewed, ready-to-print dental planning and guide files for production through your own validated printing workflow.",
    canonical: "/design-only-workflow/",
    eyebrow: "Design-only workflow",
    h1: "Expert design files for your own production workflow.",
    heroBody:
      "Reviewed, ready-to-print planning and guide files for practices and labs that keep production under their own control.",
    primary: { label: "Start a Design-Only Case", ...startCase },
    image: img.pGuideCadMesh,
    imageLabel: "Guide design (CAD)",
    heroCutout: true,
    intro: {
      h2: "What this workflow protects",
      body: "Design-only keeps you in control of production while removing the planning and design risk. It protects a clean handoff: you receive reviewed, ready-to-print files with a clear boundary on what remains a local production responsibility — so nothing is assumed on either side.",
    },
    lists: [
      { title: "What can be supplied", items: ["Reviewed planning files", "Guide design files", "Production-ready outputs where scope and record quality are confirmed"] },
      { title: "What the receiving team validates", items: ["Print orientation", "Material choice", "Printer calibration", "Post-processing, fit and device release"] },
      { title: "Before final file release", items: ["Confirmed scope and record quality", "Agreed revision rules", "Recorded approval"] },
    ],
    commonErrors: [
      "Assuming print settings or material are included when they are a local responsibility",
      "Records not clean enough for a reliable design pass",
      "Revision scope not agreed before release",
      "Local printer not validated for the guide geometry",
    ],
    discussFirst:
      "your production setup is new or unvalidated, or you are unsure which files your printer and workflow actually need.",
    notes: [
      "Print orientation, material, printer calibration, post-processing and device release remain production responsibilities of the local team unless explicitly included in scope.",
    ],
    faq: [
      { q: "Which files do I receive?", a: "The agreed file set for your workflow — typically reviewed planning and guide design files. The exact outputs are confirmed before the case begins." },
      { q: "Who is responsible for the print?", a: "The local team. Print orientation, material, calibration, post-processing, fit and device release remain your production responsibilities unless included in scope." },
    ],
    ctaHeading: "Start a design-only case.",
  },

  "design-to-delivery": {
    seoTitle: "Implant Planning, Guide Design & Delivery | I3DC",
    description:
      "Coordinate digital implant planning, guide design, production checks and delivery through one visible case workflow.",
    canonical: "/design-to-delivery/",
    eyebrow: "Design-to-delivery workflow",
    h1: "One coordinated path from case data to surgery-ready delivery.",
    heroBody:
      "Planning, guide design, production checks and delivery coordinated through one visible case — with scope confirmed before work begins.",
    primary: { label: "Start a Complete Workflow", ...startCase },
    image: img.printedGuideModel,
    imageLabel: "Produced guide",
    intro: {
      h2: "What this workflow protects",
      body: "When planning, production and delivery are handled by different hands, cases lose time in the gaps. This workflow protects the handoffs: one confirmed scope, one visible status, and documented checks at each stage — so responsibility never falls between steps.",
    },
    sequence: {
      h2: "The coordinated path",
      steps: ["Scope confirmation", "Quotation", "Planning", "Approval", "Production", "Quality check", "Dispatch"],
    },
    lists: [
      { title: "What is coordinated", items: ["Scope and quotation", "Planning and guide design", "Production and quality checks", "Dispatch and delivery support"] },
      { title: "What the dentist receives", items: ["One visible case status", "Documented approval points", "Surgery-ready deliverables — by confirmed scope"] },
    ],
    gallery: {
      h2: "What coordinated delivery produces",
      body: "Representative surgery-ready output from a design-to-delivery case.",
      items: [
        { image: img.pStackableMetalModel, caption: "Guide and framework seated on the model." },
        { image: img.pPrintedBoneModels, caption: "Printed verification model." },
        { image: img.pProsthesisInHand, caption: "Finished full-arch prosthesis, ready for dispatch." },
      ],
    },
    commonErrors: [
      "Scope not confirmed before work begins, causing later rework",
      "Records incomplete at submission, pausing the whole chain",
      "Approval not recorded, so production cannot safely start",
      "Delivery expectations set before logistics are verified",
    ],
    discussFirst:
      "the region, delivery expectation or production route is uncertain, or the case scope is still being defined.",
    notes: [
      "Committed turnaround is separate from courier transit and from delays caused by incomplete records or pending approval.",
      "Regions served are listed only after logistics and regulatory requirements are verified.",
    ],
    faq: [
      { q: "Is every case eligible?", a: "No. Eligibility depends on case type, location, production route, available records, operational capacity and confirmed scope." },
      { q: "How is timing communicated?", a: "Committed turnaround is confirmed against the case and stated separately from courier transit and from delays caused by incomplete records or pending approval." },
    ],
    ctaHeading: "Start a coordinated workflow.",
  },

  "white-label-workflow-partner": {
    seoTitle: "White-Label Dental Implant Planning Services | I3DC",
    description:
      "Add digital implant planning, guide design and production capacity behind your laboratory, DSO, implant system or international practice network.",
    canonical: "/white-label-workflow-partner/",
    eyebrow: "White-label workflow partnership",
    h1: "Add workflow capacity without losing your customer relationship.",
    heroBody:
      "Digital implant planning, guide design and production capacity behind your brand — for laboratories, DSOs, implant systems, distributors and overseas practice networks.",
    primary: { label: "Request a Workflow Review", href: cta.discussCase.href },
    image: img.pGuidePartInHand,
    imageLabel: "Guide production",
    heroCutout: true,
    intro: {
      h2: "What a partnership protects",
      body: "The point of a white-label partnership is capacity without disruption. It protects your customer relationship and your brand: scope, turnaround bands, communication and escalation are defined before work begins, so your clients experience your service — with our workflow behind it.",
    },
    lists: [
      { title: "Who this fits", items: ["Laboratories", "DSOs and practice groups", "Implant systems and distributors", "Overseas practice networks"] },
      { title: "How partnerships are defined", items: ["Brand handling", "Scope and turnaround bands", "Communication model", "Escalation path"] },
      { title: "Engagement options", items: ["Design-only capacity", "Production-supported workflows", "Volume workflows — as separate options"] },
    ],
    commonErrors: [
      "Brand and communication boundaries left undefined",
      "No agreed escalation path for exceptions",
      "Scope and turnaround bands assumed rather than documented",
      "Volume expectations set before capacity is confirmed",
    ],
    discussFirst:
      "you are scoping a new partnership model, or need to understand brand handling and responsibility boundaries before committing volume.",
    notes: [
      "Bulk prices, minimum volumes and territory promises are not published until commercially approved. Partnership scope and responsibility are defined before work begins.",
    ],
    faq: [
      { q: "Whose brand does the client see?", a: "Yours. Brand handling and communication are agreed at the outset so the workflow runs behind your customer relationship." },
      { q: "Can we start with design-only?", a: "Yes. Design-only, production-supported and volume workflows are available as separate options and can scale over time." },
    ],
    ctaHeading: "Request a workflow review.",
  },

  "global-practices": {
    seoTitle: "Global Practice Workflows | Image3DConversion",
    description:
      "Review, production and responsibility options for international practices — shown through operating detail, not flags or worldwide claims.",
    canonical: "/global-practices/",
    eyebrow: "Global practice workflows",
    h1: "Built to work with practices across borders.",
    heroBody:
      "Use Image3DConversion as a design partner for validated local production, coordinate design and delivery through one case, or establish a white-label workflow — shown through operating detail, not flags.",
    primary: { label: cta.compareWorkflows.label, href: cta.compareWorkflows.href },
    image: img.planAnterior,
    imageLabel: "Remote plan review",
    intro: {
      h2: "What cross-border collaboration protects",
      body: "Distance adds risk only when responsibility is vague. A remote-first model protects clarity: plans are versioned, questions are named, approvals are recorded, and the responsibility split is agreed before work begins — so a practice anywhere knows exactly how the case will run.",
    },
    lists: [
      { title: "Review without geography", items: ["Versioned plans", "Named questions", "Recorded approvals across teams and locations"] },
      { title: "Choose the production route", items: ["Ready-to-produce files for validated local workflows", "Coordinated production and delivery where scope supports it"] },
      { title: "Know the responsibility split", items: ["File preparation", "Clinical decisions", "Design and manufacturing checks", "Shipping and local verification — assigned before work begins"] },
    ],
    commonErrors: [
      "Responsibility split left implicit across teams",
      "Local production route not validated before design handoff",
      "Time-zone and communication expectations undefined",
      "Assuming coordinated delivery is available before logistics are confirmed",
    ],
    discussFirst:
      "you need to confirm the production route, responsibility split or delivery feasibility for your region before starting a case.",
    notes: [
      "Countries, response windows, currencies, languages, shipping regions, data safeguards and turnaround bands are published only after operations and legal verification. No universal-coverage claim is made.",
    ],
    faq: [
      { q: "Do you serve my country?", a: "Collaboration routes are discussed case by case. Served regions, shipping and logistics are confirmed for your location rather than claimed universally." },
      { q: "How does remote review work?", a: "Through versioned plans, named questions and recorded approvals — so clinical and technical teams review the same case without sharing one location." },
    ],
    ctaHeading: "See how cross-border workflows fit your practice.",
  },

  "case-requirements": {
    seoTitle: "Dental Implant Case Submission Requirements | I3DC",
    description:
      "Check the DICOM, intraoral scan, prosthetic reference and case details needed before submitting a guided implant workflow.",
    canonical: "/case-requirements/",
    eyebrow: "Case requirements",
    h1: "Send the right data before planning begins.",
    heroBody:
      "Requirements change by workflow. Review the records, scan protocols and case details needed before you submit — so your case moves into planning without avoidable delays.",
    primary: { label: cta.discussCase.label, href: cta.discussCase.href },
    image: img.planRestorative,
    imageLabel: "Records for planning",
    intro: {
      h2: "Workflow-specific, not one universal list",
      body: "Different workflows need different records. Getting them right the first time is the single biggest factor in a smooth case — this page gives the baseline, and the exact requirements are confirmed for your selected workflow before submission.",
    },
    lists: [
      { title: "Imaging & scans", items: ["CBCT / DICOM with an appropriate field of view", "Intraoral, model, denture or wax-up scan where relevant", "Bite record and prosthetic reference"] },
      { title: "Prosthetic & clinical detail", items: ["Smile / prosthetic reference where the outcome is patient-facing", "Implant system, components and drill-kit information", "Case prescription, planned date and delivery location"] },
      { title: "Accepted file types", items: ["DICOM", "STL", "Supporting JPG / PNG", "Other formats only after portal validation"] },
    ],
    commonErrors: [
      "CBCT field of view too small for the planned treatment",
      "Missing prosthetic reference for a restoration-led plan",
      "Implant system or drill-kit not specified",
      "Scans that will not align with the CBCT",
    ],
    discussFirst:
      "you are unsure which records your workflow needs, or whether existing imaging is enough before re-scanning the patient.",
    notes: [
      "Do not email or submit patient files through a public enquiry form. Clinical records are submitted only through the authenticated Case Portal after the right route is confirmed.",
    ],
    faq: [
      { q: "Is there one checklist for every case?", a: "No. Requirements are workflow-specific. Use this page as a baseline and confirm the exact list for your selected workflow before submission." },
      { q: "Where do I upload records?", a: "Only inside the authenticated Case Portal, never a public form. Public enquiries carry a non-identifying summary only." },
    ],
    ctaHeading: "Prepare and discuss your case.",
  },
};
