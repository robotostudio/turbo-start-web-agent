import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

// The twelve placeholder client logos in the home comp's logo ledger, taken
// from the design rather than approximated.
//
// They are artwork, not a list: the comp draws each one as its own logotype,
// with its own size, weight, tracking and (for five of the twelve) its own
// glyph, so the grid reads as twelve different companies instead of one column
// of names set in one font. Read cell by cell off the Paper comp — the marks
// differ from each other, and the type differs by a point or two per cell on
// purpose. Nothing here is a copy of its neighbour with the name swapped.
//
// The type metrics live in globals.css as `--text-wordmark-*` roles (a second
// @theme block, deliberately outside the design system), which is what keeps
// the raw sizes out of this file. Weight stays a `font-*` utility here, the
// same split `--text-display` uses.
//
// Colour comes from the call site through currentColor, as it does in
// site-mark.tsx and social-icons.tsx. The ledger sets `text-ledger-wordmark`
// on the grid (logo-cloud.tsx), which is the comp's #9A9A9A exactly.
// Northbeam's mark is the one exception: its third square is a second, dimmer
// tone in the comp (#5C5C5C), carried by `--ledger-wordmark-dim`, so that
// square is pinned to that token rather than following currentColor. Two-tone
// is a property of that fictional logo, not of the row it sits in.
//
// The LogoCloud Block (logo-cloud.tsx) is the only consumer: it lays the
// twelve out in the comp's bordered 6x2 grid. They are fixed decoration drawn
// from the design, so no Block prop selects, reorders or replaces them.

// Three squares, upper-left and lower-right in the primary tone, upper-right
// dimmed. 16x16.
function NorthbeamMark() {
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

// An outlined diamond, hairline. 15x15.
function HalcyonMark() {
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
// triangle. 14x14.
function KestrelMark() {
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

// An outlined square quartered by a cross. 14x14.
function AtlasGridMark() {
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
// that is not square.
function PrismMark() {
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

export interface LogoWordmarkSpec {
  /** Stable key for the cell, and the layer name the comp gives it. */
  readonly id: string;
  /** The logotype's own setting of the name, casing and punctuation included. */
  readonly label: string;
  /** Seven of the twelve are type alone, as in the comp. */
  readonly mark: (() => ReactElement) | null;
  /** The `--text-wordmark-*` role plus this logotype's weight and family. */
  readonly typeClassName: string;
  /** Space between mark and name. `null` where there is no mark. */
  readonly gapClassName: string | null;
}

/** In comp order: the six cells of Row 1, then the six of Row 2. */
export const logoWordmarks: readonly LogoWordmarkSpec[] = [
  {
    id: "meridian",
    label: "MERIDIAN",
    mark: null,
    typeClassName: "font-sans font-medium text-wordmark-meridian",
    gapClassName: null,
  },
  {
    id: "northbeam",
    label: "Northbeam",
    mark: NorthbeamMark,
    typeClassName: "font-sans font-semibold text-wordmark-northbeam",
    gapClassName: "gap-2",
  },
  {
    id: "halcyon",
    label: "halcyon",
    mark: HalcyonMark,
    typeClassName: "font-sans font-light text-wordmark-halcyon",
    gapClassName: "gap-2.25",
  },
  {
    id: "lumen",
    label: "LUMEN.",
    mark: null,
    typeClassName: "font-sans font-bold text-wordmark-lumen",
    gapClassName: null,
  },
  {
    id: "tessera",
    label: "tessera",
    mark: null,
    typeClassName: "font-sans font-light text-wordmark-tessera",
    gapClassName: null,
  },
  {
    id: "kestrel",
    label: "KESTREL",
    mark: KestrelMark,
    typeClassName: "font-sans font-normal text-wordmark-kestrel",
    gapClassName: "gap-2",
  },
  {
    id: "foundry",
    label: "Foundry & Co",
    mark: null,
    typeClassName: "font-sans font-medium text-wordmark-foundry",
    gapClassName: null,
  },
  {
    id: "openlane",
    label: "OPENLANE",
    mark: null,
    typeClassName: "font-sans font-extrabold text-wordmark-openlane",
    gapClassName: null,
  },
  {
    // The only logotype in the set set in mono, which is what its grid mark and
    // its wide tracking are both playing off.
    id: "atlas-grid",
    label: "ATLASGRID",
    mark: AtlasGridMark,
    typeClassName: "font-mono font-bold text-wordmark-atlas-grid",
    gapClassName: "gap-2",
  },
  {
    id: "prism",
    label: "Prism",
    mark: PrismMark,
    typeClassName: "font-sans font-normal text-wordmark-prism",
    gapClassName: "gap-2.25",
  },
  {
    id: "cairn",
    label: "Cairn",
    mark: null,
    typeClassName: "font-sans font-light text-wordmark-cairn",
    gapClassName: null,
  },
  {
    id: "vantage",
    label: "VANTAGE",
    mark: null,
    typeClassName: "font-sans font-semibold text-wordmark-vantage",
    gapClassName: null,
  },
];

/**
 * One logotype, mark and name on a line. Inline-flex rather than a block, so
 * the grid that lays the twelve out decides its own cell and centring.
 */
export function LogoWordmark({
  className,
  wordmark,
}: {
  className?: string;
  wordmark: LogoWordmarkSpec;
}) {
  const { gapClassName, label, mark: Mark, typeClassName } = wordmark;

  return (
    <span className={cn("inline-flex items-center", gapClassName, typeClassName, className)}>
      {Mark && <Mark />}
      {label}
    </span>
  );
}
