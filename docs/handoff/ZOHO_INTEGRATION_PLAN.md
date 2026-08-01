# Image3DConversion — Zoho CRM Integration Plan & Audit

**Status:** Enquiry intake is built and **dry-run only**. Live submission is disabled and will not be enabled until the founder confirms the target module, field API names, and provides credentials as Vercel env vars. **No code changes are needed to go live — only env vars + a mapping confirmation.**

---

## 1. Current `/api/enquiry` implementation (audit)
- **Route:** `POST /api/enquiry` (`src/app/api/enquiry/route.ts`), Node runtime, `force-dynamic`.
- **Pipeline:** parse JSON → honeypot check → per-IP rate limit (5/60s, in-memory) → `validateEnquiry()` (required fields, email shape, consent, clinical-leak guard, length caps) → route by `inquiryType` → `submitLead()` (guarded).
- **Guard (`src/lib/zoho/client.ts`):** live submit happens **only** when `ZOHO_SUBMIT_ENABLED==="true"` **AND** all `ZOHO_*` creds are present. Otherwise **dry-run**: validates, logs a minimal record server-side, sends nothing, returns success. Credentials are read from `process.env` (server-only, `import "server-only"`), never in the client bundle.
- **Existing customers:** `inquiryType==="existing-customer"` returns a redirect to the Case Portal and **creates no CRM record**.
- **Verified:** all 5 inquiry types return correctly in dry-run; invalid input → 422; honeypot → 422; burst → 429.

## 2. Dry-run payload structure (normalised server-side)
`validateEnquiry()` produces `NormalisedEnquiry` (`src/lib/enquiry/types.ts`):
```
inquiryType   : "discuss-a-case" | "service-inquiry" | "white-label" | "lab-vendor" | "existing-customer"
name          : string (required)
email         : string (required, validated)
phone         : string?           # form field labelled "Phone / WhatsApp"
city          : string?
organization  : string?
role          : string?
serviceInterest  : string?        # "Case / service type"
workflowInterest : string?        # "Workflow interest"
urgency       : string?           # "Case urgency"
message       : string (required) # non-identifying workflow summary
preferredCallback : string?
existingCustomer  : boolean
consent       : true (required)
pageSource    : string?           # e.g. /discuss-a-case/
utm           : { source?, medium?, campaign?, content? }
leadSource    : "I3DC Website"    # FIXED server-side (not client-trusted)
businessTag   : "Image3DConversion" # FIXED server-side
receivedAtIso : string
```
Not currently captured: a **separate WhatsApp** field (one `phone` field today), and an explicit **country** field (city holds "City and country").

## 3. Live CRM structure found (read-only inspection, earlier)
The Zoho org has standard modules (**Leads**, Contacts, Accounts, Deals, Cases) **plus a custom `Inquiries` (CustomModule1)** module. The `Inquiries` module is only generically configured (generic `Single_Line_1`, `Email_1`, `Stage`, `Lead_Source`, `Area_Of_Specialization`, `Pipeline`) — **not purpose-built** for website intake. The org appears **shared across businesses** (SurgiGuide + Image3DConversion), so records must be tagged by business/source to avoid mixing.

## 4. Recommended target & mapping (draft — confirm before go-live)
**Recommended module: standard `Leads`** with `Lead_Source="I3DC Website"` + a business tag, unless an existing Zoho webform is already wired (then don't replace it). Current code maps to a `Leads`-shaped record (`src/lib/zoho/mapping.ts`).

| Website field | Current code → Zoho | Zoho field type | Notes |
|---|---|---|---|
| name | `Last_Name` (+ `First_Name` split) | standard | `Last_Name` required; single word → all in Last_Name |
| email | `Email` | standard | required |
| phone / WhatsApp | `Phone` | standard | founder draft suggests **`Mobile`** — confirm; consider separate WhatsApp |
| organization / clinic | `Company` | standard (required) | individuals → "Individual (not provided)" |
| city / country | `City` | standard | no separate Country field today |
| role | `Designation` | standard | |
| inquiryType | `Inquiry_Type` | **custom** | or map to Lead Type / Service Interest |
| serviceInterest | `Service_Interest` | **custom** | founder draft: Program/Service Type |
| workflowInterest | `Workflow_Interest` | **custom** | |
| urgency | `Case_Urgency` | **custom** | |
| preferredCallback | `Preferred_Callback` | **custom** | |
| existingCustomer | `Existing_Customer` | **custom (boolean)** | also drives portal redirect (no lead) |
| message | `Description` | standard | full context also packed here as fallback |
| pageSource | `Page_Submitted_From` | **custom** | referrer/page |
| consent | *(not mapped yet)* | **custom** | add `Consent`/Marketing Permission field |
| leadSource | `Lead_Source="I3DC Website"` | standard | fixed server-side |
| businessTag | `Business_Unit="Image3DConversion"` | **custom** | separates from SurgiGuide in shared org |
| utm_source/medium/campaign/content | `UTM_Source/Medium/Campaign/Content` | **custom** | attribution |

**Safety net:** everything is also written into `Description`, so no data is lost even if a custom field is missing. **All `Description`-only context can be promoted to real fields once the API names are confirmed.**

**Pipeline routing by inquiry type** (`PIPELINE_ROUTING`): discuss-a-case → "Case Enquiries" · service-inquiry → "Service Enquiries" · white-label & lab-vendor → "Partnerships" · existing-customer → Portal Redirect (no lead). These are placeholder names — map to your real pipelines/layouts.

## 5. Questions the founder must answer before live changes
1. **Target module** — Leads, Contacts, Deals, or the custom `Inquiries` module?
2. **Existing Zoho Webform?** Is one already connected to CRM (if yes, do we submit through it instead of the API — and not replace it)?
3. **Submission method** — Zoho CRM **API** (current build), Zoho **Webform** endpoint, **Zoho Flow**, or a **webhook**?
4. **Exact field API names** — provide the API names for each mapped field (esp. the custom ones above).
5. **Pipeline / stage** — which pipeline and initial stage/lead-status should new website leads enter?
6. **Existing vs new** — should existing customers be routed differently (currently → Case Portal redirect, no lead)? Keep, or also log them?
7. **Lead Source value** — confirm `"I3DC Website"` (or a preferred value).
8. **Notifications/assignment** — who is notified and which assignment rule/owner receives new website leads?
9. **WhatsApp vs phone** — capture WhatsApp separately from phone? (Today one `phone` field → recommend adding a WhatsApp field → Zoho `Mobile`.)
10. **Service interest mapping** — map `serviceInterest` to a Program / Service Type picklist? Provide the picklist values.

## 6. Go-live process (when approved)
1. Founder confirms target module + field API names (§4/§5); developer aligns `mapping.ts` field names if needed (small, reviewed change).
2. Founder provides Zoho OAuth credentials → set as **Vercel env vars** (never in code): `ZOHO_ACCOUNTS_URL`, `ZOHO_API_DOMAIN`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_MODULE`.
3. Set `ZOHO_SUBMIT_ENABLED=true` **in a Preview/staging environment first**.
4. Submit **one test enquiry** from `/discuss-a-case/`.
5. Confirm the record appears in Zoho CRM with correct fields, pipeline/stage, `Lead_Source`, and business tag.
6. Confirm the assignment + notification rule fires (right owner is alerted).
7. Only then set `ZOHO_SUBMIT_ENABLED=true` in **Production**.

## 7. What is NOT done (by rule)
- Live Zoho is **not enabled** (no credentials, no confirmed mapping).
- No secrets are committed.
- No mapping field names were changed to "real" API names yet (awaiting founder confirmation) — the current names are sensible defaults that also fall back into `Description`.
