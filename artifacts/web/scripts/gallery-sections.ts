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

/**
 * The design-system reference, appended after the Block sections.
 *
 * Emitted by the generator rather than written into the file by hand, for the
 * same reason the sections are: `renderGallery` returns frontmatter plus
 * sections and nothing else, so anything hand-added between them is dropped on
 * the next `pnpm catalog` and fails `gallery:check` in the meantime.
 *
 * These two are gallery chrome injected from `mdx-content.tsx`, not registered
 * Blocks — see `src/components/content/design-specimens.tsx`. They render the
 * primitives every Block is built from: without them the gallery shows only
 * the handful of button and type combinations that happen to appear inside a
 * Block, and an agent designing a new one cannot see what already exists.
 */
export const SPECIMENS = `<ButtonMatrix />

<TypeScale />
`;

// A Block name as it can appear in `<BlockSpec name="...">` and still be
// found again by this parser. Must start with a letter (matching the
// capitalised-JSX-tag rule content lockdown already enforces) and may
// contain digits after that — kept as a single source string so the parser's
// regex and the runtime round-trip check below can never drift apart.
const NAME_SOURCE = "[A-Za-z][A-Za-z0-9]*";

/** Every name in `blockSchemas` must match this to be found by `parseSections`
 * — exported so generate-gallery.ts can assert every registered Block is
 * parsable before it ever renders a file. */
export const BLOCK_NAME_PATTERN = new RegExp(`^${NAME_SOURCE}$`);

// Matches a section's opening line regardless of extra attributes
// (status="todo" and any future ones), and its closing line exactly. Both
// anchored to the full line, so a `<BlockSpec name="X">` or `</BlockSpec>`
// line inside a hand-written example body — plausible: the content lockdown
// permits fenced code samples of the MDX syntax itself, or a literal
// `</BlockSpec>` line in one — still matches this regex the same as the real
// thing. `parseSections` below deals with that by (1) ignoring tag-shaped
// lines inside fenced code blocks, and (2) for the lines outside fences,
// treating the LAST close before the next open as authoritative rather than
// the first. Section boundaries are therefore a best-effort structural scan,
// not a full MDX parse — good enough because this generator only ever reads
// its own previously-generated output plus hand-written bodies.
const OPEN_TAG = new RegExp(`^<BlockSpec name="(${NAME_SOURCE})"`);
const CLOSE_TAG = /^<\/BlockSpec>$/;

// Toggled by a line that starts with three (or more) backticks — a fenced
// code block delimiter. Line-based, like the rest of this parser: it doesn't
// know about nested/mismatched fence lengths, only "are we inside a fence
// right now", which is all that's needed to keep a code sample's own
// `<BlockSpec>`/`</BlockSpec>` text from being mistaken for real tags.
const FENCE_DELIMITER = /^```/;

/** For each line, whether it sits inside a fenced code block (the delimiter
 * lines themselves count as "inside" — they never match OPEN_TAG/CLOSE_TAG
 * anyway, so it doesn't matter which side they land on). */
function computeFenceMask(lines: string[]): boolean[] {
  const mask: boolean[] = new Array(lines.length).fill(false);
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (FENCE_DELIMITER.test(lines[i])) {
      inFence = !inFence;
      mask[i] = true;
      continue;
    }
    mask[i] = inFence;
  }
  return mask;
}

/** Split an existing gallery MDX body into named sections, keyed by Block
 * name, each value the section's full raw text (its opening tag line through
 * its closing tag line, verbatim, newline-joined). A section with no matching
 * close tag before EOF is malformed input and is dropped rather than
 * swallowing the rest of the file — defensive, since a hand-edited file is
 * the one input this generator does not fully control.
 *
 * Line endings are normalised (CRLF/CR -> LF) before splitting, so a file
 * saved with CRLF line endings parses identically to its LF equivalent — the
 * anchored `$`-based regexes above would otherwise never match a line ending
 * in a stray `\r`, silently producing zero sections. This only affects
 * parsing: nothing here writes a file, so output line endings are untouched.
 *
 * Two sections sharing the same name is a silent-data-loss risk (a bad merge
 * could produce one), so it throws naming the duplicated Block rather than
 * quietly keeping the last one. */
export function parseSections(source: string): Map<string, string> {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const inFence = computeFenceMask(lines);
  const sections = new Map<string, string>();
  for (let i = 0; i < lines.length; i++) {
    if (inFence[i]) continue;
    const open = lines[i].match(OPEN_TAG);
    if (!open) continue;
    const name = open[1];

    // The boundary is the next real (non-fenced) opening tag, or EOF.
    let boundary = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (!inFence[j] && OPEN_TAG.test(lines[j])) {
        boundary = j;
        break;
      }
    }

    // The true close is the LAST real (non-fenced) close tag before that
    // boundary, not the first — a code sample earlier in the body may
    // contain its own literal `</BlockSpec>` line.
    let close = -1;
    for (let j = i + 1; j < boundary; j++) {
      if (!inFence[j] && CLOSE_TAG.test(lines[j])) close = j;
    }
    if (close === -1) continue;

    if (sections.has(name)) {
      throw new Error(
        `Duplicate <BlockSpec name="${name}"> section in the gallery MDX — remove one before regenerating.`,
      );
    }
    sections.set(name, lines.slice(i, close + 1).join("\n"));
    i = close;
  }
  return sections;
}

/** Throws naming any Block whose name cannot round-trip through
 * `parseSections` (i.e. doesn't match `BLOCK_NAME_PATTERN`) — called before
 * rendering so a future Block name the parser can't handle fails loudly at
 * generation time instead of silently losing its section on the next run. */
export function assertNamesParsable(blockNames: string[]): void {
  const unparsable = blockNames.filter((name) => !BLOCK_NAME_PATTERN.test(name));
  if (unparsable.length > 0) {
    throw new Error(
      `Block name(s) ${unparsable.map((name) => `"${name}"`).join(", ")} do not match the gallery section parser's name pattern (${BLOCK_NAME_PATTERN}) and cannot round-trip through blocks-gallery.mdx. Rename the Block, or widen NAME_SOURCE in gallery-sections.ts.`,
    );
  }
}

/** The stub a Block gets when it has no hand-written example yet. Emitted
 * with no body — BlockSpec itself renders the "no example yet" badge from
 * `status="todo"`, so the stub needs nothing between its tags. */
export const stubSection = (name: string): string =>
  `<BlockSpec name="${name}" status="todo">\n</BlockSpec>`;

/**
 * Blocks whose gallery section is still the generator's empty stub.
 *
 * The stub exists so `pnpm catalog` can run safely the moment a Block is
 * registered, mid-work, without inventing an example. It is not meant to
 * survive to CI. A Block that reaches the gallery with nothing in it defeats
 * the point of the gallery: `design-a-block` opens with "look at the gallery
 * before you build", and an entry reading NO EXAMPLE YET teaches the next
 * agent nothing about what already exists.
 *
 * That is not hypothetical either — `Comparison` arrived that way on
 * 2026-08-27, every gate green.
 */
export const emptySections = (
  blockNames: readonly string[],
  existingSections: ReadonlyMap<string, string>,
): string[] =>
  blockNames.filter((name) => {
    const section = existingSections.get(name);
    return section === undefined || section.includes('status="todo"');
  });

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
  return `${FRONTMATTER}\n${sections.join("\n\n")}\n\n${SPECIMENS}`;
}
