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

import type { ToolcraftFieldParameters } from "./wave-field.ts";

export type ToolcraftGridGeometry = {
  cellHeight: number;
  cellWidth: number;
  columns: number;
  cornerRadius: number;
  gap: number;
  height: number;
  rows: number;
  width: number;
};

export type ToolcraftGridGeometryInput = {
  cellAspect: number;
  cellSize: number;
  columns: number;
  cornerRadiusPercent: number;
  gap: number;
  rows: number;
};

function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function count(value: number, fallback: number): number {
  return Number.isFinite(value) && value >= 1 ? Math.round(value) : fallback;
}

/**
 * Resolves the drawn grid rectangle. The grid is the product scene, so its own
 * extent is what `sceneBoundsProvider` reports to live output and export.
 */
export function resolveToolcraftGridGeometry(
  input: ToolcraftGridGeometryInput,
): ToolcraftGridGeometry {
  const columns = count(input.columns, 1);
  const rows = count(input.rows, 1);
  const cellWidth = positive(input.cellSize, 1);
  const cellHeight = cellWidth / positive(input.cellAspect, 1);
  const gap = Number.isFinite(input.gap) && input.gap > 0 ? input.gap : 0;
  const shortestEdge = Math.min(cellWidth, cellHeight);
  const percent = Number.isFinite(input.cornerRadiusPercent)
    ? Math.max(0, Math.min(50, input.cornerRadiusPercent))
    : 0;

  return {
    cellHeight,
    cellWidth,
    columns,
    cornerRadius: (percent / 100) * shortestEdge,
    gap,
    height: rows * (cellHeight + gap) - gap,
    rows,
    width: columns * (cellWidth + gap) - gap,
  };
}

export function toToolcraftFieldParameters(
  geometry: ToolcraftGridGeometry,
  field: Omit<ToolcraftFieldParameters, "cellAspect" | "columns" | "rows">,
): ToolcraftFieldParameters {
  return {
    ...field,
    cellAspect: geometry.cellWidth / geometry.cellHeight,
    columns: geometry.columns,
    rows: geometry.rows,
  };
}
