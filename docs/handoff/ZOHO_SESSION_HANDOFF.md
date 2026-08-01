# Zoho CRM Setup — Session Handoff (Image3DConversion Website Leads)

**Prepared:** 2026-08-02. Handoff only — no Zoho changes, no code changes, no deploy in this session.

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
