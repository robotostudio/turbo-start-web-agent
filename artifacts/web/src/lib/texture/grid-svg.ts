import type { ToolcraftFieldSampler } from "./vendor/field-modes.ts";
import type { ToolcraftGridGeometry } from "./vendor/grid-geometry.ts";
import { TOOLCRAFT_GRID_LEVELS } from "./vendor/grid-render.ts";

// Ours, not vendored. Upstream only paints to canvas, because it is a tool with
// a canvas in it. This site needs the same picture on the server, so that a
// visitor with no JavaScript, a crawler, and every first paint before hydration
// all get the texture instead of an empty box.
//
// It mirrors `grid-render.ts` deliberately: same level buffer, same 32 intensity
// buckets, same one-fill-per-bucket grouping. That is not tidiness. It is what
// makes the canvas's first frame identical to the SVG it replaces, so the
// takeover has nothing to see.
//
// This returns data rather than markup so the caller can render real elements.
// A markup string would mean `dangerouslySetInnerHTML`, which is a prop worth
// not reaching for when the alternative is this small.

export type GridSvgCell = { x: number; y: number };

/** One intensity level and the cells sitting at it. */
export type GridSvgBucket = {
  cells: readonly GridSvgCell[];
  opacity: number;
};

export type GridSvgPlan = {
  buckets: readonly GridSvgBucket[];
  /** Per-cell geometry, identical for every rect, so it is declared once. */
  cell: { height: number; radius: number; width: number };
  viewBox: string;
};

export type GridSvgInput = {
  geometry: ToolcraftGridGeometry;
  levels: Float32Array;
  loopProgress: number;
  sampler: ToolcraftFieldSampler;
};

/** Whole tenths. Full float precision doubles the markup for detail nobody sees. */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Resolves one frame into buckets ready to render. The caller owns the `<svg>`
 * element, its sizing and its colour, the same way `paintToolcraftGridCells`
 * leaves the canvas transform and fill style to its caller.
 */
export function planGridFieldSvg(input: GridSvgInput): GridSvgPlan {
  const { geometry, levels, sampler } = input;
  const stepX = geometry.cellWidth + geometry.gap;
  const stepY = geometry.cellHeight + geometry.gap;
  const grouped: GridSvgCell[][] = [];

  sampler.resolveLevels(levels, input.loopProgress);

  for (let row = 0; row < geometry.rows; row += 1) {
    const offset = row * geometry.columns;
    for (let column = 0; column < geometry.columns; column += 1) {
      const bucket = Math.round(levels[offset + column] * (TOOLCRAFT_GRID_LEVELS - 1));
      if (bucket <= 0) continue;
      const cell = { x: round(column * stepX), y: round(row * stepY) };
      const existing = grouped[bucket];
      if (existing) existing.push(cell);
      else grouped[bucket] = [cell];
    }
  }

  const buckets: GridSvgBucket[] = [];
  for (let bucket = 1; bucket < TOOLCRAFT_GRID_LEVELS; bucket += 1) {
    const cells = grouped[bucket];
    if (!cells || cells.length === 0) continue;
    buckets.push({
      cells,
      opacity: Math.round((bucket / (TOOLCRAFT_GRID_LEVELS - 1)) * 1000) / 1000,
    });
  }

  return {
    buckets,
    cell: {
      height: round(geometry.cellHeight),
      radius: round(geometry.cornerRadius),
      width: round(geometry.cellWidth),
    },
    viewBox: `0 0 ${round(geometry.width)} ${round(geometry.height)}`,
  };
}
