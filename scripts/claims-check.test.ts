import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkClaims,
  checkCount,
  checkEnumeration,
  checkSample,
  type Registry,
  registryFrom,
} from "./claims-check.ts";

// A registry standing in for catalog.json. Small on purpose: these rules care
// about agreement with the registry, not about its size.
const REGISTRY: Registry = {
  count: 4,
  names: ["Banner", "Hero", "CTA", "Pricing"],
};

test("registryFrom reads the count and the names out of a catalog", () => {
  const catalog = JSON.stringify({
    blockCount: 2,
    blocks: { Hero: { schema: {} }, CTA: { schema: {} } },
  });
  assert.deepEqual(registryFrom(catalog), { count: 2, names: ["Hero", "CTA"] });
});

// --- Rule 1: the count -------------------------------------------------------

// README.md:49 as it stood on 2026-08-28, after v0 added two Blocks in live
// sessions and every code gate stayed green. This is the regression the check
// exists for.
test("catches the stale count that shipped in the README", () => {
  const source = "ships **14 Blocks**; the full set lives at `src/lib/blocks/schemas.ts`\n";
  const claims = checkCount("README.md", source, { count: 16, names: [] });
  assert.equal(claims.length, 1);
  assert.equal(claims[0].line, 1);
  assert.match(claims[0].message, /claims 14 Blocks; the registry has 16/);
});

test("a correct count passes", () => {
  assert.deepEqual(checkCount("README.md", "ships **4 Blocks**", REGISTRY), []);
});

test("reports the line the claim is actually on", () => {
  const source = "one\ntwo\nthree\nships **9 Blocks** today\n";
  const claims = checkCount("README.md", source, REGISTRY);
  assert.equal(claims.length, 1);
  assert.equal(claims[0].line, 4);
});

// design-a-block opens with "a page of fifteen unrelated Blocks" as an
// illustration. Gating spelled-out numbers would force digits into prose that
// reads better without them, for no gain: nobody updates a rhetorical fifteen.
test("a number spelled out in words is not a claim", () => {
  const source = "a page of fifteen unrelated Blocks looks like one site\n";
  assert.deepEqual(checkCount("SKILL.md", source, REGISTRY), []);
});

// --- Rule 2: the catalog.json sample ----------------------------------------

test("catches a stale blockCount in a sample", () => {
  const source = '```json\n{\n  "blockCount": 14,\n  "blocks": {}\n}\n```\n';
  const claims = checkSample("SKILL.md", source, { count: 16, names: [] });
  assert.equal(claims.length, 1);
  assert.equal(claims[0].line, 3);
  assert.match(claims[0].message, /the real value is 16/);
});

test("a correct sample passes", () => {
  assert.deepEqual(checkSample("SKILL.md", '  "blockCount": 4,', REGISTRY), []);
});

// --- Rule 3: the enumeration -------------------------------------------------

// compose-page/SKILL.md:53 as it stood on 2026-08-28: a complete list of Block
// names, two short. An agent reading it would not know `Comparison` existed and
// would either work around its absence or build a second one.
test("catches an enumeration missing a registered Block", () => {
  const source =
    "Today's 3 Blocks: `Banner`, `Hero`, `CTA`. For a worked example, read home.mdx.\n";
  const claims = checkEnumeration("SKILL.md", source, REGISTRY);
  assert.equal(claims.length, 1);
  assert.match(claims[0].message, /Missing: Pricing/);
});

test("catches an enumeration naming a Block that does not exist", () => {
  const source = "Today's Blocks: `Banner`, `Hero`, `CTA`, `Pricing`, `Carousel`. Read home.mdx.\n";
  const claims = checkEnumeration("SKILL.md", source, REGISTRY);
  assert.equal(claims.length, 1);
  assert.match(claims[0].message, /Not in the registry: Carousel/);
});

test("a complete enumeration passes", () => {
  const source = "Today's 4 Blocks: `Banner`, `Hero`, `CTA`, `Pricing`. For a worked example.\n";
  assert.deepEqual(checkEnumeration("SKILL.md", source, REGISTRY), []);
});

test("an enumeration wrapped across lines is read whole", () => {
  const source = "Today's 4 Blocks: `Banner`, `Hero`,\n`CTA`, `Pricing`. For a worked example.\n";
  assert.deepEqual(checkEnumeration("SKILL.md", source, REGISTRY), []);
});

// The discriminator that keeps this rule usable. The README names four Blocks
// as examples one line above the count claim; if a list of examples tripped
// this, every mention of a Block name would have to be exhaustive.
test("a list of EXAMPLES is not an enumeration", () => {
  const source =
    "Pages are composed from **Blocks** — pre-built sections such as `Hero`,\n" +
    "`FeatureGrid`, `Testimonial`, and `CTA`. The registry ships 4 Blocks.\n";
  assert.deepEqual(checkEnumeration("README.md", source, REGISTRY), []);
});

test("the sentence ends at the full stop, so later prose is not swallowed", () => {
  const source =
    "Today's 4 Blocks: `Banner`, `Hero`, `CTA`, `Pricing`. If the Block you need\n" +
    "does not exist, that is a code change — see `Carousel` in the README.\n";
  assert.deepEqual(checkEnumeration("SKILL.md", source, REGISTRY), []);
});

// --- All rules together ------------------------------------------------------

test("checkClaims runs every rule over one file", () => {
  const source =
    '"blockCount": 9,\nships **9 Blocks**\nToday\'s 9 Blocks: `Banner`, `Hero`. Done.\n';
  const claims = checkClaims("SKILL.md", source, REGISTRY);
  assert.equal(claims.length, 4);
  assert.deepEqual(
    claims.map((c) => c.file),
    ["SKILL.md", "SKILL.md", "SKILL.md", "SKILL.md"],
  );
});

test("a file with no claims about the registry is silent", () => {
  const source = "# A skill\n\nCompose pages from Blocks. Read the catalog first.\n";
  assert.deepEqual(checkClaims("SKILL.md", source, REGISTRY), []);
});
