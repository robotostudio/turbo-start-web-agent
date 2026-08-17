import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { ctaSchema, heroSchema, parseBlock, safeUrl } from "./schemas.ts";

test("parseBlock returns parsed data for valid props", () => {
  const parsed = parseBlock("Hero", heroSchema, { title: "Hi" });
  assert.equal(parsed.title, "Hi");
});

test("parseBlock applies schema defaults", () => {
  const parsed = parseBlock("Hero", heroSchema, { title: "Hi" });
  assert.equal(parsed.variant, "centered");
});

test("parseBlock names the Block and the bad prop path", () => {
  assert.throws(
    () => parseBlock("Hero", heroSchema, { title: 42 }),
    (error: Error) => error.message.includes("<Hero>") && error.message.includes("title"),
  );
});

test("parseBlock rejects unknown variants", () => {
  assert.throws(() => parseBlock("Hero", heroSchema, { title: "Hi", variant: "nope" }), /variant/);
});

test("parseBlock rejects a link missing href", () => {
  assert.throws(
    () => parseBlock("CTA", ctaSchema, { title: "Hi", primary: { label: "Go" } }),
    /href/,
  );
});

test("parseBlock rejects a missing required prop", () => {
  assert.throws(() => parseBlock("CTA", ctaSchema, {}), /title/);
});

test("link schema rejects javascript: hrefs", () => {
  assert.throws(
    () =>
      parseBlock("CTA", ctaSchema, {
        title: "x",
        primary: { label: "x", href: "javascript:alert(1)" },
      }),
    /href/,
  );
});

test("link schema rejects data: hrefs", () => {
  assert.throws(
    () =>
      parseBlock("CTA", ctaSchema, {
        title: "x",
        primary: { label: "x", href: "data:text/html,x" },
      }),
    /href/,
  );
});

test("link schema accepts relative, https, and mailto hrefs", () => {
  for (const href of ["/about", "https://example.com", "mailto:a@b.com", "#section"]) {
    const parsed = parseBlock("CTA", ctaSchema, { title: "x", primary: { label: "x", href } });
    assert.equal(parsed.primary?.href, href);
  }
});

test("the href URL rule survives into the JSON Schema", () => {
  const json = z.toJSONSchema(ctaSchema, { io: "input" });
  assert.match(JSON.stringify(json), /http\(s\), mailto, tel, or relative/);
});

test("safeUrl always carries its rule into the JSON Schema", () => {
  const json = z.toJSONSchema(z.object({ u: safeUrl() }), { io: "input" });
  assert.match(JSON.stringify(json), /http\(s\), mailto, tel, or relative/);
});
