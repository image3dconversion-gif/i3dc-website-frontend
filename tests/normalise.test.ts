/**
 * Identifier normalisation.
 *
 * These keys drive the CRM's "V2 SYS - Duplicate Classification" rule, which
 * matches leads on an EXACT normalised email or phone. A change that makes two
 * different people collide — or stops the same person colliding with themselves
 * — is a data-integrity bug, so the duplicate-variant cases below are the point
 * of this file, not an afterthought.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  normaliseEmail,
  normalisePhone,
  toZohoDateTime,
  MAX_NORMALISED_EMAIL,
  MAX_NORMALISED_PHONE,
} from "../src/lib/enquiry/normalise.ts";

describe("normaliseEmail", () => {
  test("trims and lowercases", () => {
    assert.equal(normaliseEmail("  Dr.Smith@Example.COM "), "dr.smith@example.com");
  });

  test("preserves plus tags", () => {
    assert.equal(normaliseEmail("clinic+i3dc@gmail.com"), "clinic+i3dc@gmail.com");
  });

  test("preserves dots in the local part", () => {
    assert.equal(normaliseEmail("first.last@gmail.com"), "first.last@gmail.com");
  });

  test("plus-tagged and untagged addresses stay DISTINCT", () => {
    // Stripping tags would merge two people who may genuinely be different.
    assert.notEqual(normaliseEmail("a+one@x.com"), normaliseEmail("a@x.com"));
  });

  test("duplicate variants collapse to one key", () => {
    const variants = ["Foo.Bar+CRM@Example.com", "foo.bar+crm@example.com", "  FOO.BAR+CRM@EXAMPLE.COM  "];
    const keys = new Set(variants.map(normaliseEmail));
    assert.equal(keys.size, 1, "case/whitespace variants must produce one key");
  });

  test("malformed input yields no key rather than junk", () => {
    for (const bad of ["", "   ", "not-an-email", undefined]) {
      assert.equal(normaliseEmail(bad as string | undefined), undefined);
    }
  });

  test("respects the Zoho field limit", () => {
    const long = "a".repeat(200) + "@example.com";
    assert.ok((normaliseEmail(long) ?? "").length <= MAX_NORMALISED_EMAIL);
  });
});

describe("normalisePhone — Indian numbers get +91", () => {
  const indian: Array<[string, string, string]> = [
    ["9876543210", "+919876543210", "india-bare"],
    ["98765 43210", "+919876543210", "india-bare"],
    ["987-654-3210", "+919876543210", "india-bare"],
    ["09876543210", "+919876543210", "india-trunk"],
    ["919876543210", "+919876543210", "india-cc"],
    ["6123456789", "+916123456789", "india-bare"],
  ];
  for (const [input, expected, basis] of indian) {
    test(`${input} → ${expected}`, () => {
      const r = normalisePhone(input);
      assert.equal(r.normalised, expected);
      assert.equal(r.basis, basis);
    });
  }

  test("all formatting variants of one number collapse to one key", () => {
    const variants = ["9876543210", "+91 98765 43210", "098765 43210", "0091-9876543210", "91 9876543210"];
    const keys = new Set(variants.map((v) => normalisePhone(v).normalised));
    assert.equal(keys.size, 1, `expected one key, got ${[...keys].join(" | ")}`);
  });
});

describe("normalisePhone — international numbers are preserved", () => {
  const international: Array<[string, string]> = [
    ["+1 415 555 2671", "+14155552671"],
    ["+44 20 7946 0958", "+442079460958"],
    ["+971 50 123 4567", "+971501234567"],
    ["+61 2 9374 4000", "+61293744000"],
  ];
  for (const [input, expected] of international) {
    test(`${input} keeps its own country code`, () => {
      const r = normalisePhone(input);
      assert.equal(r.normalised, expected);
      assert.equal(r.basis, "international");
      assert.ok(!r.normalised?.startsWith("+91"), "must not be re-coded to +91");
    });
  }
});

describe("normalisePhone — refuses to guess", () => {
  const unresolved = ["1234567890", "5551234567", "12345", "abc", "+", "()-", "98765432101234567890"];
  for (const input of unresolved) {
    test(`${JSON.stringify(input)} is left unresolved rather than guessed`, () => {
      const r = normalisePhone(input);
      if (r.normalised) {
        // The only acceptable non-undefined outcome is a passthrough, never +91.
        assert.ok(!r.normalised.startsWith("+91"), `${input} must not become an Indian number`);
      } else {
        assert.equal(r.basis, "unresolved");
      }
    });
  }

  test("empty input is reported as empty, not unresolved", () => {
    assert.equal(normalisePhone("").basis, "empty");
    assert.equal(normalisePhone(undefined).basis, "empty");
  });

  test("respects the Zoho field limit", () => {
    const r = normalisePhone("+" + "9".repeat(60));
    assert.ok((r.normalised ?? "").length <= MAX_NORMALISED_PHONE);
  });
});

describe("toZohoDateTime", () => {
  test("emits an explicit numeric offset, never a bare Z", () => {
    const out = toZohoDateTime("2026-08-26T12:34:56.789Z");
    assert.equal(out, "2026-08-26T12:34:56+00:00");
    assert.ok(!out.endsWith("Z"));
  });

  test("malformed dates yield an empty string, not Invalid Date", () => {
    assert.equal(toZohoDateTime("nonsense"), "");
  });
});
