import assert from "node:assert/strict";
import { test } from "node:test";
import { getEntries, getEntry, getIndexableSlugs, getSlugs } from "./loader.ts";

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
