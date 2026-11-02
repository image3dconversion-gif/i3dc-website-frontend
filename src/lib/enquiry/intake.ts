/**
 * POST /api/enquiry pipeline — same-origin server intake for the public forms.
 *
 * Pipeline: parse → honeypot → rate-limit → validate + PII/clinical guard →
 * guarded Zoho submit (dry-run unless approved) → route by journey →
 * Meta Lead (server CAPI only, and only under the conditions in decideMetaLead()).
 * Zoho credentials and the Meta access token are read server-side only and
 * never exposed to the browser.
 *
 * A failed live submission is NEVER reported to the visitor as success: the
 * route answers 503 with the founder-approved direct channels so the enquiry
 * survives outside the CRM. Failure logs carry operational evidence only —
 * request id, timestamp, stage, category, route — never enquirer data.
 *
 * The website form is a GENERIC-INQUIRY funnel — it never handles case files,
 * pricing, planning, guide design, production, or case status. Portal-bound
 * enquiries (existing customer, portal-help, existing-customer-support, or a
 * message mentioning a Portal-owned topic) still create a captured (dry-run)
 * lead flagged `Journey_Stage = Portal Guidance Needed`, and the caller is then
 * pointed to the authenticated I3DC Case Portal where case work actually lives.
 *
 * META IS NEVER A DEPENDENCY OF AN ENQUIRY. The CRM write is the transaction.
 * The CAPI Lead is prepared only after it succeeds and is delivered through
 * `defer` — next/server `after` in production — i.e. after the visitor already
 * has their response. A slow, failing or misconfigured Meta can therefore
 * neither delay nor alter that response. See lib/meta/lead.ts for the event id
 * lifecycle.
 *
 * This lives in lib rather than in route.ts because Next.js route files may
 * export only route fields, and the pipeline must be runnable directly in tests.
 */
import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { validateEnquiry } from "./validate";
import { PIPELINE_ROUTING, toZohoLead } from "../zoho/mapping";
import { submitLead, type SubmitResult } from "../zoho/client";
import type { NormalisedEnquiry } from "./types";
import { contact, portal } from "../../content/site";
import { resolveMetaTracking } from "../meta/config";
import { buildLeadRequest, deliverLead } from "../meta/capi";
import { deriveMetaEventId, mintWebsiteRef } from "../meta/identity";
import { decideMetaLead, eventSourceUrl, hasMatchKeys, isAcceptedCreate, leadFacts } from "../meta/lead";
import { isSyntheticSubmission } from "../meta/synthetic";

export interface IntakeDeps {
  /**
   * Run a task after the response has been sent. Production passes next/server
   * `after`; tests pass a collector so the deferred work can be inspected.
   */
  defer: (task: () => Promise<unknown>) => void;
}

// Best-effort in-memory rate limit (per instance). Serverless note: this is a
// soft guard; a durable limiter (KV/Upstash) is recommended for production.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0]!.trim() : "unknown";
}

const ROUTE_ID = "api/enquiry";

/**
 * Correlation id for an undelivered enquiry. Prefers Vercel's own request id so
 * the alarm line joins up with the platform log entry; falls back to a uuid
 * locally. Contains no enquirer data.
 */
function requestId(req: Request): string {
  return req.headers.get("x-vercel-id") ?? randomUUID();
}

/** Logged once per server instance, so a misconfiguration is visible but not noisy. */
let capiInactiveNoted = false;

/**
 * Decide and schedule the one possible Meta Lead for an accepted enquiry, and
 * record the outcome. Every outcome here is explicit, so UAT can tell "not
 * eligible" from "nothing to match on" from "sent". Reasons only: no identifier.
 */
function scheduleMetaLead(
  req: Request,
  enquiry: NormalisedEnquiry,
  websiteRef: string,
  synthetic: boolean,
  submit: SubmitResult,
  deps: IntakeDeps,
): void {
  const meta = resolveMetaTracking(process.env);
  if (!meta.pixelId) return;

  const note = (outcome: string) => console.info("[meta:lead]", { website_ref: websiteRef, outcome });
  const sourceUrl = eventSourceUrl(req, enquiry.pageSource);
  const decision = decideMetaLead({
    enquiry,
    sourceUrl,
    submit,
    synthetic,
    testEvents: meta.capi?.mode === "TEST_EVENTS",
  });
  if (!decision.eligible) return note(`not_eligible:${decision.reason}`);

  if (!meta.capi) {
    if (!capiInactiveNoted) {
      capiInactiveNoted = true;
      console.warn("[meta:capi] server Lead events inactive", { reason: meta.notes.join(",") || "unknown" });
    }
    return note("not_sent:capi_inactive");
  }

  const transport = meta.capi;
  const eventId = deriveMetaEventId(websiteRef, transport.eventIdSecret.reveal());
  const facts = leadFacts({ eventId, enquiry, req, now: new Date(), sourceUrl });
  if (!hasMatchKeys(facts)) return note("not_sent:no_match_keys");

  const body = buildLeadRequest(facts, transport.testEventCode);
  const rid = requestId(req);
  note("scheduled");
  deps.defer(() => deliverLead(transport, body, { requestId: rid }));
}

export async function handleEnquiry(req: Request, deps: IntakeDeps): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const result = validateEnquiry(raw, new Date().toISOString());
  if (!result.ok || !result.value) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  // One opaque reference per genuine create attempt, written to the Description
  // so a CRM record can be traced. It stays on the server: no response carries it.
  const websiteRef = mintWebsiteRef();
  const synthetic = isSyntheticSubmission(result.value.email, req, process.env);
  const enquiry = { ...result.value, websiteRef, synthetic };

  const routing = PIPELINE_ROUTING[enquiry.inquiryType];
  const lead = toZohoLead(enquiry);

  const submit = await submitLead(lead);

  if (!submit.ok) {
    const rid = requestId(req);
    // Operational evidence ONLY. The enquiry itself is intentionally absent from
    // logs, so it is not recoverable from here — the visitor is handed a direct
    // channel below instead, and keeps their typed message on screen.
    // A failed CRM write produces zero Lead events.
    console.error("[enquiry:UNDELIVERED]", {
      request_id: rid,
      route: ROUTE_ID,
      at: new Date().toISOString(),
      failure_stage: submit.stage ?? "unknown",
      category: submit.category ?? "unknown",
    });
    return NextResponse.json(
      {
        ok: false,
        action: "fallback",
        requestId: rid,
        error: "We couldn’t file your enquiry automatically.",
        fallback: { email: contact.email, whatsapp: contact.whatsapp },
      },
      { status: 503 },
    );
  }

  // The CRM has the enquiry. Everything below is measurement: it can only ever
  // decide whether Meta hears about it, never what the visitor is told.
  if (isAcceptedCreate(submit)) {
    console.info("[enquiry:ACCEPTED]", {
      request_id: requestId(req),
      website_ref: websiteRef,
      zoho_lead_id: submit.id,
    });
  } else if (submit.mode === "live") {
    console.error("[enquiry:ACCEPTANCE-INCOMPLETE]", {
      request_id: requestId(req),
      website_ref: websiteRef,
      category: "success_without_lead_id",
    });
  }
  try {
    scheduleMetaLead(req, enquiry, websiteRef, synthetic, submit, deps);
  } catch {
    // Never let Meta preparation turn a CRM success into an error.
    console.error("[meta:CAPI-FAILED]", {
      website_ref: websiteRef,
      event_name: "Lead",
      at: new Date().toISOString(),
      category: "not_scheduled",
    });
  }

  // Portal-bound enquiries: the lead is captured (flagged Portal Guidance Needed);
  // guide the user into the Case Portal, where case work actually happens.
  const toPortal = routing.portal || enquiry.existingCustomer === true;
  if (toPortal) {
    return NextResponse.json({
      ok: true,
      action: "redirect",
      redirectUrl: portal.loginUrl,
      mode: submit.mode,
      message:
        "For case-specific help, files, pricing, planning, or case status, continue in the I3DC Case Portal.",
    });
  }

  return NextResponse.json({
    ok: true,
    action: "submitted",
    mode: submit.mode,
    pipeline: routing.label,
    message:
      submit.mode === "dry-run"
        ? "Enquiry validated (preview mode — live CRM submission not yet enabled)."
        : "Enquiry submitted.",
  });
}
