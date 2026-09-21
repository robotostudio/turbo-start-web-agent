/**
 * VENDORED AND TRIMMED. Upstream: github.com/jenilroboto/harbour, the Toolcraft
 * app the redesign's grid texture was designed in. MIT License, Copyright (c)
 * 2026 Pixel Point -- see ./README.md.
 *
 * Trimmed to the `flow` mode only. Upstream also ships `recombine`, a second
 * algorithm with its own module, which the comp does not use; carrying it would
 * mean vendoring another file to render nothing. The `ToolcraftFieldSampler`
 * shape and the flow planner below are otherwise unchanged, so a future mode can
 * be added by restoring upstream's switch.
 */

import {
  planToolcraftFieldWaves,
  sampleToolcraftFieldCell,
  type ToolcraftFieldParameters,
} from "./wave-field.ts";

/**
 * One planned mode. `resolveLevels` fills `columns * rows` levels in `0..1` for
 * one loop position.
 *
 * Every mode must resolve any loop position from the plan alone. The server
 * renders one frame and the canvas renders arbitrary frames in order, so a
 * sampler that carried state between frames would make the two disagree.
 */
export type ToolcraftFieldSampler = {
  readonly cellCount: number;
  resolveLevels(levels: Float32Array, loopProgress: number): void;
};

/**
 * Plans the wave set once per parameter change. Playback reuses the returned
 * sampler; only a value edit rebuilds it.
 */
export function planToolcraftFieldSampler(
  parameters: ToolcraftFieldParameters,
  durationSeconds: number,
): ToolcraftFieldSampler {
  const waves = planToolcraftFieldWaves(parameters, durationSeconds);
  const columns = Math.max(1, Math.round(parameters.columns));
  const rows = Math.max(1, Math.round(parameters.rows));

  return {
    cellCount: columns * rows,
    resolveLevels(levels, loopProgress) {
      for (let row = 0; row < rows; row += 1) {
        const offset = row * columns;
        for (let column = 0; column < columns; column += 1) {
          levels[offset + column] = sampleToolcraftFieldCell(
            waves,
            parameters,
            column,
            row,
            loopProgress,
          );
        }
      }
    },
  };
}
