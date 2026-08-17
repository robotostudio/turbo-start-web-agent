import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import {
  assertNamesParsable,
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

// --- Regression tests: silent data-loss bugs -------------------------------

test("parseSections treats CRLF line endings the same as LF", () => {
  const lf = ['<BlockSpec name="Hero">', "", '<Hero title="Hi" />', "", "</BlockSpec>"].join("\n");
  const crlf = lf.replace(/\n/g, "\r\n");
  const lfSections = parseSections(lf);
  const crlfSections = parseSections(crlf);
  assert.equal(crlfSections.size, 1);
  assert.equal(crlfSections.get("Hero"), lfSections.get("Hero"));
});

test("a body containing a literal </BlockSpec> line (in a fenced code sample) round-trips byte-identically", () => {
  const source = [
    '<BlockSpec name="Hero">',
    "",
    "Example MDX syntax for reference:",
    "",
    "```mdx",
    '<BlockSpec name="Example">',
    '  <Hero title="x" />',
    "</BlockSpec>",
    "```",
    "",
    '<Hero title="Hi" />',
    "",
    "</BlockSpec>",
  ].join("\n");
  const sections = parseSections(source);
  assert.equal(sections.size, 1);
  assert.equal(sections.get("Hero"), source);
  // Round-trip through render as well.
  const rendered = renderGallery(["Hero"], sections);
  assert.match(rendered, /<Hero title="Hi" \/>/);
  assert.equal((rendered.match(/<\/BlockSpec>/g) ?? []).length, 2);
});

test("a body containing <BlockSpec inside a fenced code sample does not break sectioning", () => {
  const source = [
    '<BlockSpec name="Hero">',
    "",
    "```mdx",
    '<BlockSpec name="Example">',
    "  ...",
    "</BlockSpec>",
    "```",
    "",
    '<Hero title="Hi" />',
    "",
    "</BlockSpec>",
    "",
    '<BlockSpec name="CTA">',
    "",
    '<CTA title="Start" />',
    "",
    "</BlockSpec>",
  ].join("\n");
  const sections = parseSections(source);
  assert.equal(sections.size, 2);
  assert.match(sections.get("Hero") ?? "", /<Hero title="Hi" \/>/);
  assert.match(sections.get("CTA") ?? "", /<CTA title="Start" \/>/);
});

test("two sections with the same name throw instead of silently dropping one", () => {
  const source = [
    '<BlockSpec name="Hero">',
    "first",
    "</BlockSpec>",
    "",
    '<BlockSpec name="Hero">',
    "second",
    "</BlockSpec>",
  ].join("\n");
  assert.throws(() => parseSections(source), /duplicate.*Hero/i);
});

test("a Block name containing a digit round-trips through parseSections", () => {
  const source = ['<BlockSpec name="Hero2">', "body", "</BlockSpec>"].join("\n");
  const sections = parseSections(source);
  assert.equal(sections.get("Hero2"), source);
});

test("assertNamesParsable does not throw for names matching the parser's pattern", () => {
  assert.doesNotThrow(() => assertNamesParsable(["Hero", "CTA", "Hero2"]));
});

test("assertNamesParsable throws naming a Block whose name the parser cannot round-trip", () => {
  assert.throws(() => assertNamesParsable(["2Hero"]), /2Hero/);
});
