import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { blockSchemas } from "../src/lib/blocks/schemas.ts";
import {
  assertNamesParsable,
  droppedSections,
  emptySections,
  missingSections,
  parseSections,
  renderGallery,
} from "./gallery-sections.ts";

// Block Gallery generator.
//
// Reads the same blockSchemas registry as generate-catalog.ts and owns the
// STRUCTURE of content/pages/blocks-gallery.mdx: one <BlockSpec name="X">
// section per registered Block, in registry order. It never invents or edits
// an example body — an existing section is carried through verbatim (see
// gallery-sections.ts for the parse/render logic), a Block with no section
// yet gets a status="todo" stub, and a section for a Block no longer in the
// registry is dropped. This is what lets `pnpm catalog` (which chains this
// generator) run safely after every schema change without silently deleting
// hand-written examples from later work.
//
// NOTE: no timestamp field, same reasoning as generate-catalog.ts — a pure
// function of (registry, existing file) keeps the --check drift gate honest
// and every regeneration diff meaningful.

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = join(here, "..", "content", "pages", "blocks-gallery.mdx");

const blockNames = blockSchemas.map(({ name }) => name);
assertNamesParsable(blockNames);
const existing = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : "";
const existingSections = parseSections(existing);
const rendered = renderGallery(blockNames, existingSections);

if (process.argv.includes("--check")) {
  // Checked before the drift comparison, because an empty stub is not drift:
  // regenerating produces the same stub, so `pnpm gallery` would report
  // success on a gallery that shows nothing for that Block.
  const empty = emptySections(blockNames, existingSections);
  if (empty.length > 0) {
    process.stderr.write(
      `Block gallery has no example for: ${empty.join(", ")}.\n` +
        `  Every Block needs one. The gallery is how the next author -- and the ` +
        `next agent -- sees what already exists\n` +
        `  before building something new, and an entry reading "NO EXAMPLE YET" ` +
        `teaches them nothing.\n` +
        `  Write a real usage example between the <BlockSpec> tags in ` +
        `content/pages/blocks-gallery.mdx and drop the status="todo".\n` +
        `  Use the copy you would actually ship: an example full of placeholder ` +
        `text is a Block that looks unfinished.\n`,
    );
    process.exit(1);
  }

  if (existing !== rendered) {
    const dropped = droppedSections(blockNames, existingSections);
    const missing = missingSections(blockNames, existingSections);
    const detail = [
      missing.length > 0 ? `missing a section: ${missing.join(", ")}` : null,
      dropped.length > 0 ? `no longer registered: ${dropped.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    process.stderr.write(
      `Block gallery is out of date${detail ? ` (${detail})` : ""}. Run \`pnpm gallery\` and commit the result.\n`,
    );
    process.exit(1);
  }
  process.stdout.write(`Block gallery up to date (${blockNames.length} blocks)\n`);
} else {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, rendered);
  process.stdout.write(`Block gallery written (${blockNames.length} blocks)\n`);
}
