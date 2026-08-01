# Zoho Admin UI Checklist — Image3DConversion Website Leads

**Why manual:** the connected Zoho MCP can read layouts and create fields, but it has **no create-layout** operation and **no workflow-rule-criteria** editing. Creating fields via API also risks them surfacing on the existing layouts. To honor "do not modify the SurgiGuide/paulsudeep.com layout" and "do not delete anything," the layout + fields + picklist values are done in the **Zoho UI** by an admin. Nothing below has been executed by the assistant.

## Existing Leads layouts (captured read-only — DO NOT edit these)
| Layout name | Layout ID | Note |
|---|---|---|
| Standard | 6607227000000091055 | good template to **clone** for the new layout |
| paulsudeep.com | 6607227000002608029 | **SurgiGuide/workshop — DO NOT TOUCH** |
| Mr Paul A/C | 6607227000004831001 | do not touch |
| Social Media Meta | 6607227000004071789 | do not touch |

The `Image3DConversion Website Leads` layout does **not** exist yet.

## A. Create the new layout (Setup → Modules & Fields → Leads → Layouts)
1. **New Layout** → name **`Image3DConversion Website Leads`** (clone from **Standard**, not paulsudeep.com).
2. Assign appropriate profiles. Make **only `Last_Name` mandatory**; do not add other mandatory fields.

## B. Create these custom fields on the NEW layout only
| Field label | Type | Picklist values |
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

Reuse existing fields on the layout: First_Name, Last_Name, Email, Mobile, Clinic_Practice_Name, City, State, Country, Designation, Description, UTM_Source, UTM_Medium, UTM_Campaign, UTM_Content, Form_Type, Lead_Status.

## C. Add picklist values to EXISTING fields (add only — never remove)
- `Lead_Source` → add **`Website - Image 3D Conversion`** (do not delete existing values incl. workshop ones).
- (If `Business_Unit` is a new field, its value `Image3DConversion` is set in B.)

## D. Suggested sections on the new layout
1. Basic Lead Information — First_Name, Last_Name*, Email, Mobile, Designation
2. Clinic / Practice Details — Clinic_Practice_Name, City, State, Country
3. Website Enquiry Details — Inquiry_Type, Case_Urgency, Preferred_Callback, Existing_Customer, Page_Submitted_From
4. Service Interest — Service_Interest, Workflow_Interest
5. Campaign / UTM Tracking — UTM_Source, UTM_Medium, UTM_Campaign, UTM_Content
6. Consent & Source — Consent, Lead_Source, Form_Type, Business_Unit
7. Internal Notes — Description, Lead_Status, Lead Owner

## E. Workflow (Setup → Automation → Workflow Rules) — manual, do not touch SurgiGuide
- **Verify** `SGE Ack Enquiry` and the `AC – *` rules exclude `Lead_Source = "Website - Image 3D Conversion"` (they appear to fire on every new Lead).
- **Create** "I3DC Website — New Enquiry": on create, criteria `Lead_Source = "Website - Image 3D Conversion"` → set `Business_Unit = Image3DConversion`, assign I3DC owner, send internal notification. (MCP cannot create rule criteria — do this in UI.)

## F. After completion — send the assistant:
- the new **layout ID**, and
- the exact **API names** of the 9 new fields (Zoho auto-generates them from labels).
Then the assistant re-audits, confirms `mapping.ts` matches, sets `ZOHO_LAYOUT_ID`, and prepares the single staging test lead. **Live Zoho stays dry-run until then.**
