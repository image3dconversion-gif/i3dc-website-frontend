/**
 * Server-side identifier normalisation for CRM V2.
 *
 * The CRM's "V2 SYS - Duplicate Classification" rule matches leads on an EXACT
 * normalised email or normalised phone. Those comparisons only work if every
 * source writes identifiers the same way, so normalisation happens here, on the
 * server, and is written to `V2_Email_Normalized` / `V2_Phone_Normalized`.
 *
 * The RAW values the enquirer typed are never destroyed: they continue to go to
 * `Email` and `Mobile`. Normalisation produces an ADDITIONAL matching key, it
 * does not replace what the person entered.
 *
 * Pure functions, no I/O — unit-tested in tests/normalise.test.ts.
 */

/** Zoho `V2_Email_Normalized` is text(100); `V2_Phone_Normalized` is text(30). */
export const MAX_NORMALISED_EMAIL = 100;
export const MAX_NORMALISED_PHONE = 30;

/**
 * Trim and lowercase, nothing else.
 *
 * Plus tags and dots are DELIBERATELY preserved: `a.b+crm@gmail.com` stays
 * `a.b+crm@gmail.com`. Stripping them is a Gmail-specific convention that is
 * wrong for most providers, and it would silently merge two people who really
 * do have different addresses. Case folding is safe and is what makes
 * `Foo@Example.COM` and `foo@example.com` collide as intended.
 */
export function normaliseEmail(raw: string | undefined): string | undefined {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value || !value.includes("@")) return undefined;
  return value.slice(0, MAX_NORMALISED_EMAIL);
}

/** An Indian mobile subscriber number: 10 digits beginning 6-9. */
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export interface PhoneNormalisation {
  /** E.164-ish normalised form, or undefined when it cannot be derived safely. */
  normalised?: string;
  /** How the value was interpreted — recorded for CRM review, never guessed at. */
  basis: "international" | "india-bare" | "india-trunk" | "india-cc" | "unresolved" | "empty";
}

/**
 * Normalise a phone number conservatively.
 *
 * `+91` is applied ONLY to a bare 10-digit Indian mobile (leading 6-9) that
 * carries no country code of its own. Anything already international is passed
 * through untouched, and anything ambiguous is left unresolved rather than
 * being guessed — a wrong country code is worse than no normalised value,
 * because the duplicate classifier would then match the wrong person.
 *
 * Known and accepted ambiguity: a bare 10-digit North American number can also
 * begin 6-9, so it would be read as Indian. Callers who need that distinction
 * must collect an explicit country code; the raw value is preserved either way.
 */
export function normalisePhone(raw: string | undefined): PhoneNormalisation {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { basis: "empty" };

  // Keep a leading + (if any); drop spaces, hyphens, dots, brackets, slashes.
  const hasPlus = trimmed.startsWith("+") || trimmed.startsWith("00");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return { basis: "unresolved" };

  // 00-prefixed international dialling → treat as +.
  const international = trimmed.startsWith("00") ? digits.replace(/^00/, "") : digits;

  if (hasPlus) {
    // Already international: preserve exactly what the country code says.
    return { normalised: cap(`+${international}`), basis: "international" };
  }

  // 91XXXXXXXXXX — Indian country code without a plus.
  if (digits.length === 12 && digits.startsWith("91") && INDIAN_MOBILE.test(digits.slice(2))) {
    return { normalised: cap(`+${digits}`), basis: "india-cc" };
  }

  // 0XXXXXXXXXX — Indian national trunk prefix.
  if (digits.length === 11 && digits.startsWith("0") && INDIAN_MOBILE.test(digits.slice(1))) {
    return { normalised: cap(`+91${digits.slice(1)}`), basis: "india-trunk" };
  }

  // Bare 10-digit Indian mobile — the only case that earns an implicit +91.
  if (INDIAN_MOBILE.test(digits)) {
    return { normalised: cap(`+91${digits}`), basis: "india-bare" };
  }

  // Anything else (short, overlong, non-Indian bare number): do not guess.
  return { basis: "unresolved" };
}

function cap(value: string): string {
  return value.slice(0, MAX_NORMALISED_PHONE);
}

/**
 * Zoho datetime fields reject a bare `Z` suffix in some deployments, so emit an
 * explicit numeric offset: `2026-08-26T12:34:56+00:00`.
 */
export function toZohoDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toISOString().replace(/\.\d{3}Z$/, "")}+00:00`;
}
