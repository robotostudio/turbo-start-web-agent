import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { test } from "node:test";

const CATALOG_PATH = "src/lib/blocks/catalog.json";

test("catalog is in sync with the schema registry", () => {
  assert.doesNotThrow(() =>
    execFileSync("node", ["--experimental-strip-types", "scripts/generate-catalog.ts", "--check"], {
      stdio: "pipe",
    }),
  );
});

test("catalog:check names the Block whose schema drifted, same as gallery:check", () => {
  const original = readFileSync(CATALOG_PATH, "utf8");
  const parsed = JSON.parse(original) as {
    blocks: Record<string, { schema: Record<string, unknown> }>;
  };
  // Mutate two Blocks' recorded schemas so both show up as "changed" against
  // what generate-catalog.ts would render from the live registry right now.
  parsed.blocks.Hero.schema.tampered = true;
  parsed.blocks.CTA.schema.tampered = true;
  const corrupted = `${JSON.stringify(parsed, null, 2)}\n`;
  writeFileSync(CATALOG_PATH, corrupted);
  try {
    assert.throws(
      () =>
        execFileSync(
          "node",
          ["--experimental-strip-types", "scripts/generate-catalog.ts", "--check"],
          { stdio: "pipe" },
        ),
      (error: unknown) => {
        const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
        assert.match(stderr, /Hero/);
        assert.match(stderr, /CTA/);
        return true;
      },
    );
  } finally {
    writeFileSync(CATALOG_PATH, original);
  }
});
