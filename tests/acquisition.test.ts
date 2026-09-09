/**
 * Cross-page acquisition attribution.
 *
 * The defect these tests lock down: campaign values used to be read from the
 * form page's own query string, so any visitor who landed on a service page and
 * then navigated to the form arrived with no attribution at all. The resolution
 * rules below are pure, so they are tested without a browser.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  externalReferrer,
  hasCampaignParams,
  landingUrlFrom,
  readTouch,
  resolveTouch,
  toAttributionPayload,
} from "../src/lib/attribution/acquisition.ts";

const HOST = "image3dconversion.com";
const T1 = "2026-09-09T10:00:00.000Z";
const T2 = "2026-09-09T10:05:00.000Z";
const AD_LANDING =
  "https://image3dconversion.com/guided-implant-workflow/?utm_source=google&utm_medium=cpc&utm_campaign=guided&utm_content=ad-a&utm_term=surgical+guide&gclid=Cj0-test";

describe("detecting an acquisition touch", () => {
  test("campaign parameters mark a page view as a touch", () => {
    assert.equal(hasCampaignParams("?utm_source=google"), true);
    assert.equal(hasCampaignParams("?gclid=abc"), true);
    assert.equal(hasCampaignParams("?fbclid=xyz"), true);
    assert.equal(hasCampaignParams("?service=design-only"), false);
    assert.equal(hasCampaignParams(""), false);
  });

  test("empty campaign values do not count", () => {
    assert.equal(hasCampaignParams("?utm_source=&utm_medium="), false);
  });

  test("only an EXTERNAL referrer counts", () => {
    assert.equal(externalReferrer("https://www.google.com/", HOST), "https://www.google.com/");
    assert.equal(externalReferrer(`https://${HOST}/faq/`, HOST), undefined, "own host must be ignored");
    assert.equal(externalReferrer("", HOST), undefined);
    assert.equal(externalReferrer("not-a-url", HOST), undefined);
  });
});

describe("landing URL is campaign-only", () => {
  test("keeps campaign parameters", () => {
    const url = landingUrlFrom(AD_LANDING) ?? "";
    assert.ok(url.includes("utm_source=google"));
    assert.ok(url.includes("gclid=Cj0-test"));
    assert.ok(url.startsWith("https://image3dconversion.com/guided-implant-workflow/"));
  });

  test("drops every non-campaign parameter, so no personal data can ride along", () => {
    const url = landingUrlFrom(`https://${HOST}/discuss-a-case/?email=someone@example.com&ref=abc&utm_source=meta`) ?? "";
    assert.ok(!url.includes("someone@example.com"), "must not carry an email");
    assert.ok(!url.includes("ref=abc"));
    assert.ok(url.includes("utm_source=meta"));
  });
});

describe("the touch survives navigation", () => {
  test("an ad landing captures every campaign value", () => {
    const touch = readTouch(AD_LANDING, "https://www.google.com/", HOST, T1);
    assert.ok(touch);
    assert.deepEqual(touch.utm, {
      source: "google",
      medium: "cpc",
      campaign: "guided",
      content: "ad-a",
      term: "surgical guide",
    });
    assert.equal(touch.gclid, "Cj0-test");
    assert.equal(touch.referrer, "https://www.google.com/");
  });

  test("ordinary in-site navigation is NOT a new touch", () => {
    const nav = readTouch(`https://${HOST}/discuss-a-case/`, `https://${HOST}/guided-implant-workflow/`, HOST, T2);
    assert.equal(nav, null, "an internal page view must not reset attribution");
  });

  test("REGRESSION: the ad campaign still applies at the form page", () => {
    // Land on a service page from an ad, then navigate to the form.
    const stored = readTouch(AD_LANDING, "https://www.google.com/", HOST, T1);
    const atForm = readTouch(`https://${HOST}/discuss-a-case/`, `https://${HOST}/guided-implant-workflow/`, HOST, T2);
    const resolved = resolveTouch(stored, atForm);
    assert.equal(resolved?.utm?.source, "google", "this was lost before persistence existed");
    assert.equal(resolved?.gclid, "Cj0-test");
  });

  test("a fresh campaign replaces the stored one rather than blending", () => {
    const first = readTouch(`https://${HOST}/?utm_source=google&utm_campaign=old`, "", HOST, T1);
    const second = readTouch(`https://${HOST}/?utm_source=meta&fbclid=fb-1`, "", HOST, T2);
    const resolved = resolveTouch(first, second);
    assert.equal(resolved?.utm?.source, "meta");
    assert.equal(resolved?.utm?.campaign, undefined, "the old campaign must not survive into a new touch");
    assert.equal(resolved?.fbclid, "fb-1");
  });

  test("an external referral with no campaign params is still a touch", () => {
    const touch = readTouch(`https://${HOST}/faq/`, "https://forum.example/thread", HOST, T1);
    assert.ok(touch);
    assert.equal(touch.referrer, "https://forum.example/thread");
    assert.equal(touch.utm, undefined);
  });

  test("fbclid is captured for continuity", () => {
    const touch = readTouch(`https://${HOST}/?fbclid=IwAR-test`, "https://l.facebook.com/", HOST, T1);
    assert.equal(touch?.fbclid, "IwAR-test");
  });
});

describe("payload shape", () => {
  test("first touch is preferred for the landing URL, last touch for the campaign", () => {
    const first = { landingUrl: `https://${HOST}/faq/`, atIso: T1 };
    const touch = readTouch(`https://${HOST}/?utm_source=meta`, "", HOST, T2);
    const payload = toAttributionPayload(touch, first);
    assert.equal(payload.landingUrl, `https://${HOST}/faq/`);
    assert.equal(payload.utm?.source, "meta");
    assert.equal(payload.firstTouchIso, T1);
    assert.equal(payload.lastTouchIso, T2);
  });

  test("an organic visit still yields a last-touch timestamp", () => {
    const payload = toAttributionPayload({ startedAtIso: T2 }, { atIso: T1 });
    assert.equal(payload.lastTouchIso, T2);
    assert.equal(payload.utm, undefined);
    assert.equal(payload.gclid, undefined);
  });
});
