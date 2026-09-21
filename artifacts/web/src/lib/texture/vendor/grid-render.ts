/**
 * VENDORED. Upstream: github.com/jenilroboto/harbour, the Toolcraft
 * app the redesign's grid texture was designed in. MIT License, Copyright (c)
 * 2026 Pixel Point -- see ./README.md.
 *
 * The Canvas2D painter. `grid-svg.ts` next to it is the server-side counterpart
 * and mirrors this file's bucketing exactly, so the first canvas frame and the
 * SVG it replaces are the same picture.
 *
 * Modified in exactly one way: relative imports carry an explicit `.ts`
 * extension, which this repo requires so its generator scripts run under Node's
 * type stripping (see scripts/generate-catalog.ts for the same style). Nothing
 * else is changed, so this still diffs cleanly against upstream.
 *
 * Do not refactor this file. Its only value over a rewrite is that it still
 * diffs cleanly against upstream.
 */
import type { ToolcraftFieldSampler } from "./field-modes.ts";
import type { ToolcraftGridGeometry } from "./grid-geometry.ts";

/**
 * Intensity buckets. Cells are grouped per bucket and filled with one path each,
 * so a dense grid costs a bounded number of fills instead of one per cell.
 */
export const TOOLCRAFT_GRID_LEVELS = 32;

export type ToolcraftGridPaintInput = {
  cellColor: string;
  context: CanvasRenderingContext2D;
  geometry: ToolcraftGridGeometry;
  levels: Float32Array;
  loopProgress: number;
  originX: number;
  originY: number;
  sampler: ToolcraftFieldSampler;
};

export type ToolcraftGridPreviewInput = Omit<
  ToolcraftGridPaintInput,
  "originX" | "originY"
> & {
  background: string | null;
  pixelHeight: number;
  pixelWidth: number;
  scale: number;
};

/**
 * Returns a level buffer sized for the current grid, reusing the existing one
 * when the cell count has not changed. Callers hold this across frames so
 * playback does not allocate per frame.
 */
export function ensureToolcraftLevelBuffer(
  existing: Float32Array | null,
  cellCount: number,
): Float32Array {
  const size = Math.max(1, cellCount);
  return existing && existing.length === size ? existing : new Float32Array(size);
}

function addCellPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  if (radius > 0 && typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
    return;
  }
  context.rect(x, y, width, height);
}

/**
 * Paints the cells in the caller's current coordinate space. Preview and export
 * both call this, so one timeline position always resolves to the same field
 * whichever activity mode produced the levels.
 */
export function paintToolcraftGridCells(input: ToolcraftGridPaintInput): void {
  const { context, geometry, levels, sampler } = input;
  const buckets: number[][] = [];
  const stepX = geometry.cellWidth + geometry.gap;
  const stepY = geometry.cellHeight + geometry.gap;

  sampler.resolveLevels(levels, input.loopProgress);

  for (let row = 0; row < geometry.rows; row += 1) {
    const offset = row * geometry.columns;
    for (let column = 0; column < geometry.columns; column += 1) {
      const bucket = Math.round(levels[offset + column] * (TOOLCRAFT_GRID_LEVELS - 1));
      if (bucket <= 0) continue;
      (buckets[bucket] ??= []).push(column, row);
    }
  }

  context.save();
  context.translate(input.originX, input.originY);
  context.fillStyle = input.cellColor;
  for (let bucket = 1; bucket < TOOLCRAFT_GRID_LEVELS; bucket += 1) {
    const cells = buckets[bucket];
    if (!cells || cells.length === 0) continue;
    context.globalAlpha = bucket / (TOOLCRAFT_GRID_LEVELS - 1);
    context.beginPath();
    for (let index = 0; index < cells.length; index += 2) {
      addCellPath(
        context,
        cells[index] * stepX,
        cells[index + 1] * stepY,
        geometry.cellWidth,
        geometry.cellHeight,
        geometry.cornerRadius,
      );
    }
    context.fill();
  }
  context.restore();
}

/** Draws one preview frame into a product-owned backing canvas. */
export function renderToolcraftGridPreviewFrame(
  input: ToolcraftGridPreviewInput,
): void {
  const { context } = input;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, input.pixelWidth, input.pixelHeight);
  if (input.background) {
    context.fillStyle = input.background;
    context.fillRect(0, 0, input.pixelWidth, input.pixelHeight);
  }
  context.setTransform(input.scale, 0, 0, input.scale, 0, 0);
  paintToolcraftGridCells({ ...input, originX: 0, originY: 0 });
  context.setTransform(1, 0, 0, 1, 0, 0);
}
