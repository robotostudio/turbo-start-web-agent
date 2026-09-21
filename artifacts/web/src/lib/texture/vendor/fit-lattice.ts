/**
 * VENDORED. Upstream: github.com/jenilroboto/harbour, the Toolcraft
 * app the redesign's grid texture was designed in. MIT License, Copyright (c)
 * 2026 Pixel Point -- see ./README.md for the full text and why this is a copy
 * rather than a dependency.
 *
 * Modified in exactly one way: relative imports carry an explicit `.ts`
 * extension, which this repo requires so its generator scripts run under Node's
 * type stripping (see scripts/generate-catalog.ts for the same style). Nothing
 * else is changed, so this still diffs cleanly against upstream.
 *
 * Do not refactor this file. Its only value over a rewrite is that it still
 * diffs cleanly against upstream; a tidied copy is one nobody can compare.
 */

export type ToolcraftOutputSize = Readonly<{ height: number; width: number }>;

export type ToolcraftLatticeFitInput = Readonly<{
  cellAspect: number;
  columns: number;
  gapRatio: number;
  outputSize: ToolcraftOutputSize;
}>;

export type ToolcraftLatticeFit = Readonly<{
  "grid.cellSize": number;
  "grid.columns": number;
  "grid.gap": number;
  "grid.rows": number;
}>;

/** Schema bounds the fit has to land inside; a fitted value is still a dialable one. */
const CELL_SIZE_LIMITS = { max: 64, min: 2 } as const;
const GAP_LIMITS = { max: 24, min: 0 } as const;
const ROW_LIMITS = { max: 80, min: 4 } as const;
const COLUMN_LIMITS = { max: 240, min: 8 } as const;

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Sizes a lattice of `columns` columns to fill `outputSize`.
 *
 * Column count and cell aspect are the composition; cell size, gap, and row
 * count are consequences of the frame it has to fill. That split is what lets
 * the same composition follow a canvas from landscape to portrait instead of
 * overflowing it.
 */
export function fitToolcraftLatticeToOutput(
  input: ToolcraftLatticeFitInput,
): ToolcraftLatticeFit {
  const width = positive(input.outputSize.width, 1920);
  const height = positive(input.outputSize.height, 1080);
  const cellAspect = positive(input.cellAspect, 1);
  const gapRatio = clamp(
    Number.isFinite(input.gapRatio) ? input.gapRatio : 0.2,
    0,
    0.5,
  );
  const columns = clamp(
    Math.round(positive(input.columns, 128)),
    COLUMN_LIMITS.min,
    Math.min(COLUMN_LIMITS.max, columnsThatFillAtRowCap(height, width, cellAspect, gapRatio)),
  );

  // Derive one integer column pitch first, then split it into cell and gap.
  // Rounding the two independently lets the pitch drift up to a pixel per
  // column, which at high densities pushes the lattice well past the frame.
  const columnPitch = clamp(
    Math.floor(width / columns),
    CELL_SIZE_LIMITS.min + GAP_LIMITS.min,
    CELL_SIZE_LIMITS.max + GAP_LIMITS.max,
  );
  const gap = clamp(
    Math.round(columnPitch * gapRatio),
    GAP_LIMITS.min,
    Math.min(GAP_LIMITS.max, columnPitch - CELL_SIZE_LIMITS.min),
  );
  const cellSize = clamp(
    columnPitch - gap,
    CELL_SIZE_LIMITS.min,
    CELL_SIZE_LIMITS.max,
  );
  const rowPitch = cellSize / cellAspect + gap;

  return {
    "grid.cellSize": cellSize,
    "grid.columns": columns,
    "grid.gap": gap,
    "grid.rows": clamp(
      Math.round(height / rowPitch),
      ROW_LIMITS.min,
      ROW_LIMITS.max,
    ),
  };
}

/**
 * The most columns a frame can carry while still filling its height within the
 * row cap.
 *
 * Row count is not a free choice: given a column count and a cell aspect, the
 * cell width follows from the frame width, the cell height follows from that,
 * and the rows needed to fill the frame follow from that. A tall frame at a high
 * column count therefore demands more rows than the schema allows, and the
 * lattice would letterbox. Reducing columns instead fills the frame and leaves
 * the cells larger, which on a narrow frame reads better than near-invisible
 * ones.
 */
function columnsThatFillAtRowCap(
  height: number,
  width: number,
  cellAspect: number,
  gapRatio: number,
): number {
  const rowPitch = height / ROW_LIMITS.max;
  const pitchRatio = (1 - gapRatio) / cellAspect + gapRatio;
  if (!(pitchRatio > 0)) return COLUMN_LIMITS.max;

  return Math.max(COLUMN_LIMITS.min, Math.floor(width / (rowPitch / pitchRatio)));
}

/** The gap's share of one column pitch, which the fit preserves across frames. */
export function toolcraftGapRatio(cellSize: number, gap: number): number {
  const pitch = positive(cellSize, 1) + Math.max(0, gap);
  return pitch > 0 ? Math.max(0, gap) / pitch : 0;
}
