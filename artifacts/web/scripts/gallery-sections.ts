// Pure parsing/rendering helpers for content/pages/blocks-gallery.mdx, split
// out of generate-gallery.ts so they can be exercised by
// generate-gallery.test.ts without importing the generator itself — that
// script runs its file-system side effects (read/write blocks-gallery.mdx) at
// module load, matching generate-catalog.ts's structure, so importing it
// directly in a test would trigger a real write. These helpers have no side
// effects: given text in, they return text out.

export const FRONTMATTER = `---
title: Block gallery
description: Every Block in this template, rendered live.
noindex: true
---
`;

// Matches a section's opening line regardless of extra attributes
// (status="todo" and any future ones), and its closing line exactly. Both
// anchored to the full line: a `<BlockSpec name="X">` mid-sentence inside a
// hand-written example body (which cannot happen — content lockdown forbids
// nested BlockSpec elements — but a stray code-block sample of the MDX syntax
// itself could) would still only match at the start of its own line, same as
// the real thing. Section boundaries are therefore a best-effort structural
// scan, not a full MDX parse — good enough because this generator only ever
// reads its own previously-generated output.
const OPEN_TAG = /^<BlockSpec name="([A-Za-z]+)"/;
const CLOSE_TAG = /^<\/BlockSpec>$/;

/** Split an existing gallery MDX body into named sections, keyed by Block
 * name, each value the section's full raw text (its opening tag line through
 * its closing tag line, verbatim, newline-joined). A section with no matching
 * close tag before EOF is malformed input and is dropped rather than
 * swallowing the rest of the file — defensive, since a hand-edited file is
 * the one input this generator does not fully control. */
export function parseSections(source: string): Map<string, string> {
  const lines = source.split("\n");
  const sections = new Map<string, string>();
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(OPEN_TAG);
    if (!open) continue;
    const name = open[1];
    const close = lines.findIndex((line, index) => index > i && CLOSE_TAG.test(line));
    if (close === -1) continue;
    sections.set(name, lines.slice(i, close + 1).join("\n"));
    i = close;
  }
  return sections;
}

/** The stub a Block gets when it has no hand-written example yet. Emitted
 * with no body — BlockSpec itself renders the "no example yet" badge from
 * `status="todo"`, so the stub needs nothing between its tags. */
export const stubSection = (name: string): string =>
  `<BlockSpec name="${name}" status="todo">\n</BlockSpec>`;

/** Names in `existingSections` that are not in `blockNames` — Blocks that
 * were removed (or renamed) in the registry, so their hand-written example is
 * about to be dropped from the rendered output. Surfaced separately from
 * `renderGallery` so --check can name them in its failure message. */
export function droppedSections(
  blockNames: string[],
  existingSections: Map<string, string>,
): string[] {
  const known = new Set(blockNames);
  return [...existingSections.keys()].filter((name) => !known.has(name));
}

/** Names in `blockNames` with no existing section — Blocks about to get a
 * fresh `status="todo"` stub instead of a preserved example. */
export function missingSections(
  blockNames: string[],
  existingSections: Map<string, string>,
): string[] {
  return blockNames.filter((name) => !existingSections.has(name));
}

/** Render the full gallery MDX: fixed frontmatter, then one section per
 * registered Block, in registry order. A Block whose name is a key in
 * `existingSections` keeps that section's text verbatim (a hand-written
 * example survives untouched); every other Block gets a fresh
 * `status="todo"` stub. A Block no longer in the registry is simply never
 * read from `existingSections` — its section is dropped. */
export function renderGallery(blockNames: string[], existingSections: Map<string, string>): string {
  const sections = blockNames.map((name) => existingSections.get(name) ?? stubSection(name));
  return `${FRONTMATTER}\n${sections.join("\n\n")}\n`;
}
