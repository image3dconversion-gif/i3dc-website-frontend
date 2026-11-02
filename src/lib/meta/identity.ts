/**
 * Website reference and Meta event id. SERVER-ONLY.
 *
 *   website_ref  random and opaque, one per genuine enquiry create attempt. Written
 *                to the lead's Description for traceability. Never sent to the
 *                browser, and never sent to Meta (not as external_id, not at all).
 *   event_id     HMAC-SHA256 of the website_ref under an I3DC-only server secret,
 *                so the same accepted enquiry always yields the same id.
 *
 * Neither value is derived from anything the visitor typed, so neither can carry
 * personal data.
 */
import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { META_EVENT_ID_PREFIX } from "./constants";

const WEBSITE_REF_RE = /^i3dc_ref_[0-9a-f]{32}$/;

export function mintWebsiteRef(): string {
  return `i3dc_ref_${randomBytes(16).toString("hex")}`;
}

export function isWebsiteRef(value: unknown): value is string {
  return typeof value === "string" && WEBSITE_REF_RE.test(value);
}

/** Deterministic: the same ref under the same secret is always the same event id. */
export function deriveMetaEventId(websiteRef: string, secret: string): string {
  if (!isWebsiteRef(websiteRef)) throw new Error("Not a website reference.");
  if (!secret) throw new Error("Event id secret is required.");
  const digest = createHmac("sha256", secret).update(`i3dc-lead-v1:${websiteRef}`).digest("hex");
  return `${META_EVENT_ID_PREFIX}${digest.slice(0, 32)}`;
}
