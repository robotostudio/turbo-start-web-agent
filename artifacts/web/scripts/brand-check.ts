import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// The brand name belongs in content, not in source.
//
// content/settings/site.yml holds the site's name, and layout.tsx,
// site-header.tsx and blog/page.tsx read it from there. That is what makes
// "rebranding a client site is a content edit" true rather than aspirational:
// an adopter changes one line and the header, the tab title and the blog index
// all follow.
//
// It was true by inspection and by nothing else. On 2026-08-27 a new Block
// arrived with `<caption className="sr-only">Comparison of Harbour and the
// traditional approach</caption>` — every gate green, because none of them
// read English. An adopter renaming the site in site.yml would have shipped a
// table captioned with the template's demo brand, in a file they had no reason
// to open.
//
// So: the demo brand is read from site.yml at check time and must not appear
// anywhere under src/. Nothing is hardcoded here — rename the site and this
// check renames with it.

export interface BrandHit {
  file: string;
  line: number;
  text: string;
}

/** The `name:` field of content/settings/site.yml. */
export const brandFrom = (siteYml: string): string | null => {
  const match = siteYml.match(/^name:\s*(.+?)\s*$/m);
  return match ? match[1].replace(/^["']|["']$/g, "") : null;
};

/**
 * Every line under `src/` containing the brand name.
 *
 * Case-sensitive and exact. A lowercase or hyphenated form of the name turns up
 * in package names, URLs, and CSS class names that have nothing to do with the
 * brand, and flagging those would train an author to ignore this check.
 */
export const findBrand = (
  files: readonly { path: string; source: string }[],
  brand: string,
): BrandHit[] =>
  files.flatMap(({ path, source }) =>
    source
      .split("\n")
      .map((text, index) => ({ file: path, line: index + 1, text: text.trim() }))
      .filter((hit) => hit.text.includes(brand)),
  );

// --- CLI ---------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const SRC = join(webRoot, "src");
const SITE_YML = join(webRoot, "content", "settings", "site.yml");
const EXTENSIONS = [".ts", ".tsx", ".css", ".svg", ".json"];

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return EXTENSIONS.some((ext) => entry.name.endsWith(ext)) ? [full] : [];
  });

const isMain = (): boolean => {
  const entry = process.argv[1];
  return typeof entry === "string" && entry.endsWith("brand-check.ts");
};

if (isMain()) {
  const brand = brandFrom(readFileSync(SITE_YML, "utf8"));

  if (!brand) {
    process.stderr.write("Brand check: content/settings/site.yml has no `name:` field.\n");
    process.exit(1);
  }

  const files = walk(SRC).map((path) => ({
    path: relative(webRoot, path),
    source: readFileSync(path, "utf8"),
  }));
  const hits = findBrand(files, brand);

  if (hits.length === 0) {
    process.stdout.write(`Brand check: "${brand}" appears nowhere under src/\n`);
    process.exit(0);
  }

  process.stderr.write(`Brand check: "${brand}" appears in ${hits.length} place(s) under src/\n\n`);
  for (const hit of hits) {
    process.stderr.write(`  ${hit.file}:${hit.line}\n    ${hit.text}\n`);
  }
  process.stderr.write(
    `\n  The site's name lives in content/settings/site.yml and is read from ` +
      `\`site\` in #velite — see src/app/layout.tsx.\n` +
      `  Hardcoding it here means an adopter who renames the site in that file ` +
      `still ships this one, in a source file they had no reason to open.\n` +
      `  If this text genuinely needs the site's name, read it from \`site.name\`. ` +
      `If it does not, write it without the name.\n`,
  );
  process.exit(1);
}
