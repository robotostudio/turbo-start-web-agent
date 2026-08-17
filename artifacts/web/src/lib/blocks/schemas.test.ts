import assert from "node:assert/strict";
import { test } from "node:test";
import { ctaSchema, heroSchema, parseBlock } from "./schemas.ts";

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
