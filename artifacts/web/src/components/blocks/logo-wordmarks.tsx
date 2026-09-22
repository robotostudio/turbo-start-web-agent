import type { ReactElement } from "react";
import type { LedgerMarkId } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

// How the logo ledger DRAWS a cell. Not what it says.
//
// The twelve names this file used to carry are content — client logos are the
// most client-specific thing on a marketing page — so they live in MDX now and
// reach LogoCloud through the `logos` prop. What stays here is the artwork an
// author cannot write in MDX: the five glyphs the comp draws, and the type
// cadence the comp gives the twelve cells.
//
// The cadence is POSITIONAL, and that is the decision worth reading twice. The
// comp sets every cell at its own size, weight, tracking and (in one cell)
// family, so the grid reads as twelve logos instead of one column of names in
// one font. That variety belongs to the ledger, not to any particular company:
// cell 3 is 23px light whether it says `halcyon` or `Acme`. So a cell takes the
// cadence entry for its position, and the twelve `--text-wordmark-*` roles in
// globals.css — still named after the comp's placeholders, because they were
// measured cell by cell off it — are read positionally here.
//
// Colour comes from the call site through currentColor, as it does in
// site-mark.tsx and social-icons.tsx. The ledger sets `text-ledger-wordmark`
// on the grid (logo-cloud.tsx), which is the comp's #9A9A9A exactly. The
// squares mark is the one exception: its third square is a second, dimmer tone
// in the comp (#5C5C5C), carried by `--ledger-wordmark-dim`, so that square is
// pinned to that token rather than following currentColor. Two-tone is a
// property of that drawing, not of the row it sits in.

// Three squares, upper-left and lower-right in the primary tone, upper-right
// dimmed. 16x16. The comp's Northbeam mark.
function SquaresMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="currentColor"
      role="presentation"
      viewBox="0 0 16 16"
    >
      <rect height="6" width="6" x="1" y="1" />
      <rect height="6" width="6" x="9" y="9" />
      <rect className="fill-ledger-wordmark-dim" height="6" width="6" x="9" y="1" />
    </svg>
  );
}

// An outlined diamond, hairline. 15x15. The comp's halcyon mark.
function DiamondMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.75 shrink-0"
      fill="none"
      role="presentation"
      stroke="currentColor"
      strokeWidth="1.4"
      viewBox="0 0 15 15"
    >
      <path d="M7.5 0.5 L14.5 7.5 L7.5 14.5 L0.5 7.5 Z" />
    </svg>
  );
}

// A solid chevron, notched at the base so it reads as a bird rather than a
// triangle. 14x14. The comp's KESTREL mark.
function ChevronMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 shrink-0"
      fill="currentColor"
      role="presentation"
      viewBox="0 0 14 14"
    >
      <path d="M0.5 13.5 L7 0.5 L13.5 13.5 L7 9.5 Z" />
    </svg>
  );
}

// An outlined square quartered by a cross. 14x14. The comp's ATLASGRID mark.
function GridMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 shrink-0"
      fill="none"
      role="presentation"
      stroke="currentColor"
      strokeWidth="1.3"
      viewBox="0 0 14 14"
    >
      <rect height="12.6" width="12.6" x="0.7" y="0.7" />
      <path d="M0.7 7 H13.3 M7 0.7 V13.3" />
    </svg>
  );
}

// An outlined triangle, wider than it is tall. 16x14 — the one mark in the set
// that is not square. The comp's Prism mark.
function TriangleMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-4 shrink-0"
      fill="none"
      role="presentation"
      stroke="currentColor"
      strokeWidth="1.4"
      viewBox="0 0 16 14"
    >
      <path d="M8 0.6 L15.4 13.4 H0.6 Z" />
    </svg>
  );
}

interface LedgerMark {
  /** The drawing itself. Sized in its own viewBox, coloured by currentColor. */
  readonly Glyph: () => ReactElement;
  /**
   * Space between this mark and the name beside it. A property of the drawing,
   * not of the cell: the comp gives the two outlined, hairline marks (diamond,
   * triangle) 9px and the three solid or dense ones 8px, so the gap follows
   * the glyph into whichever cell an author puts it in.
   */
  readonly gapClassName: string;
}

/**
 * The five glyphs, keyed by the ids `ledgerMarkIds` declares. Typed as a total
 * Record so the two cannot drift: a glyph with no id, or an id with no glyph,
 * fails typecheck. The ids live in schemas.ts rather than here because the
 * catalog generator and the unit tests both import that file under Node's
 * --experimental-strip-types, which cannot load a .tsx file at all.
 */
const ledgerMarks: Record<LedgerMarkId, LedgerMark> = {
  squares: { Glyph: SquaresMark, gapClassName: "gap-2" },
  diamond: { Glyph: DiamondMark, gapClassName: "gap-2.25" },
  chevron: { Glyph: ChevronMark, gapClassName: "gap-2" },
  grid: { Glyph: GridMark, gapClassName: "gap-2" },
  triangle: { Glyph: TriangleMark, gapClassName: "gap-2.25" },
};

/**
 * The comp's type setting for each of the twelve cells, in comp order: the six
 * of Row 1, then the six of Row 2. Each entry is a `--text-wordmark-*` role
 * (size, leading and tracking together) plus that cell's weight and family,
 * the same split `--text-display` uses. Measured per cell off the Paper comp,
 * not derived from a ratio — the sizes deliberately do not snap to Tailwind's
 * scale, which would collapse cells 3, 5 and 10 onto one step.
 *
 * LogoCloud cycles this, so a ledger of more than twelve carries the cadence
 * round again rather than running out.
 */
export const ledgerTypeCadence: readonly string[] = [
  // Row 1
  "font-sans font-medium text-wordmark-meridian",
  "font-sans font-semibold text-wordmark-northbeam",
  "font-sans font-light text-wordmark-halcyon",
  "font-sans font-bold text-wordmark-lumen",
  "font-sans font-light text-wordmark-tessera",
  "font-sans font-normal text-wordmark-kestrel",
  // Row 2
  "font-sans font-medium text-wordmark-foundry",
  "font-sans font-extrabold text-wordmark-openlane",
  // The one cell the comp sets in mono, which is what its wide tracking and
  // the grid mark beside it are both playing off.
  "font-mono font-bold text-wordmark-atlas-grid",
  "font-sans font-normal text-wordmark-prism",
  "font-sans font-light text-wordmark-cairn",
  "font-sans font-semibold text-wordmark-vantage",
];

/**
 * One logotype, mark and name on a line. Inline-flex rather than a block, so
 * the grid that lays the cells out decides its own cell and centring.
 * `className` is the cell's cadence entry, passed in by LogoCloud.
 */
export function LogoWordmark({
  className,
  mark,
  name,
}: {
  className?: string;
  mark?: LedgerMarkId;
  name: string;
}) {
  const drawn = mark ? ledgerMarks[mark] : null;
  const Glyph = drawn?.Glyph;

  return (
    <span className={cn("inline-flex items-center", drawn?.gapClassName, className)}>
      {Glyph && <Glyph />}
      {name}
    </span>
  );
}
