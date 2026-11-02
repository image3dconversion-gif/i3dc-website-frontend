/**
 * Synthetic / test classification. SERVER-ONLY.
 *
 * Decided here from server-held rules alone: no request body field is consulted,
 * so a visitor can neither mark a real enquiry as a test nor unmark a test. A
 * synthetic submission still reaches the CRM as usual, but it can only ever go to
 * Meta as a Test Event, and Test Events cannot run in Production.
 *
 *   - RFC 2606 reserved addresses, which cannot belong to a real enquirer;
 *   - `+test`-style sub-addresses used for certification;
 *   - META_SYNTHETIC_EMAILS: addresses or @domains named by the operator;
 *   - x-i3dc-synthetic header matching the server secret META_SYNTHETIC_KEY.
 */
import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

const RESERVED_DOMAIN = /(?:^|\.)(?:example\.(?:com|net|org)|test|example|invalid|localhost)$/;
const TEST_SUBADDRESS = /\+(?:test|qa|uat|synthetic|i3dc-test)(?:[._-].*)?$/;

export type SyntheticEnv = Readonly<Record<string, string | undefined>>;

function sameSecret(a: string, b: string): boolean {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function isSyntheticSubmission(email: string, req: Request, env: SyntheticEnv): boolean {
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf("@");
  const local = at > 0 ? address.slice(0, at) : address;
  const domain = at > 0 ? address.slice(at + 1) : "";

  if (RESERVED_DOMAIN.test(domain) || TEST_SUBADDRESS.test(local)) return true;

  const named = (env.META_SYNTHETIC_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (named.includes(address) || named.includes(`@${domain}`)) return true;

  const key = (env.META_SYNTHETIC_KEY ?? "").trim();
  const header = (req.headers.get("x-i3dc-synthetic") ?? "").trim();
  return Boolean(key && header && sameSecret(key, header));
}
