# Zoho Leads — `Image3DConversion Website Leads` Layout & Workflow Proposal

**Status:** Proposal + read-only audit. **No Zoho changes made** (no layout, field, picklist, workflow, or record created/modified). Awaiting Zoho-admin manual setup + founder approval. Website Zoho submission stays **dry-run**.

**Approved mapping:** website Company / organization / clinic / practice name → **`Clinic_Practice_Name`** (NOT `Company`).

---

## 0. MCP capability note
The connected Zoho MCP exposes **read** (modules, fields, workflow rules/tasks/configs, webhooks) and **write** only for *workflow field-updates, workflow tasks, webhooks, and record creation*. There is **no tool to create a layout, create a field, or add a picklist value**. Therefore the **layout + new fields + picklist values must be created by an admin in the Zoho UI** (spec below). The workflow rule could be created via MCP but is **not** created until approved.

## 1. Existing Leads layouts (protect)
No layout-list endpoint is exposed via MCP, but field + workflow data confirm Leads currently runs a **single, heavily-customized layout for SurgiGuide / workshops** (custom fields: `Workshop_City`, `Workshop_Location`, `Program_Type`, `Fellowship_Eligibility`, `Program_Batch`, `Registration_Type`, `Attendance_Status`, `Payment_*`, `Refund_*`, `Venue`, `Event_Code`, `leadchain0__Social_Lead_ID`, …).
➜ **Do NOT edit/delete/rename this layout.** Create a **separate** `Image3DConversion Website Leads` layout — layouts are independent, so SurgiGuide is unaffected.

## 2. Fields already available (reuse — no creation)
Standard: `First_Name`, **`Last_Name`** (only mandatory), `Email`, `Phone`, `Mobile`, `Designation` (Title), `City`, `State`, `Country`, `Description`, `Lead_Source`, `Lead_Status`.
Existing custom (reuse): **`Clinic_Practice_Name`**, `Form_Type`, **`UTM_Source`**, **`UTM_Medium`**, **`UTM_Campaign`**, **`UTM_Content`**.

Notes:
- **`Company` is NOT active** on the Leads layout → use `Clinic_Practice_Name` for organization (as approved).
- Existing `Lead_Source` picklist values include `WhatsApp - Image 3D Conversion`, `Website Appointment`, `Website Organic` — **none is a clean I3DC website source**, hence a new value (§3).

## 3. Missing fields + picklist values (Zoho admin to create in UI)
| Item | Type | Purpose |
|---|---|---|
| `Business_Unit` | picklist | add value **Image3DConversion** — business separation in the shared org |
| `Inquiry_Type` | picklist | Discuss a Case / Service Inquiry / White-Label / Lab-Vendor |
| `Service_Interest` | picklist | case / service type |
| `Workflow_Interest` | picklist | guided / full-arch / zygoma / immediate-loading / design |
| `Case_Urgency` | picklist | urgency |
| `Preferred_Callback` | text | preferred callback time |
| `Existing_Customer` | checkbox | new vs returning |
| `Page_Submitted_From` | text | referrer / page path |
| `Consent` | checkbox | consent / marketing permission |
| **`Lead_Source` new value** | picklist value | **"Website - Image 3D Conversion"** |
| **`Business_Unit` value** | picklist value | **"Image3DConversion"** |

Keep field API names as above where possible; if the admin uses different API names, capture them so `mapping.ts` can be aligned.

## 4. Active Leads workflows to PROTECT (9 — all SurgiGuide/WhatsApp)
| Rule | Trigger | Purpose (inferred) |
|---|---|---|
| `gallabox` | create_or_edit | WhatsApp (Gallabox) |
| `W/A` | create_or_edit | WhatsApp |
| `Sudeep Paul SGE AD` | create_or_edit | SurgiGuide ad campaign |
| `AC – WhatsApp` | create | Acquisition Channel = WhatsApp |
| `AC – Meta Paid` | create | Acquisition Channel = Meta Paid |
| `AC – Referral:` | create | Acquisition Channel = Referral |
| `SGE Ack Enquiry` | create | **SurgiGuide auto-acknowledgement** |
| `Payment_Confirm-Chandigarh` | field_update (Payment_Status) | workshop payment |
| `Payment_Confirm-GOA` | field_update (Payment_Status) | workshop payment |

⚠️ Verify **`SGE Ack Enquiry`** and the `AC –` rules are scoped so they do **not** fire on I3DC website leads (otherwise an I3DC enquirer could receive a SurgiGuide-branded reply). The new I3DC workflow must be scoped by `Lead_Source = "Website - Image 3D Conversion"`.

## 5. Proposed new layout — `Image3DConversion Website Leads`
Mandatory: **only `Last_Name`** (Zoho minimum). Everything else optional.
1. **Basic Lead Information** — First_Name, Last_Name*, Email, Mobile, Designation
2. **Clinic / Practice Details** — Clinic_Practice_Name, City, State, Country
3. **Website Enquiry Details** — Inquiry_Type, Case_Urgency, Preferred_Callback, Existing_Customer, Page_Submitted_From
4. **Service Interest** — Service_Interest, Workflow_Interest
5. **Campaign / UTM Tracking** — UTM_Source, UTM_Medium, UTM_Campaign, UTM_Content
6. **Consent & Source** — Consent, Lead_Source (= "Website - Image 3D Conversion"), Form_Type, Business_Unit (= Image3DConversion)
7. **Internal Notes** — Description, Lead_Status, Lead Owner

## 6. Proposed workflow (NOT created — for approval)
- Rule "I3DC Website — New Enquiry"; module Leads; trigger **on create**; criteria **`Lead_Source = "Website - Image 3D Conversion"`**.
- Actions: (a) field update `Business_Unit = Image3DConversion`; (b) assign to the I3DC owner/team; (c) internal email notification.
- SurgiGuide workshop automation left untouched.

## 7. Exact changes requiring founder / admin approval
1. **Create** the `Image3DConversion Website Leads` layout (Zoho UI), only `Last_Name` mandatory.
2. **Create** the 9 fields (§3) + add picklist values `Lead_Source → "Website - Image 3D Conversion"` and `Business_Unit → "Image3DConversion"`.
3. **Confirm** `organization → Clinic_Practice_Name` (Company inactive).
4. **Provide** the I3DC lead owner + notification recipient (for the workflow).
5. **Confirm** `SGE Ack Enquiry` / `AC –` rules exclude I3DC website leads.
6. After creation, **share the new layout ID** so the website record payload targets it.

---

## 8. Follow-up plan (AFTER admin completes §7 in Zoho UI)
Do not action until the admin confirms the layout/fields/picklist values exist.
1. **Re-audit** Leads via MCP `getFields` — confirm each new field exists and capture the **exact API names** + the **new layout ID**.
2. **Update website `src/lib/zoho/mapping.ts`:** map `organization → Clinic_Practice_Name`; set `Lead_Source = "Website - Image 3D Conversion"`; add `Layout` id to the record payload; move the currently-Description-packed fields onto the new structured fields where present (keep Description fallback for any still missing).
3. **Prepare a one-test-lead plan** (do not run yet): set `ZOHO_*` env in a staging/preview env with `ZOHO_SUBMIT_ENABLED=true`, submit one enquiry from `/discuss-a-case/`, verify the record lands in the new layout with correct fields/owner/notification, then decide on production.
4. Keep production **dry-run** until the test lead is verified and founder approves go-live.

*Nothing in Zoho was changed to produce this document. Live Zoho remains disabled.*
