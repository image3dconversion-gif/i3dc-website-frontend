# Meta Pixel + Conversions API: implementation handoff

**Status:** preview candidate. Not deployed. Delivery defaults OFF. No Meta event has been sent.

| Asset | Value |
|---|---|
| Meta Business | `386266688445796` (Image3DConversion) |
| Dataset / Pixel | `1788653802312623`, "I3DC Services — image3dconversion.com" |
| Ad account | `act_479234172722836` |
| Domain | `image3dconversion.com`, Verified |
| Automatic Advanced Matching | Off (a Meta setting: code cannot enforce it) |
| Dataset category | "Health and wellness – other", with Core setup ON |

Only the dataset id exists in code, as an allowlist of one. Legacy SurgiGuide/workshop and PaulSudeep identifiers are not used and are refused.

## 1. Frozen policy (MKT-04, 2026-11-02)

| Consent | Browser | Server |
|---|---|---|
| `ALLOW` | Pixel loads; PageView | Eligible Lead through CAPI |
| `UNDECIDED` | Nothing | Nothing |
| `DENY` | Nothing | Nothing |
| `UNKNOWN` | Nothing | Nothing |

- **Browser Lead is off.** The browser has no code that can send one, and it never receives an event id.
- **Payload:** `event_name`, `event_time`, `event_id`, `action_source`, `event_source_url` (origin + path), and `user_data` holding `fbp`, `fbc` and `client_user_agent` only.
- **Never sent:** raw IP, email or phone in any form, `external_id`, `website_ref`, name, organisation, message, `custom_data`.

## 2. Environment contract

| Variable | Scope | Purpose |
|---|---|---|
| `META_TRACKING_ENABLED` | Server, baked in at build for static pages | Master switch. Only `true` enables anything. Also decides whether the banner renders. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Public | Must equal the dataset id exactly. |
| `META_CAPI_DELIVERY` | Server | `OFF` (default), `TEST_EVENTS` or `LIVE`. |
| `META_CAPI_ACCESS_TOKEN` | Server secret | Sent only in the Authorization header. |
| `META_EVENT_ID_SECRET` | Server secret, 32+ characters | I3DC-only HMAC key. Keep it stable once in use. |
| `META_TEST_EVENT_CODE` | Preview only | Required by `TEST_EVENTS`. |
| `META_SYNTHETIC_EMAILS`, `META_SYNTHETIC_KEY` | Server | Operator-defined synthetic classification. |
| `META_ALLOW_LOCAL_TRACKING`, `META_GRAPH_API_BASE` | Local test harness | Never in Vercel. A production build ignores both. |

| Deployment | `TEST_EVENTS` | `LIVE` |
|---|---|---|
| Vercel Production | Refused | Allowed once separately approved |
| Vercel Preview | Allowed with a valid code | Refused |
| No `VERCEL_ENV` | Refused | Refused |
| `next dev` | Loopback sink only | Loopback sink only |

`META_TEST_EVENT_CODE` on Production fails the build (`lib/meta/build-gate.ts`, `next.config.ts`) and switches off both Pixel and CAPI at runtime.

**Kill switch:** set `META_CAPI_DELIVERY=OFF` for CAPI, or `META_TRACKING_ENABLED=false` for everything, then redeploy. Rollback is Vercel Instant Rollback.

## 3. How a Lead happens

`src/lib/enquiry/intake.ts`, `src/lib/meta/lead.ts`:

1. `/api/enquiry` validates the enquiry and mints `website_ref` (`i3dc_ref_` + 128 random bits).
2. The Zoho create runs, with the reference in the Description. No new CRM field.
3. **Acceptance** (`isAcceptedCreate`): live mode, HTTP OK, code `SUCCESS`, non-empty Lead ID. The create response is the authority, so there is no callback.
4. **Eligibility** (`decideMetaLead`): in scope, consent `ALLOW`, not synthetic, no spam indicators.
5. `event_id` = `i3dc_lead_` + the first 128 bits of HMAC-SHA256 of the reference.
6. The Lead is sent through `next/server` `after()`, once the visitor has their response.

**Case Portal:** an invitation is in scope only when the invitation form itself was submitted from `/case-portal/`, by both the reported path and the sending page. A page view, CTA click, form view or reference creation is never a Lead.

**Standard enquiries** keep the 11 Sep new-business scope. Existing customers, partnerships and portal help are excluded.

**Spam:** any advisory indicator withholds the Meta Lead. The CRM record is still created, so a false positive costs one measurement and never an enquiry.

### Logged outcomes (no enquirer data)

| Line | Meaning |
|---|---|
| `[enquiry:ACCEPTED]` | `website_ref` and `zoho_lead_id`, recorded together |
| `[enquiry:ACCEPTANCE-INCOMPLETE]` | Zoho said SUCCESS with no Lead ID. The visitor is not told to resubmit, and no Lead is sent |
| `[meta:lead] not_eligible:<reason>` | Decision refused it |
| `[meta:lead] not_sent:no_match_keys` | `ALLOW`, but no valid `_fbp`/`_fbc`. Nothing is invented or sent |
| `[meta:lead] not_sent:capi_inactive` | Eligible, but delivery is off |
| `[meta:lead] scheduled` | A send was scheduled |
| `[meta:capi] Lead delivered` / `[meta:CAPI-FAILED]` | Delivery result, by event id |

## 4. Known limitations

- **No retry and no outbox: this is NOT PaulSudeep retry parity.** Delivery is one attempt with a 4 s timeout. A failed send is logged and lost; the enquiry is unaffected. Nothing replays or backfills.
- **Consent is reported by the browser.** The server can only trust what the form sends, so a hand-crafted POST could claim `ALLOW`. It would still need a valid `_fbp`/`_fbc` value and an accepted Zoho create.
- **`fbc` fallback under ALLOW.** When there is no `_fbc` cookie, a complete `fbclid` captured on landing produces Meta's documented `fb.1.{ms}.{fbclid}`. Attribution capture itself runs regardless of consent and reaches the CRM only; the privacy notice says so.
- **Global navigation links stay plain.** Service continuity covers each service page's own CTAs. Header and footer links to `/discuss-a-case/` carry no service.
- **A lost Zoho response.** If Zoho creates the lead but its response is lost, the visitor sees the fallback and no Lead is sent. This under-counts and can never invent a Lead.
- **Lint.** The repo has no ESLint dependency or config, so `npm run lint` stops at an interactive prompt.

## 5. Verification

```
npm test
npm run typecheck
npm run test:browser
npm run test:bundle
npm run build
```

`test:browser` and `test:bundle` overwrite `.next`. Never run them while `next dev` is using this directory.

## 6. Preview UAT runbook (when authorised)

Nothing here is authorised by the build.

1. Vercel **Preview** scope only: `META_TRACKING_ENABLED=true`, `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_DELIVERY=TEST_EVENTS`, `META_TEST_EVENT_CODE`, `META_CAPI_ACCESS_TOKEN`, `META_EVENT_ID_SECRET`. Point Preview's Zoho settings where the CRM owner approves, and agree how UAT records are marked and closed.
2. Push a `preview/*` branch. Pushing `cms-foundation-keystatic-zoho-dryrun` is a production deploy.
3. Use a `+test` or reserved-domain address so the CRM record is classified as synthetic.
4. Check with Test Events and Pixel Helper:
   - Before a choice, and after Don't allow: no request to any Meta host.
   - After Allow: one PageView per URL, `autoConfig` off, no browser Lead.
   - One invitation and one service enquiry under `ALLOW`: one server Lead each, with `events_received: 1`.
   - The same under `DENY`: none.
5. **Core setup:** record whether Meta accepts the server `Lead` under "Health and wellness – other" with Core setup ON, whether it is restricted or blocked, and what it does to `event_source_url`. Review Events Manager's parameter and event blocking. Do not change the category or work around a restriction. **No production claim until this is proven.**
6. Record how often `not_sent:no_match_keys` appears, and whether Meta accepts events without IP or hashed identifiers.
7. Remove `META_TEST_EVENT_CODE` when UAT ends. Meta still records test events.
