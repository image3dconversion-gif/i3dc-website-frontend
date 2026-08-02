# Zoho CRM Setup — Session Handoff (Image3DConversion Website Leads)

**Prepared:** 2026-08-02. Handoff only — no Zoho changes, no code changes, no deploy in this session.

## 0. Session update — 2026-08-02 (re-audit + tooling finding)
- **Re-audited live via MCP — state UNCHANGED from this handoff.** 4 Leads layouts (no `Image3DConversion Website Leads`); all 9 target fields absent; `Lead_Source` value "Website - Image 3D Conversion" absent (note: `WhatsApp - Image 3D Conversion` value already exists); `Last_Name` is already the sole `system_mandatory` field. Org ID = **`org764597355`**. Still dry-run; no leads/workflow changes.
- **Both automation paths for the Zoho *settings* UI are confirmed DEAD-ENDS — do not re-attempt:**
  1. **Claude-in-Chrome extension** — logged in and navigated to Leads→Layouts fine, but every screenshot/read_page/click times out ("script injection timed out … page busy"). Zoho's settings SPA never reaches `document_idle`, so the extension can't inject. Consistent across waits + reload.
  2. **Computer-use desktop control** — browsers are hard-locked to **"read" tier** (view-only; clicks/typing blocked). Confirmed by request_access. Can *see* the screen but cannot drive it.
- **Therefore the layout build must be human-driven.** Recommended: admin clicks through the UI (runbook = `ZOHO_ADMIN_UI_CHECKLIST.md`) while the assistant verifies each stage read-only via MCP; or assistant watch-and-guides live via read-only screenshots.
- **Runbook refinement:** create each custom field with a **space in the label** (`Business Unit`, `Inquiry Type`, …) so Zoho auto-generates the exact API name (`Business_Unit`, `Inquiry_Type`) that `mapping.ts` expects, while keeping a clean display label.
- User **paused** before any UI build. No further Zoho action taken.

## 0.1 Session update — 2026-08-02 (LAYOUT BUILT via MCP — supersedes the "paused" note above)
**Correction that unblocked this:** we use **Zoho One** (Sales → CRM → Leads), org `org877531805`. The old **"Social Media Meta"** layout was **renamed `I3DC Website`** and is editable — so instead of creating a new layout (blocked: Leads layout limit reached), we **edited this existing layout** via MCP `updateLayout` (scoped to one layout by ID → safe, cannot affect paulsudeep.com). Empirically verified safe with a single-field probe (no leak to protected layouts).

### Result — I3DC Website layout
- **Layout ID:** `6607227000004071789` (internal `api_name` still `Social_Media_Meta`; display name `I3DC Website`). Editable, active. **Layout count still 4 — no new layout created.**

### All 9 fields CREATED & verified — every one in the **`Website Enquiry`** section (id `6607227000009408001`); no new section created:
| API name | Type | Field ID |
|---|---|---|
| `Business_Unit` | picklist | 6607227000009410030 |
| `Inquiry_Type` | picklist | 6607227000009410002 |
| `Service_Interest` | picklist | 6607227000009410040 |
| `Workflow_Interest` | picklist | 6607227000009410057 |
| `Case_Urgency` | picklist | 6607227000009410016 |
| `Preferred_Callback` | text | 6607227000009409001 |
| `Existing_Customer` | boolean (checkbox) | 6607227000009409009 |
| `Page_Submitted_From` | text | 6607227000009408008 |
| `Consent` | boolean (checkbox) | 6607227000009409017 |

- Picklist values set per approved §7 taxonomy (each + auto `-None-`). One value shortened to fit Zoho's 25-char limit: **`Full-Arch / Stackable Guide` → `Full-Arch/Stackable Guide`**.
- **No duplicate fields** (no `_1` suffixed variants). **No other layout touched** — leak check clean: none of the 9 fields appear on paulsudeep.com / Mr Paul A/C / Standard.

### Lead_Source — STILL MISSING
- Value **`Website - Image 3D Conversion` was NOT added.** `updateField` **returned `SUCCESS` but did not add the value** (confirmed via two independent read servers: count stayed 26). Cause: `updateField.pick_list_values` **updates existing values by `id` only — it does not create new picklist values.** All 26 existing/workshop values are intact (nothing deleted). **→ Add this single value via the Zoho One UI** (Lead_Source field), or find another API path; do NOT rely on `updateField` to add it.

### Workflow risk — UNRESOLVED
- 9 active Leads rules. Create-triggered rules that may fire on an I3DC lead: `gallabox`, `W/A`, `Sudeep Paul SGE AD`, `AC – WhatsApp`, `AC – Meta Paid`, `AC – Referral:`, **`SGE Ack Enquiry`** (workshop-branded auto-ack). Rule-level criteria are **not exposed via MCP**, so exclusion of I3DC leads is **unconfirmed**. `Payment_Confirm-*` are `field_update` on `Payment_Status` (won't fire on plain create). **Verify/scope in the Zoho One UI before any I3DC lead.**

### Status
- **Zoho remains fully dry-run** — no lead created, `ZOHO_SUBMIT_ENABLED` unset, `ZOHO_LAYOUT_ID` not yet set, no code/env changed this session.
- **No staging/production lead allowed yet** — blocked on (1) missing `Lead_Source` value and (2) unresolved workflow scoping.

### Follow-up before any staging test lead — align website code to the Zoho picklists
Reconcile `src/lib/enquiry/types.ts` / `src/lib/zoho/mapping.ts` / the enquiry form so the strings sent match the Zoho picklist `actual_value`s exactly (else picklist values won't stick), especially:
- **`Inquiry_Type` labels** — code `INQUIRY_LABELS` currently sends `White-Label Partnership` / `Lab / Vendor Partnership` / `Existing Customer / Case Portal`, which differ from the Zoho values `White-Label Inquiry` / `Lab / Vendor Inquiry` (+ `General Enquiry`; note `Existing Customer` path does not create a lead).
- **`Full-Arch/Stackable Guide`** — form/mapping must use the shortened 25-char value now in Zoho.
- When going live, set `ZOHO_LAYOUT_ID = 6607227000004071789`.

## 0.2 Session update — 2026-08-02 (CODE-ONLY simplification: generic-inquiry funnel)
Website form → Zoho mapping was re-scoped to a **generic-inquiry + portal-routing funnel**. **Code-only — no Zoho writes, no field/workflow changes, no lead created. Zoho remains dry-run.**

### Files changed
- `src/lib/enquiry/types.ts` — 6-value `INQUIRY_TYPES`/`INQUIRY_LABELS`; removed case-funnel option arrays; trimmed `EnquiryPayload`; added `DEFAULT_JOURNEY_STAGE` / `PORTAL_GUIDANCE_STAGE` / `PORTAL_ROUTED_CATEGORY`.
- `src/lib/enquiry/validate.ts` — strengthened hard PII/clinical reject guard (adds CBCT, `.nii`, `.zip`); added `mentionsPortalTopic()` soft-router; normalises trimmed field set.
- `src/lib/zoho/mapping.ts` — `ZohoLeadRecord` drops case fields, adds `Journey_Stage` + `Inquiry_Category`; `needsPortalGuidance()`; rewrote `PIPELINE_ROUTING` + `buildDescription`.
- `src/app/api/enquiry/route.ts` — captures the lead then routes portal-bound enquiries to the Case Portal (removed old "no-record redirect").
- `src/components/sections/ContactForm.tsx` — 6 inquiry types; removed case/service inputs; added Case Portal boundary helper copy.

### Confirmation
- Website form is now **generic enquiry + portal-routing only** — it does NOT handle case discussion, DICOM/STL/CBCT, patient details, treatment planning, guide design, quotation/pricing, implant-system details, production/order, or delivery/status. All such topics route to the **I3DC Case Portal**.

### Removed fields
- From form + Zoho mapping: **`Service_Interest`, `Workflow_Interest`, `Case_Urgency`, `Preferred_Callback`**.
- Also removed **`City`** and **`Role`/`Designation`** — outside the approved 9-field list.
- (These fields still exist in Zoho from earlier setup; they are simply no longer used by the website form. No Zoho deletion performed.)

### Final 9 website form fields
Name · Clinic / Organization · Mobile / WhatsApp · Email · Inquiry Type · Message · Existing Customer · Consent · Page Submitted From (auto-captured).

### Final 6 Inquiry_Type values
General Enquiry · Portal Help · Service Information · Collaboration Inquiry · Lab / Vendor Inquiry · Existing Customer Support.

### Final Zoho payload shape (`toZohoLead`)
```
Last_Name, First_Name   ← Name
Email                   ← Email
Mobile                  ← Mobile / WhatsApp
Clinic_Practice_Name    ← Clinic / Organisation
Lead_Source      = "Website - Image 3D Conversion"
Business_Unit    = "Image3DConversion"
Inquiry_Type     = one of the 6 approved values
Journey_Stage    = "New Website Inquiry"  → "Portal Guidance Needed" when portal-routed   [Zoho field PENDING]
Inquiry_Category = Generic | Service-Info | Collaboration | Portal-Routed                  [Zoho field PENDING]
Existing_Customer, Page_Submitted_From, Consent
UTM_Source/Medium/Campaign/Content   (passive attribution)
Description      = enquiry type + existing/consent + submitted-from + ⚠ portal note + message
Layout           = attached from ZOHO_LAYOUT_ID at submit
```

### Portal routing logic
Routes toward Case Portal guidance when ANY of: `Existing_Customer = true`; `Inquiry_Type ∈ {Portal Help, Existing Customer Support}`; or the message matches case/commercial keywords (`case`, `price/pricing/cost`, `quote/quotation`, `treatment plan`, `surgery plan`, `guide design`, `implant system`, `production`, `delivery`, `case status`, `order status`). Effect: sets `Journey_Stage = Portal Guidance Needed` + `Inquiry_Category = Portal-Routed`, and the `/api/enquiry` route redirects the user to the Case Portal (lead still captured). Separately, a HARD reject (never stored) fires on true PII / pasted clinical files (patient name, DOB, MRN, aadhaar, passport, DICOM, CBCT, `.stl`/`.dcm`/`.nii`/`.zip`) with a message directing to the Portal.

### Verification results
- `tsc --noEmit` — ✅ clean.
- `next build` — ✅ all 27 routes compiled, no errors.
- Live DOM check (`/discuss-a-case`) — ✅ 6 inquiry options correct; removed fields (`workflow`, `caseType`, `urgency`, `preferredCallback`, `role`, `location`) all absent; no console errors.
- `next lint` — not usable in this repo (interactive setup prompt); not a regression.
- Form was **not submitted** (no test lead).

### Status
**Zoho fully dry-run. No Zoho writes, no field changes, no workflow edits, no lead created.**

### Remaining blockers (all Zoho-side; require approval before any write)
1. **`Lead_Source` value `Website - Image 3D Conversion` missing** in Zoho — add via Zoho One UI (`updateField` returns SUCCESS but does not add new picklist values).
2. **Workflow scoping unresolved** — `SGE Ack Enquiry` / `AC –*` may fire on I3DC leads; `client.ts` sends `trigger:["workflow"]` on live submit. Verify/scope in UI first.
3. **`Journey_Stage` and `Inquiry_Category` not yet created in Zoho** — present in code mapping but the fields do not exist on the `I3DC Website` layout; live submission would be rejected until they are created (needs approval).

## 0.3 Session update — 2026-08-02 (WEBSITE deployment-readiness pass — read-only verify, no code change)
Scope: **public website + Zoho Leads integration only** (Case Portal is out of scope — referenced only as the routing destination). **No code changes this pass (already final); no Zoho writes; no lead; dry-run intact.**

### Files checked (read-only)
`src/lib/enquiry/types.ts`, `src/lib/enquiry/validate.ts`, `src/lib/zoho/mapping.ts`, `src/app/api/enquiry/route.ts`, `src/components/sections/ContactForm.tsx`, `src/middleware.ts`, `next.config.ts`, `.env.example`, `src/content/site.ts` (portal), `docs/handoff/DEPLOYMENT_VERCEL.md`, `package.json`.

### Verified
- Form fields = the approved 9 (Name, Clinic/Org, Mobile/WhatsApp, Email, Inquiry Type, Message, Existing Customer, Consent, Page Submitted From).
- Inquiry_Type = the 6 approved values. Removed fields (Service_Interest, Workflow_Interest, Case_Urgency, Preferred_Callback, City, Role) absent from form + payload.
- Payload: `Business_Unit=Image3DConversion`, `Lead_Source=Website - Image 3D Conversion`, `Journey_Stage` default `New Website Inquiry` → `Portal Guidance Needed` when portal-routed, `Inquiry_Category=Portal-Routed` when applicable.
- Portal routing (existing customer / Portal Help / Existing Customer Support / case-keyword message) redirects to `portal.loginUrl = "/case-portal/"` — internal interim page, **verified 200** (not a dead link). Replace with live portal URL per DEPLOYMENT_VERCEL.md §9 when the portal is live.
- CMS admin (`/keystatic`) fail-safe: 404 in prod unless all 3 `KEYSTATIC_*` vars set → then Basic Auth (middleware verified).
- Zoho creds server-only; `ZOHO_SUBMIT_ENABLED=false` default → dry-run.

### Results
- `tsc --noEmit` clean · `next build` all 27 routes, no errors · DOM verify (6 options, removed fields absent, `/case-portal/` 200, no console errors). Form NOT submitted. `next lint` unusable in-repo (interactive prompt; not a regression).

### Verdict
**Website is ready for a Vercel preview/staging deploy** (dry-run; sends nothing to Zoho). Live CRM submission blocked by the Zoho-side items in §0.2 (Lead_Source value, Journey_Stage + Inquiry_Category fields, workflow scoping) plus setting `ZOHO_LAYOUT_ID=6607227000004071789` and Zoho OAuth creds at go-live. Public-production non-code items (per DEPLOYMENT_VERCEL.md §10): legal Privacy/Terms copy + OG image advisable; DNS at GoDaddy; founder approval.

### Known doc nit (not changed, to avoid churn)
`.env.example` `ZOHO_LAYOUT_ID` comment still says "Image3DConversion Website Leads"; the real layout is **`I3DC Website` / `6607227000004071789`**.

See `LAUNCH_CHECKLIST_WEBSITE.md` for the step-by-step launch sequence.

## 1. Current goal
Set up Image3DConversion **website** lead handling in Zoho CRM safely, in a **separate Leads layout** from the SurgiGuide / paulsudeep.com **workshop** leads, and wire the website enquiry form to it — while keeping production Zoho **dry-run** until approved.

## 2. Current status (verified read-only)
- Zoho MCP has **no create-layout tool** (only read/update-existing/activate/deactivate/delete).
- Existing Leads layouts found (4) — see §3.
- **`Image3DConversion Website Leads` layout does NOT exist yet.**
- The **9 target fields are absent** (Business_Unit, Inquiry_Type, Service_Interest, Workflow_Interest, Case_Urgency, Preferred_Callback, Existing_Customer, Page_Submitted_From, Consent).
- `Lead_Source` value **"Website - Image 3D Conversion" is absent**; `Business_Unit` field/value absent.
- Zoho submission **remains dry-run** (`ZOHO_SUBMIT_ENABLED` unset). **No live/test leads created. No workflow changes made.**

## 3. Existing Leads layouts captured (DO NOT edit these)
| Layout name | Layout ID | Note |
|---|---|---|
| Standard | 6607227000000091055 | **clone this** for the new layout |
| paulsudeep.com | 6607227000002608029 | **🔒 PROTECTED — SurgiGuide/workshop, do not touch** |
| Mr Paul A/C | 6607227000004831001 | do not touch |
| Social Media Meta | 6607227000004071789 | do not touch |

## 4. Tool capability summary (Zoho MCP)
Available: `getLayouts`, `getFields`, `getModules`, `createFields`, `updateField`, `updateLayout` (**existing layout only**), `activateLayout`/`layoutDeactivate`/`deleteLayout`, `createModules`, `getWorkflowRules`/`getWorkflowConfigurations`/`getWorkflowTasks`, `createWorkflowTasks`/`createFieldUpdates`/`createWebhooks`/`reorderWorkflowRules`, `createRecords`/`updateRecords`/`deleteRecords`.
**Clearly:**
- ❌ **No create-layout tool** (blocker).
- ❌ **No workflow-criteria edit tool** (can create tasks/field-updates/webhooks only, not edit a rule's criteria).
- ⚠️ **Field creation is possible (`createFields`) but unsafe unless approved** — it creates fields at **module level**, which can surface them on the protected paulsudeep.com layout; also one picklist value ("Full-Arch / Stackable Guide", 27 chars) exceeds the API's 25-char limit.
- ⚠️ Adding a `Lead_Source` picklist value via `updateField` is unsafe to automate (must resend the full shared value list; risk of deleting workshop values).

## 5. Files changed / commits (this workstream)
- **`7001a5b`** — feat(zoho): align Leads mapping to approved I3DC schema (dry-run).
- **`4e7b8e6`** — docs: add Zoho admin UI checklist with captured layout IDs.
- (plus **`285110f`** Vercel + Zoho plan docs, **`776236a`** layout proposal — context.)
- Files:
  - `src/lib/enquiry/types.ts` (LEAD_SOURCE = "Website - Image 3D Conversion")
  - `src/lib/zoho/mapping.ts` (approved field mapping)
  - `src/lib/zoho/client.ts` (ZOHO_LAYOUT_ID env → Layout at submit)
  - `.env.example` (ZOHO_* incl. ZOHO_LAYOUT_ID)
  - `docs/handoff/ZOHO_ADMIN_UI_CHECKLIST.md`

Working tree: clean except a pre-existing unrelated deletion `assets-source/03-surgical-guides/12.jpg` (do not touch).

## 6. Current code mapping (`src/lib/zoho/mapping.ts`, dry-run)
- organization / company / clinic → **`Clinic_Practice_Name`** (NOT Company — inactive)
- phone / WhatsApp → **`Mobile`**
- Lead_Source → **"Website - Image 3D Conversion"**
- Business_Unit → **"Image3DConversion"**
- Layout → attached from **`ZOHO_LAYOUT_ID`** env at submit time (no hardcoded id)
- name→First/Last_Name, email→Email, city→City, role→Designation, inquiry/service/workflow/urgency/callback/existing/page/consent/UTM_* → same-named fields
- **Description kept as labelled backup** with full enquiry context
- Submission stays **disabled/dry-run** unless `ZOHO_SUBMIT_ENABLED=true` + creds set (server env only)

## 7. Zoho admin/UI checklist (exact spec)
**Layout:** `Image3DConversion Website Leads` — **clone from Standard**. **Do NOT touch** paulsudeep.com / SurgiGuide / workshop layouts. **Only mandatory field: `Last_Name`** (no other mandatory).

**Fields to create:**
| Field | Type | Picklist values |
|---|---|---|
| Business_Unit | picklist | Image3DConversion |
| Inquiry_Type | picklist | Discuss a Case; Service Inquiry; White-Label Inquiry; Lab / Vendor Inquiry; General Enquiry |
| Service_Interest | picklist | CBCT / Radiology Report; Guided Implant Planning; Surgical Guide; Full-Arch / Stackable Guide; Smile Design; Digital Design Service; 3D Printing / Production; Other |
| Workflow_Interest | picklist | Single Implant; Multiple Implants; Full-Arch; Zygoma / Pterygoid; Immediate Loading; Prosthetic Planning; Guide Design; Not Sure |
| Case_Urgency | picklist | Routine; Within 48 Hours; Within 1 Week; Surgery Date Fixed; Urgent |
| Preferred_Callback | text | — |
| Existing_Customer | checkbox | — |
| Page_Submitted_From | text | — |
| Consent | checkbox | — |

**Add `Lead_Source` value:** `Website - Image 3D Conversion` (add only; never remove existing values).
Reuse existing: First_Name, Last_Name, Email, Mobile, Clinic_Practice_Name, City, State, Country, Designation, Description, UTM_Source/Medium/Campaign/Content, Form_Type, Lead_Status.
Sections: Basic Lead Info · Clinic/Practice · Website Enquiry · Service Interest · Campaign/UTM · Consent & Source · Internal Notes.

## 8. Workflow risk (flag only — do NOT modify yet)
Active Leads rules: gallabox, W/A, Sudeep Paul SGE AD, AC – WhatsApp, AC – Meta Paid, AC – Referral:, **SGE Ack Enquiry**, Payment_Confirm-Chandigarh, Payment_Confirm-GOA.
`SGE Ack Enquiry` and the `AC –` rules appear **create-triggered with no visible rule-level criteria** → they may fire on I3DC website leads once `Lead_Source = "Website - Image 3D Conversion"` exists (workshop-branded auto-reply / acquisition tagging). **Must be checked/scoped in the Zoho UI before any staging or production I3DC lead.** MCP cannot edit rule criteria.

## 9. Recommended next-session action — **Option C**
Use **Claude in Chrome under supervision** to create the layout/fields in the Zoho UI. Next session should:
1. Open Zoho UI (user logged in) → Setup → Modules & Fields → **Leads → Layouts**.
2. **Clone the Standard layout** → name it **`Image3DConversion Website Leads`**.
3. Add the 9 fields + picklist values (§7); keep only `Last_Name` mandatory.
4. Add `Lead_Source` value "Website - Image 3D Conversion" (add only).
5. **Ask before every save.** Do not touch paulsudeep.com or any workshop layout/workflow.
6. **Re-audit via MCP** (`getLayouts`, `getFields`) → capture the **new layout ID** + exact **field API names**.
7. Update `src/lib/zoho/mapping.ts` if any API name differs; set `ZOHO_LAYOUT_ID`.
8. **Do NOT run a test lead** until the workflow risk (§8) is resolved.

## 10. Blockers
- No create-layout MCP tool → layout must be made in UI.
- Layout ID pending (created only after §9).
- Field API names pending (auto-generated on creation).
- Workflow criteria cannot be edited via MCP → UI only.
- Safe staging test lead is **blocked** until layout + fields + picklist exist AND workflow scoping is verified.

## 11. Exact next prompt (paste into a fresh session)
```
Continue the Zoho CRM setup for Image3DConversion website leads. Read
docs/handoff/ZOHO_SESSION_HANDOFF.md first — it has full context, captured
layout IDs, the field spec, and blockers.

Rules: do not touch the paulsudeep.com / SurgiGuide / workshop layouts or
workflows; do not delete anything; do not create live/test leads; keep Zoho
dry-run; ask before every write/save.

Plan (Option C — Claude in Chrome, supervised):
1. Re-audit via Zoho MCP (getLayouts, getFields on Leads) to confirm current
   state and whether the admin created anything since the handoff.
2. If the "Image3DConversion Website Leads" layout still does not exist, open
   the Zoho UI via Claude in Chrome (I am logged in) and, asking before each
   save: clone the Standard layout → name it "Image3DConversion Website Leads";
   add the 9 fields + picklist values from the handoff (only Last_Name
   mandatory); add Lead_Source value "Website - Image 3D Conversion".
3. Do NOT touch paulsudeep.com or any workshop layout/workflow.
4. After creation, re-audit via MCP: capture the new layout ID + exact field
   API names, and update src/lib/zoho/mapping.ts / ZOHO_LAYOUT_ID if needed.
5. Check SGE Ack Enquiry + AC- workflow criteria; flag/scope so they do not
   fire on Lead_Source = "Website - Image 3D Conversion". Do not modify without
   my approval.
6. Prepare (do not run) the single staging test-lead plan. Keep production
   dry-run. Report layout ID, field API names, workflow risk, and files changed.
```
