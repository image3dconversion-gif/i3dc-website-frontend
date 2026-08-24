/**
 * POST /api/enquiry — same-origin server intake for the public enquiry form.
 *
 * Pipeline: parse → honeypot → rate-limit → validate + PII/clinical guard →
 * guarded Zoho submit (dry-run unless approved) → route by journey.
 * Zoho credentials are read server-side only and never exposed to the browser.
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
 */
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { validateEnquiry } from "@/lib/enquiry/validate";
import { PIPELINE_ROUTING, toZohoLead } from "@/lib/zoho/mapping";
import { submitLead } from "@/lib/zoho/client";
import { contact, portal } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(req: Request) {
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

  const enquiry = result.value;

  const routing = PIPELINE_ROUTING[enquiry.inquiryType];
  const lead = toZohoLead(enquiry);
  const submit = await submitLead(lead);

  if (!submit.ok) {
    const rid = requestId(req);
    // Operational evidence ONLY. The enquiry itself is intentionally absent from
    // logs, so it is not recoverable from here — the visitor is handed a direct
    // channel below instead, and keeps their typed message on screen.
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
