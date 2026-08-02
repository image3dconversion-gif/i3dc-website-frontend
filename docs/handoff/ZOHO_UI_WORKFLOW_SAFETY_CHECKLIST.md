# Phase 2 — Zoho UI / Workflow Safety Checklist (I3DC Website Leads)

**Purpose:** finish the Zoho Leads setup for I3DC website enquiries **safely**, without disturbing the SurgiGuide / paulsudeep.com / workshop environment. **Prepared 2026-08-02.**
**Scope:** Zoho CRM Leads only. Not the website code (done), not DNS, not production, not the Case Portal, not AWS.
**State:** Zoho stays **DRY-RUN**. This phase performs **no staging test lead** (that is a later, separately-approved phase).

Related: `ZOHO_SESSION_HANDOFF.md` (§0.1–§0.3), `LAUNCH_CHECKLIST_WEBSITE.md`.

---

## 0. Hard safety rules (apply to every step)
- 🔴 **Ask for founder approval before EVERY Zoho write** (show the exact action/payload first).
- **No delete.** Add-only. To retire a field, move it to "Unused" (reversible) — never permanent delete.
- **Do not touch** the protected layouts/workflows (table below).
- **Only edit** the existing `I3DC Website` layout by ID — never create a new layout (Leads layout limit is reached).
- Preserve **all** existing `Lead_Source` values (26) — a shared field used by workshop leads.
- Keep `ZOHO_SUBMIT_ENABLED` unset → dry-run. No live lead. No workflow deletion.
- After each write, **re-audit read-only** and **leak-check** the protected layouts.

## 1. Protected objects — DO NOT TOUCH
| Object | ID | Note |
|---|---|---|
| `paulsudeep.com` layout | 6607227000002608029 | 🔒 SurgiGuide/workshop |
| `Mr Paul A/C` layout | 6607227000004831001 | 🔒 |
| `Standard` layout | 6607227000000091055 | 🔒 |
| Workshop `Lead_Source` values | (5/1/2/3-Day Workshop, etc.) | 🔒 never remove |
| Any existing workflow rule's actions | — | do not edit/delete; only scope criteria (Task C) |

**Editable target:** `I3DC Website` layout — **ID `6607227000004071789`** (custom, active, only `Last_Name` mandatory).

## 2. Current verified state (pre-conditions)
- ✅ Layout `I3DC Website` exists + editable; 9 fields present (`Business_Unit`, `Inquiry_Type`, `Existing_Customer`, `Page_Submitted_From`, `Consent`, plus the now-unused `Service_Interest`/`Workflow_Interest`/`Case_Urgency`/`Preferred_Callback`).
- ⚠️ **Missing:** `Lead_Source` value `Website - Image 3D Conversion`; fields `Journey_Stage`, `Inquiry_Category`.
- `Lead_Source` field ID `6607227000000002609`, 26 existing values (all must be preserved).

---

## Task A — Add `Lead_Source` value 🔴
Add value **`Website - Image 3D Conversion`** (add-only).
- **Method:** Zoho One UI (Setup → Modules & Fields → Leads → `Lead Source` → add value). **Note:** MCP `updateField` returns SUCCESS but does **not** create new picklist values (verified) — so the UI is required unless another API path is confirmed.
- **Verify (read-only MCP `getFields`):** value count 26 → 27; new value present; all workshop values still present.
- **Rollback:** none needed (add-only); if wrong, deactivate the added value (do not delete others).

## Task B — Create `Journey_Stage` + `Inquiry_Category` on the I3DC Website layout 🔴
Create both fields **scoped to layout `6607227000004071789`** (approved MCP `updateLayout` — same safe, layout-scoped method used for the earlier fields — or the Zoho UI). **No new layout. No new section required** (can add to the existing "Website Enquiry" section, id `6607227000009408001`).

**⚠️ 25-char picklist limit:** several full Journey stage names exceed Zoho's 25-char `actual_value`/`display_value` limit and are shortened below. **The two code-set values (`New Website Inquiry`, `Portal Guidance Needed`) fit exactly and MUST match `mapping.ts`** — do not alter those two.

**`Journey_Stage`** (picklist, default `New Website Inquiry`):
| Value (≤25 chars) | Set by |
|---|---|
| `New Website Inquiry` | **code (default)** — must match |
| `Portal Guidance Needed` | **code (portal-routed)** — must match |
| `Inquiry Classified` | ops |
| `Information Shared` | ops |
| `Portal Invitation Shared` | ops |
| `Collab / Partner Review` | ops (shortened from "Collaboration / Partner Review") |
| `Nurture / Follow-up` | ops (shortened from "Nurture / Educational Follow-up") |
| `Converted-Portal/Partner` | ops (shortened from "Converted to Portal / Partner Review") |
| `Closed - Generic Resolved` | ops |
| `Closed - Not Relevant` | ops |

**`Inquiry_Category`** (picklist) — all fit; must match `mapping.ts`:
`Generic` · `Service-Info` · `Collaboration` · `Portal-Routed`

- **Verify (read-only MCP `getLayouts`/`getFields`):** both fields exist with API names `Journey_Stage` / `Inquiry_Category`; values present; on the `I3DC Website` layout only. **Leak check:** confirm neither appears on paulsudeep.com / Mr Paul A/C / Standard. Layout count still 4.
- **Capture:** the two new field IDs → record in `ZOHO_SESSION_HANDOFF.md`.
- **Rollback:** move field(s) to "Unused" (`updateLayout` `_delete:{permanent:false}`) — reversible, no data destruction.

## Task C — Workflow scoping (UI only) 🔴
Ensure I3DC website leads do **not** trigger workshop-branded automation. **MCP cannot edit rule criteria — Zoho One UI only.** `src/lib/zoho/client.ts` sends `trigger:["workflow"]` on live submit, so unscoped create-rules WILL fire.

Create-triggered Leads rules to review/scope so they **exclude** `Lead_Source = "Website - Image 3D Conversion"`:
- [ ] `gallabox` (create_or_edit, repeat)
- [ ] `W/A`
- [ ] `Sudeep Paul SGE AD`
- [ ] `AC – WhatsApp`
- [ ] `AC – Meta Paid`
- [ ] `AC – Referral:`
- [ ] `SGE Ack Enquiry` (workshop auto-acknowledgement — highest risk)

Safe (no action): `Payment_Confirm-Chandigarh`, `Payment_Confirm-GOA` (trigger = `field_update` on `Payment_Status`, not create).

- [ ] (Optional, 🔴) Create `I3DC Website — New Enquiry`: on create where `Lead_Source = "Website - Image 3D Conversion"` → I3DC-branded acknowledgement + owner assignment.
- **Verify:** each workshop rule's criteria now excludes the I3DC lead source; confirm by reviewing rule criteria in the UI (screenshot/notes). Do not alter rule **actions**.

---

## 3. Approval gates (🔴 — none performed without founder approval)
Add `Lead_Source` value · create `Journey_Stage`/`Inquiry_Category` · any workflow-rule change · (later) enabling live submit / staging lead.

## 4. Exit criteria for Phase 2
- [ ] `Lead_Source` value present (count 27, workshop values intact).
- [ ] `Journey_Stage` + `Inquiry_Category` exist on `I3DC Website` only (leak-checked), field IDs captured.
- [ ] Code-critical values match `mapping.ts` (`New Website Inquiry`, `Portal Guidance Needed`, `Generic`, `Service-Info`, `Collaboration`, `Portal-Routed`).
- [ ] Workshop create-rules scoped to exclude the I3DC lead source (verified in UI).
- [ ] Re-audit complete; `ZOHO_SESSION_HANDOFF.md` updated with IDs + status.
- [ ] Zoho still dry-run; **no staging lead run** (that is the next, separately-approved phase).

## 5. Explicitly NOT in this phase
No staging/production lead · no `ZOHO_SUBMIT_ENABLED=true` · no `ZOHO_LAYOUT_ID` set in production yet · no DNS/production deploy · no Case Portal/AWS · no field deletion.

## 6. Optional cleanup (defer; reversible)
The now-unused case fields on the layout (`Service_Interest`, `Workflow_Interest`, `Case_Urgency`, `Preferred_Callback`) may be moved to "Unused" to declutter the I3DC Website layout — **reversible, no delete**. Not required for launch; do only on approval.
