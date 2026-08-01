/**
 * POST /api/enquiry — same-origin server intake for the public enquiry form.
 *
 * Pipeline: parse → honeypot → rate-limit → validate + PII/clinical guard →
 * route by inquiry type → guarded Zoho submit (dry-run unless approved).
 * Zoho credentials are read server-side only and never exposed to the browser.
 *
 * "existing-customer" enquiries are NOT sent to CRM — the caller is told to
 * redirect to the authenticated Case Portal (real case/order operations live
 * there, not in the CMS or this form).
 */
import { NextResponse } from "next/server";
import { validateEnquiry } from "@/lib/enquiry/validate";
import { PIPELINE_ROUTING, toZohoLead } from "@/lib/zoho/mapping";
import { submitLead } from "@/lib/zoho/client";
import { portal } from "@/content/site";

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

  // Existing customers: redirect to the Case Portal, no CRM record created.
  if (enquiry.inquiryType === "existing-customer") {
    return NextResponse.json({
      ok: true,
      action: "redirect",
      redirectUrl: portal.loginUrl,
      message: "Existing cases are handled in the Case Portal.",
    });
  }

  const routing = PIPELINE_ROUTING[enquiry.inquiryType];
  const lead = toZohoLead(enquiry);
  const submit = await submitLead(lead);

  if (!submit.ok) {
    // Do not lose the enquiry: acknowledge receipt; ops follow-up via logs.
    console.error("[enquiry] submit failed:", submit.detail);
    return NextResponse.json(
      { ok: true, action: "received", degraded: true, message: "Enquiry received." },
      { status: 202 },
    );
  }

  return NextResponse.json({
    ok: true,
    action: "submitted",
    mode: submit.mode,
    pipeline: routing.pipeline,
    message:
      submit.mode === "dry-run"
        ? "Enquiry validated (preview mode — live CRM submission not yet enabled)."
        : "Enquiry submitted.",
  });
}
