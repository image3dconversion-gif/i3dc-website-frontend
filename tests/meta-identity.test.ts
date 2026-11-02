/**
 * website_ref, the event id derived from it, and synthetic classification.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { deriveMetaEventId, isWebsiteRef, mintWebsiteRef } from "../src/lib/meta/identity.ts";
import { isMetaEventId } from "../src/lib/meta/constants.ts";
import { isSyntheticSubmission } from "../src/lib/meta/synthetic.ts";

const SECRET = "fake-i3dc-event-id-secret-0123456789abcdef";
const REF = "i3dc_ref_00112233445566778899aabbccddeeff";

describe("website_ref", () => {
  test("opaque, random, and unique per attempt", () => {
    const refs = new Set(Array.from({ length: 200 }, mintWebsiteRef));
    assert.equal(refs.size, 200);
    for (const ref of refs) assert.ok(isWebsiteRef(ref), ref);
  });

  test("takes no input, so it cannot carry personal data", () => {
    assert.equal(mintWebsiteRef.length, 0);
    assert.match(mintWebsiteRef(), /^i3dc_ref_[0-9a-f]{32}$/);
  });
});

describe("event_id", () => {
  test("is deterministic: the same ref and secret always give the same id", () => {
    const first = deriveMetaEventId(REF, SECRET);
    for (let i = 0; i < 5; i++) assert.equal(deriveMetaEventId(REF, SECRET), first);
    assert.ok(isMetaEventId(first), first);
  });

  test("differs by reference and by secret", () => {
    const base = deriveMetaEventId(REF, SECRET);
    assert.notEqual(deriveMetaEventId("i3dc_ref_ffeeddccbbaa99887766554433221100", SECRET), base);
    assert.notEqual(deriveMetaEventId(REF, `${SECRET}x`), base);
  });

  test("does not reveal the reference it came from", () => {
    const id = deriveMetaEventId(REF, SECRET);
    assert.ok(!id.includes(REF.slice("i3dc_ref_".length)));
    assert.match(id, /^i3dc_lead_[0-9a-f]{32}$/);
  });

  test("refuses anything but a genuine reference, so no PII can be hashed into it", () => {
    for (const bad of ["doctor@clinic-sample.in", "9876543210", "", "i3dc_ref_short"]) {
      assert.throws(() => deriveMetaEventId(bad, SECRET));
    }
    assert.throws(() => deriveMetaEventId(REF, ""));
  });

  test("isMetaEventId accepts the derived format only", () => {
    for (const bad of ["3f1c2b9a-6d4e-4f8a-9b7c-1a2b3c4d5e6f", REF, "i3dc_lead_XYZ", "", null, 7]) {
      assert.equal(isMetaEventId(bad), false, String(bad));
    }
  });
});

describe("synthetic classification", () => {
  const req = (headers: Record<string, string> = {}) => new Request("http://127.0.0.1/api/enquiry/", { method: "POST", headers });

  test("a genuine address on a plain request is not synthetic", () => {
    assert.equal(isSyntheticSubmission("doctor@clinic-sample.in", req(), {}), false);
    assert.equal(isSyntheticSubmission("first+last@clinic-sample.in", req(), {}), false);
  });

  test("reserved domains are synthetic", () => {
    for (const email of ["a@example.com", "a@EXAMPLE.org", "a@sub.example.net", "a@x.test", "a@y.invalid", "a@z.localhost", "a@w.example"]) {
      assert.equal(isSyntheticSubmission(email, req(), {}), true, email);
    }
  });

  test("test sub-addresses are synthetic", () => {
    for (const email of ["a+test@clinic-sample.in", "a+uat-3@clinic-sample.in", "a+i3dc-test@clinic-sample.in"]) {
      assert.equal(isSyntheticSubmission(email, req(), {}), true, email);
    }
  });

  test("operators can name addresses and domains on the server", () => {
    const env = { META_SYNTHETIC_EMAILS: "qa@clinic-sample.in, @certify-sample.in" };
    assert.equal(isSyntheticSubmission("QA@clinic-sample.in", req(), env), true);
    assert.equal(isSyntheticSubmission("any@certify-sample.in", req(), env), true);
    assert.equal(isSyntheticSubmission("doctor@clinic-sample.in", req(), env), false);
  });

  test("the header counts only when it matches the server secret", () => {
    const env = { META_SYNTHETIC_KEY: "server-held-key" };
    assert.equal(isSyntheticSubmission("doctor@clinic-sample.in", req({ "x-i3dc-synthetic": "server-held-key" }), env), true);
    assert.equal(isSyntheticSubmission("doctor@clinic-sample.in", req({ "x-i3dc-synthetic": "guess" }), env), false);
    assert.equal(isSyntheticSubmission("doctor@clinic-sample.in", req({ "x-i3dc-synthetic": "server-held-key" }), {}), false);
  });
});
