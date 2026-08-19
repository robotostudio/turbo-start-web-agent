import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getEntries,
  getEntry,
  getIndexableSlugs,
  getSlugs,
  shouldIncludeDrafts,
} from "./loader.ts";

test("getSlugs returns page slugs derived from file paths", () => {
  const slugs = getSlugs("pages");
  assert.ok(slugs.includes("about"), `expected "about" in ${JSON.stringify(slugs)}`);
});

test("getEntry returns an entry with a compiled body", () => {
  const entry = getEntry("pages", "about");
  assert.equal(entry.slug, "about");
  assert.equal(entry.data.title, "About Harbour");
  assert.ok(entry.body.length > 0, "expected a compiled MDX body");
});

test("getEntry throws a named error for an unknown slug", () => {
  assert.throws(() => getEntry("pages", "does-not-exist"), /No "does-not-exist" entry/);
});

test("getEntries returns blog posts", () => {
  const entries = getEntries("blog");
  assert.ok(entries.length >= 1);
  const introducing = entries.find((e) => e.slug === "introducing-harbour");
  assert.equal(introducing?.data.category, "Product");
});

test("getSlugs includes a noindex page so its route still builds", () => {
  assert.ok(getSlugs("pages").includes("style-guide"));
});

test("getIndexableSlugs excludes noindex entries", () => {
  const slugs = getIndexableSlugs("pages");
  assert.ok(slugs.includes("about"), "expected the normal page to be indexable");
  assert.ok(!slugs.includes("style-guide"), "expected the noindex page to be excluded");
});

test("getEntry returns a published entry normally", () => {
  const entry = getEntry("pages", "about");
  assert.equal(entry.slug, "about");
  assert.equal(entry.data.title, "About Harbour");
});

test("getEntry still throws the exact message for an unknown slug", () => {
  assert.throws(() => getEntry("pages", "does-not-exist"), /No "does-not-exist" entry/);
});

test("getEntry agrees with getEntries/getSlugs on draft visibility for pages", () => {
  for (const slug of getSlugs("pages")) {
    assert.doesNotThrow(() => getEntry("pages", slug), `expected getEntry to resolve "${slug}"`);
  }
});

test("getEntry agrees with getEntries/getSlugs on draft visibility for blog", () => {
  for (const slug of getSlugs("blog")) {
    assert.doesNotThrow(() => getEntry("blog", slug), `expected getEntry to resolve "${slug}"`);
  }
});

// shouldIncludeDrafts is a pure predicate over an env-like object, exercised
// directly rather than through the module-level INCLUDE_DRAFTS constant:
// that constant is computed once from the real process.env at import time, so
// there is no way to flip it per-test without reloading the module.
test("shouldIncludeDrafts: local dev (no VERCEL_ENV, no NODE_ENV) includes drafts", () => {
  assert.equal(shouldIncludeDrafts({}), true);
});

test("shouldIncludeDrafts: Vercel production excludes drafts", () => {
  assert.equal(shouldIncludeDrafts({ VERCEL_ENV: "production" }), false);
});

test("shouldIncludeDrafts: Vercel preview includes drafts even though NODE_ENV is production", () => {
  // Next.js sets NODE_ENV=production for every `next build`, including a
  // Vercel preview deployment — VERCEL_ENV must win over NODE_ENV here.
  assert.equal(shouldIncludeDrafts({ VERCEL_ENV: "preview", NODE_ENV: "production" }), true);
});

test("shouldIncludeDrafts: off-Vercel production build (Netlify/Docker/self-hosted) excludes drafts", () => {
  // The bug this closes: no VERCEL_ENV at all, but it's a real production
  // build. Previously this fell through to "include drafts" unconditionally.
  assert.equal(shouldIncludeDrafts({ NODE_ENV: "production" }), false);
});

test("shouldIncludeDrafts: off-Vercel non-production build includes drafts", () => {
  assert.equal(shouldIncludeDrafts({ NODE_ENV: "development" }), true);
});

test("shouldIncludeDrafts: PREVIEW_DRAFTS=true forces drafts on for an off-Vercel production build", () => {
  assert.equal(shouldIncludeDrafts({ NODE_ENV: "production", PREVIEW_DRAFTS: "true" }), true);
});

test("shouldIncludeDrafts: PREVIEW_DRAFTS=true also overrides Vercel production", () => {
  // Deliberate and uniform: the escape hatch isn't special-cased per
  // platform. Setting it requires an explicit, intentional env var, so there
  // is no "accidental" path to drafts publishing on Vercel production either.
  assert.equal(shouldIncludeDrafts({ VERCEL_ENV: "production", PREVIEW_DRAFTS: "true" }), true);
});
