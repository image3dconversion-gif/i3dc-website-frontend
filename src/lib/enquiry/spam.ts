/**
 * Non-blocking spam indicators for CRM review.
 *
 * GOVERNING RULE: nothing in this module rejects an enquiry. A real dentist
 * writing in a hurry — short message, shouty caps, a pasted link — must always
 * get through. These indicators are recorded alongside the lead so a human can
 * judge it, and nothing more.
 *
 * Deliberately NOT wired to Zoho's `Automation_Exception`: the live rule
 * "V2 COM - Enquiry Acknowledgement" refuses to send its operational
 * acknowledgement when an automation exception is present, so a false positive
 * here would silently withhold the acknowledgement from a genuine enquirer.
 * Indicators therefore travel in the lead Description, which is reviewable and
 * inert. Promoting them to a gating field is a CRM behaviour decision, not a
 * website one.
 *
 * The honeypot is separate and DOES reject — a filled hidden field is a bot,
 * never a valid enquiry, and it is handled in validate.ts.
 */

/** Throwaway-mailbox domains seen in low-quality form traffic. */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "fakeinbox.com",
]);

const URL_RE = /\bhttps?:\/\/|\bwww\./gi;
const HTML_RE = /<\s*(a|script|iframe|img|div|p)\b/i;
const BBCODE_RE = /\[(url|link|img)\b/i;
const REPEATED_RE = /(.)\1{7,}/;

export interface SpamAssessment {
  /** Machine-readable indicator keys, e.g. `links:3`. Empty when nothing fired. */
  indicators: string[];
  /** Count of indicators. Advisory only — never compared against a reject threshold. */
  score: number;
}

export interface SpamInput {
  name?: string;
  email?: string;
  message?: string;
  organization?: string;
}

/**
 * Assess an enquiry for review signals. Always returns; never throws.
 */
export function assessSpam(input: SpamInput): SpamAssessment {
  const indicators: string[] = [];
  const message = input.message ?? "";
  const name = input.name ?? "";

  const links = message.match(URL_RE)?.length ?? 0;
  if (links > 0) indicators.push(`links:${links}`);
  if (HTML_RE.test(message)) indicators.push("html-markup");
  if (BBCODE_RE.test(message)) indicators.push("bbcode");
  if (REPEATED_RE.test(message)) indicators.push("repeated-characters");

  const domain = (input.email ?? "").split("@")[1]?.toLowerCase();
  if (domain && DISPOSABLE_DOMAINS.has(domain)) indicators.push("disposable-email-domain");

  if (URL_RE.test(name)) indicators.push("url-in-name");
  URL_RE.lastIndex = 0; // global regex — reset so the next call is not skewed

  const letters = message.replace(/[^a-z]/gi, "").length;
  if (message.length >= 20 && letters / message.length < 0.4) indicators.push("low-alpha-ratio");

  const upper = message.replace(/[^A-Z]/g, "").length;
  if (message.length >= 40 && upper / Math.max(letters, 1) > 0.8) indicators.push("all-caps");

  return { indicators, score: indicators.length };
}
