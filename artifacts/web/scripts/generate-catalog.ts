import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { blockSchemas } from "../src/lib/blocks/schemas.ts";

// Block Catalog generator.
//
// Reads the blockSchemas registry — the single source of truth pairing each
// Block's MDX tag name with its Zod input schema — and emits a machine-readable
// catalog of every registered Block: props, types, defaults, variant enums, and
// required vs optional. An authoring agent reads this to Compose a page without
// opening a single component.
//
// Schemas convert with io: "input" so the catalog describes what an author
// WRITES: a prop with .default(...) is optional, and its default is surfaced.
//
// NOTE: no timestamp field. A generatedAt value would change on every run,
// making the --check drift gate fail spuriously and putting a meaningless diff
// in every commit. The catalog is a pure function of the schemas.

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = join(here, "..", "src", "lib", "blocks", "catalog.json");

type JsonSchema = ReturnType<typeof z.toJSONSchema<z.ZodType>>;

const blocks = blockSchemas.reduce<Record<string, { schema: JsonSchema }>>(
  (acc, { name, schema }) => {
    acc[name] = { schema: z.toJSONSchema(schema, { io: "input" }) };
    return acc;
  },
  {},
);

const catalog = {
  $note:
    "GENERATED FILE — do not edit by hand. Run `pnpm catalog` to regenerate " +
    "from src/lib/blocks/schemas.ts after adding or changing a Block.",
  blockCount: blockSchemas.length,
  blocks,
};

const rendered = `${JSON.stringify(catalog, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const existing = readFileSync(outputPath, "utf8");
  if (existing !== rendered) {
    process.stderr.write(
      "Block catalog is out of date. Run `pnpm catalog` and commit the result.\n",
    );
    process.exit(1);
  }
  process.stdout.write(`Block catalog up to date (${blockSchemas.length} blocks)\n`);
} else {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, rendered);
  process.stdout.write(`Block catalog written (${blockSchemas.length} blocks)\n`);
}
