import type { ToolcraftGridGeometryInput } from "./vendor/grid-geometry.ts";
import type { ToolcraftFieldParameters } from "./vendor/wave-field.ts";

// The values the texture was designed at, lifted from upstream's
// TOOLCRAFT_GRID_DEFAULTS and TOOLCRAFT_GRID_PROPORTION_PRESETS (see
// ./vendor/README.md). Kept as data rather than scattered through call sites so the
// texture is one decision, the same way the colour tokens are.
//
// Upstream's two colour defaults are deliberately absent. #E8E8E8 on #050505 is
// a raw hex, and the cell colour here comes from a design token at the call site
// so a retheme carries it.

/**
 * Everything about the field that is not the lattice's shape. Columns, rows and
 * cell aspect are supplied per placement, because they follow the box the
 * texture has to fill rather than the look being asked for.
 */
export type FieldLook = Omit<ToolcraftFieldParameters, "cellAspect" | "columns" | "rows">;

export const FIELD_LOOK: FieldLook = {
  amplitude: 0.45,
  coherence: 0.6,
  decay: 0.35,
  direction: 18,
  noise: 0.06,
  // Row scale is the one value worth understanding before changing it. The field
  // varies far faster down rows than across columns, which decorrelates
  // neighbouring rows and is what makes the texture read as banded rows rather
  // than as smooth vertical smears. See the comment on sampleToolcraftFieldCell.
  rowScale: 14,
  seed: 1337,
  speed: 14,
  threshold: 0,
  waveCount: 5,
  wavelength: 36,
};

/**
 * Cells are taller than they are wide, which is why the texture reads as
 * vertical bars rather than dots. The figure is the comp's: its band measures a
 * 14.06px column pitch against a 20.66px row pitch, and 12 / (12 / 0.63 + 3)
 * reproduces that ratio once the mask is scaled to cover a 1440-wide band. It
 * was 0.42, which is a good deal more elongated than the design.
 */
export const CELL_ASPECT = 0.63;

export const CORNER_RADIUS_PERCENT = 25;

export type GridPresetName = "dense" | "coarse";

type GridPreset = Omit<ToolcraftGridGeometryInput, "cellAspect" | "cornerRadiusPercent">;

/**
 * `dense` is the animated register: the hero band and the CTA bed.
 * `coarse` is what the server renders for the still frame, and what a smaller
 * placement such as the footer watermark uses outright.
 */
// `dense`'s counts are the comp's, measured off the band's own exported bitmap
// rather than chosen: an autocorrelation of that PNG gives a 14.06px column
// pitch and a 20.66px row pitch across the 1440x430 band, which is 102 by 21.
// It was 128 by 32, and since the mask stretches to whatever element carries it,
// those extra rows read as a visibly busier field than the design has.
export const GRID_PRESETS: Record<GridPresetName, GridPreset> = {
  coarse: { cellSize: 28, columns: 55, gap: 7, rows: 9 },
  dense: { cellSize: 12, columns: 102, gap: 3, rows: 21 },
};

/** How long one loop takes. The field stitches end to end, so it never jumps. */
export const LOOP_SECONDS = 24;

export function fieldParametersFor(
  preset: GridPresetName,
  look: FieldLook = FIELD_LOOK,
): ToolcraftFieldParameters {
  const { columns, rows } = GRID_PRESETS[preset];
  return { ...look, cellAspect: CELL_ASPECT, columns, rows };
}

export function geometryInputFor(preset: GridPresetName): ToolcraftGridGeometryInput {
  return {
    ...GRID_PRESETS[preset],
    cellAspect: CELL_ASPECT,
    cornerRadiusPercent: CORNER_RADIUS_PERCENT,
  };
}
