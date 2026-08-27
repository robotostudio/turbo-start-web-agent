import assert from "node:assert/strict";
import { test } from "node:test";
import { brandFrom, findBrand } from "./brand-check.ts";

test("brandFrom reads the name field", () => {
  const yml = ["# a comment", "name: Harbour", "", "description: something"].join("\n");
  assert.equal(brandFrom(yml), "Harbour");
});

test("brandFrom strips quotes and trailing space", () => {
  assert.equal(brandFrom('name: "Northwind Studio"  '), "Northwind Studio");
  assert.equal(brandFrom("name: Northwind Studio"), "Northwind Studio");
});

test("brandFrom returns null when there is no name", () => {
  assert.equal(brandFrom("description: no name here"), null);
});

// The caption that shipped on PR #51, reproduced verbatim. Every gate passed
// it, because none of them read English.
test("catches the brand name in a Block, as it appeared on PR #51", () => {
  const files = [
    {
      path: "src/components/blocks/comparison.tsx",
      source: [
        '<caption className="sr-only">',
        "  Comparison of Harbour and the traditional approach",
        "</caption>",
      ].join("\n"),
    },
  ];
  const hits = findBrand(files, "Harbour");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].line, 2);
  assert.match(hits[0].text, /Comparison of Harbour/);
});

test("a component reading the name from content passes", () => {
  const files = [
    {
      path: "src/components/site/site-header.tsx",
      source:
        'import { site } from "#velite";\n\nexport const Brand = () => <span>{site.name}</span>;',
    },
  ];
  assert.deepEqual(findBrand(files, "Harbour"), []);
});

// Case-sensitive on purpose: a lowercase or hyphenated form turns up in
// package names, URLs and class names that have nothing to do with the brand,
// and flagging those would train an author to ignore this check.
test("a lowercase coincidence is not flagged", () => {
  const files = [{ path: "src/lib/x.ts", source: 'const url = "https://harbour.example.com";' }];
  assert.deepEqual(findBrand(files, "Harbour"), []);
});

test("the check renames with the site", () => {
  const files = [{ path: "src/x.tsx", source: "<p>Welcome to Northwind</p>" }];
  assert.equal(findBrand(files, "Northwind").length, 1);
  assert.deepEqual(findBrand(files, "Harbour"), [], "the old name is not what is checked");
});
