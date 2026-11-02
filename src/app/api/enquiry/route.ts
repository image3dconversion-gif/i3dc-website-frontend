/**
 * POST /api/enquiry — same-origin server intake for the public enquiry form.
 *
 * The pipeline (validation, guarded Zoho submit, 503 fallback, portal routing,
 * Meta Lead) lives in lib/enquiry/intake.ts, because a Next.js route file may
 * export only route fields and the pipeline must be runnable directly in tests.
 *
 * `after` runs the Meta CAPI delivery once the response has been sent, so Meta
 * can never delay or alter what the visitor is told.
 */
import { after } from "next/server";
import { handleEnquiry } from "@/lib/enquiry/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handleEnquiry(req, { defer: (task) => after(task) });
}
