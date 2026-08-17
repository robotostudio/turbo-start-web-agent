import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import {
  droppedSections,
  missingSections,
  parseSections,
  renderGallery,
  stubSection,
} from "./gallery-sections.ts";

test("gallery is in sync with the schema registry", () => {
  assert.doesNotThrow(() =>
    execFileSync("node", ["--experimental-strip-types", "scripts/generate-gallery.ts", "--check"], {
      stdio: "pipe",
    }),
  );
});

test("parseSections extracts a section's raw text verbatim, tags included", () => {
  const source = ['<BlockSpec name="Hero">', "", '<Hero title="Hi" />', "", "</BlockSpec>"].join(
    "\n",
  );
  const sections = parseSections(source);
  assert.equal(sections.get("Hero"), source);
});

test("parseSections finds multiple sections independently", () => {
  const source = [
    '<BlockSpec name="Hero">',
    "hero body",
    "</BlockSpec>",
    "",
    '<BlockSpec name="CTA">',
    "cta body",
    "</BlockSpec>",
  ].join("\n");
  const sections = parseSections(source);
  assert.equal(sections.size, 2);
  assert.match(sections.get("Hero") ?? "", /hero body/);
  assert.match(sections.get("CTA") ?? "", /cta body/);
});

test("parseSections drops a section with no closing tag", () => {
  const source = ['<BlockSpec name="Hero">', "unterminated"].join("\n");
  const sections = parseSections(source);
  assert.equal(sections.size, 0);
});

test("parseSections returns an empty map for an empty source", () => {
  assert.equal(parseSections("").size, 0);
});

test("renderGallery preserves an existing section verbatim", () => {
  const handWritten = [
    '<BlockSpec name="Hero">',
    "",
    '<Hero title="Hi" />',
    "",
    "</BlockSpec>",
  ].join("\n");
  const existing = new Map([["Hero", handWritten]]);
  const rendered = renderGallery(["Hero"], existing);
  assert.match(rendered, new RegExp(handWritten.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("renderGallery stubs a Block with no existing section", () => {
  const rendered = renderGallery(["Hero"], new Map());
  assert.match(rendered, /<BlockSpec name="Hero" status="todo">\n<\/BlockSpec>\n$/);
});

test("renderGallery drops a section for a Block no longer registered", () => {
  const existing = new Map([
    ["Hero", stubSection("Hero")],
    ["Ghost", stubSection("Ghost")],
  ]);
  const rendered = renderGallery(["Hero"], existing);
  assert.doesNotMatch(rendered, /Ghost/);
});

test("renderGallery emits sections in registry order", () => {
  const rendered = renderGallery(["CTA", "Hero"], new Map());
  const ctaIndex = rendered.indexOf('name="CTA"');
  const heroIndex = rendered.indexOf('name="Hero"');
  assert.ok(ctaIndex > -1 && heroIndex > -1 && ctaIndex < heroIndex);
});

test("renderGallery includes the fixed noindex frontmatter", () => {
  const rendered = renderGallery(["Hero"], new Map());
  assert.match(rendered, /title: Block gallery/);
  assert.match(rendered, /description: Every Block in this template, rendered live\./);
  assert.match(rendered, /noindex: true/);
});

test("droppedSections names a Block present in the file but not the registry", () => {
  const existing = new Map([
    ["Hero", stubSection("Hero")],
    ["Ghost", stubSection("Ghost")],
  ]);
  assert.deepEqual(droppedSections(["Hero"], existing), ["Ghost"]);
});

test("missingSections names a registered Block with no existing section", () => {
  const existing = new Map([["Hero", stubSection("Hero")]]);
  assert.deepEqual(missingSections(["Hero", "CTA"], existing), ["CTA"]);
});
