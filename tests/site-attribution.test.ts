/**
 * Service continuity from service pages, campaign capture, and the canonical
 * public origin.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SERVICE_PAGE_KEYS, cta, discussCaseHref } from "../src/content/cta-routes.ts";
import { SERVICE_INTENT, SERVICE_KEYS, SOURCE_WEBSITE } from "../src/lib/enquiry/types.ts";
import { validateEnquiry } from "../src/lib/enquiry/validate.ts";
import { hasCampaignParams, landingUrlFrom, readTouch, toAttributionPayload } from "../src/lib/attribution/acquisition.ts";
import { site } from "../src/content/site.ts";

const ROOT = resolve(import.meta.dirname, "..");
const HOST = "image3dconversion.com";
const NOW = "2026-11-02T10:00:00.000Z";

describe("service page → /discuss-a-case/", () => {
  test("every service page carries an approved key in its link", () => {
    assert.equal(Object.keys(SERVICE_PAGE_KEYS).length, 8);
    for (const [page, key] of Object.entries(SERVICE_PAGE_KEYS)) {
      assert.ok(SERVICE_KEYS.includes(key), key);
      assert.equal(discussCaseHref(page), `/discuss-a-case/?service=${key}#form`);
    }
  });

  test("the key reaches the existing Service_Interest model", () => {
    for (const [page, key] of Object.entries(SERVICE_PAGE_KEYS)) {
      const url = new URL(discussCaseHref(page), "https://image3dconversion.com");
      const r = validateEnquiry(
        {
          inquiryType: "service-information",
          name: "Asha Rao",
          email: "doctor@clinic-sample.in",
          message: "We would like planning support.",
          consent: true,
          serviceKey: url.searchParams.get("service"),
          pageSource: url.pathname,
        },
        NOW,
      );
      assert.ok(r.ok && r.value, page);
      assert.deepEqual(r.value.serviceIntent, SERVICE_INTENT[key], page);
      assert.equal(r.value.serviceKey, key);
    }
  });

  test("the full-arch page maps to its exact picklist values", () => {
    assert.deepEqual(SERVICE_INTENT[SERVICE_PAGE_KEYS["/full-arch-stackable-workflow/"]], {
      service: "Full-Arch/Stackable Guide",
      workflow: "Full-Arch",
    });
  });

  test("a page without a service keeps the plain link", () => {
    assert.equal(discussCaseHref("/case-requirements/"), cta.discussCase.href);
    assert.equal(discussCaseHref(), cta.discussCase.href);
  });

  test("an invented key is ignored by the server", () => {
    const r = validateEnquiry(
      { inquiryType: "general", name: "A", email: "doctor@clinic-sample.in", message: "Hello there.", consent: true, serviceKey: "made-up" },
      NOW,
    );
    assert.equal(r.value?.serviceKey, undefined);
    assert.deepEqual(r.value?.serviceIntent, {});
  });
});

describe("campaign capture", () => {
  const FULL =
    "https://image3dconversion.com/case-portal/?utm_source=facebook&utm_medium=paid_social&utm_campaign=c&utm_content=ad&utm_term=t" +
    "&utm_id=u1&campaign_id=c1&adset_id=s1&ad_id=a1&fbclid=IwAR-x&name=stray#request-invitation";

  test("all ten parameters are read from the query string", () => {
    const t = readTouch(FULL, "", HOST, NOW);
    assert.deepEqual(t?.utm, { source: "facebook", medium: "paid_social", campaign: "c", content: "ad", term: "t" });
    assert.equal(t?.fbclid, "IwAR-x");
    assert.equal(t?.utmId, "u1");
    assert.equal(t?.campaignId, "c1");
    assert.equal(t?.adsetId, "s1");
    assert.equal(t?.adId, "a1");
  });

  test("any ad identifier alone marks a campaign touch", () => {
    for (const p of ["utm_id", "campaign_id", "adset_id", "ad_id"]) assert.ok(hasCampaignParams(`?${p}=1`), p);
  });

  test("the identifiers survive the payload and validation", () => {
    const payload = toAttributionPayload(readTouch(FULL, "", HOST, NOW), null);
    const r = validateEnquiry(
      { inquiryType: "general", name: "A", email: "doctor@clinic-sample.in", message: "Hello there.", consent: true, attribution: payload },
      NOW,
    );
    const a = r.value?.attribution;
    assert.deepEqual([a?.utmId, a?.campaignId, a?.adsetId, a?.adId, a?.fbclid], ["u1", "c1", "s1", "a1", "IwAR-x"]);
  });

  test("the entry URL keeps campaign parameters only, without the fragment", () => {
    const u = landingUrlFrom(FULL) ?? "";
    assert.ok(u.includes("ad_id=a1") && u.includes("utm_id=u1"));
    assert.ok(!u.includes("stray") && !u.includes("#"));
  });

  test("parameters after # are not attribution", () => {
    const hashed = "https://image3dconversion.com/case-portal/#request-invitation?utm_source=facebook&ad_id=a1&fbclid=IwAR-x";
    assert.equal(readTouch(hashed, "", HOST, NOW), null);
    assert.equal(landingUrlFrom(hashed), "https://image3dconversion.com/case-portal/");
  });

  test("an external referrer on a hash-only URL still records no campaign values", () => {
    const hashed = "https://image3dconversion.com/case-portal/#x?utm_campaign=c";
    const t = readTouch(hashed, "https://l.facebook.com/", HOST, NOW);
    assert.equal(t?.utm, undefined);
    assert.equal(t?.campaignId, undefined);
  });
});

describe("canonical public origin", () => {
  const APEX = "https://image3dconversion.com";

  test("site.url and SOURCE_WEBSITE are the apex", () => {
    assert.equal(site.url, APEX);
    assert.equal(SOURCE_WEBSITE, APEX);
  });

  test("the CMS settings agree", () => {
    const settings = JSON.parse(readFileSync(resolve(ROOT, "content/settings/site.json"), "utf8"));
    assert.equal(settings.url, APEX);
  });

  test("no public-origin www reference remains in source", () => {
    for (const file of ["src/content/site.ts", "src/content/pages/home.ts", "src/lib/enquiry/types.ts", "content/settings/site.json"]) {
      assert.ok(!readFileSync(resolve(ROOT, file), "utf8").includes("www.image3dconversion.com"), file);
    }
  });
});
