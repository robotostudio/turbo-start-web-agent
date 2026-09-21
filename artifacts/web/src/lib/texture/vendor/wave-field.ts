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

const TWO_PI = Math.PI * 2;

/** Deterministic field parameters shared by preview, export, and tests. */
export type ToolcraftFieldParameters = {
  amplitude: number;
  rowScale: number;
  cellAspect: number;
  coherence: number;
  columns: number;
  decay: number;
  direction: number;
  noise: number;
  rows: number;
  seed: number;
  speed: number;
  threshold: number;
  waveCount: number;
  wavelength: number;
};

/** One resolved plane wave. `cycles` is whole loops so the field stitches. */
export type ToolcraftFieldWave = {
  amplitude: number;
  cycles: number;
  directionX: number;
  directionY: number;
  phase: number;
  wavelength: number;
};

export const TOOLCRAFT_FIELD_DECAY_TAPS = 3;
const DECAY_LOOP_WINDOW = 0.16;

/**
 * Resting level of an unlit cell. The inspected reference sits well below mid
 * grey (median 79/255) so the field reads as dark with bright crests rather
 * than as a uniform wash.
 */
export const TOOLCRAFT_FIELD_BASE_LEVEL = 0.32;

/**
 * Per-wave share of the amplitude control. Independent waves sum in quadrature,
 * so dividing by the square root of the count keeps the combined swing roughly
 * constant as waves are added instead of flattening toward the base level.
 */
const WAVE_AMPLITUDE_SHARE = 0.45;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function clampCount(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum;
  const rounded = Math.round(value);
  return rounded < minimum ? minimum : rounded > maximum ? maximum : rounded;
}

/** mulberry32: small, fast, and stable across engines so a seed reproduces exactly. */
function createRandom(seed: number): () => number {
  let state = (Math.trunc(Number.isFinite(seed) ? seed : 0) >>> 0) + 0x6d2b79f5;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Static per-cell grain. Time-independent so the grid never blinks per frame. */
export function sampleToolcraftCellGrain(
  column: number,
  row: number,
  seed: number,
): number {
  let hash =
    Math.imul(column + 374761393, 668265263) ^
    Math.imul(row + 2246822519, 2654435761) ^
    Math.imul(Math.trunc(seed) + 1, 374761397);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

/**
 * Resolves the wave set for one parameter/duration pair. Each wave's temporal
 * frequency is rounded to a whole number of cycles per loop, so every duration
 * produces a forward-only field whose first and last frame match exactly.
 */
export function planToolcraftFieldWaves(
  parameters: ToolcraftFieldParameters,
  durationSeconds: number,
): ToolcraftFieldWave[] {
  const count = clampCount(parameters.waveCount, 1, 12);
  const duration = Number.isFinite(durationSeconds) && durationSeconds > 0
    ? durationSeconds
    : 1;
  const random = createRandom(parameters.seed);
  const spread = (1 - clamp01(parameters.coherence)) * Math.PI;
  const baseAngle = ((parameters.direction ?? 0) * Math.PI) / 180;
  const amplitude = clamp01(parameters.amplitude);
  const drafts: (ToolcraftFieldWave & { weight: number })[] = [];
  let weightMean = 0;

  for (let index = 0; index < count; index += 1) {
    // Fold the fan into the half-plane facing Direction. A wave whose crests
    // travel against Direction is the same set of crest lines travelling with
    // it, so reflecting keeps the spatial variety while making the field drift
    // one way, as the inspected reference does.
    let offset = spread * (random() * 2 - 1);
    if (offset > Math.PI / 2) offset -= Math.PI;
    else if (offset < -Math.PI / 2) offset += Math.PI;
    const angle = baseAngle + offset;
    const wavelength = Math.max(
      2,
      (Number.isFinite(parameters.wavelength) ? parameters.wavelength : 24) *
        (0.55 + 0.9 * random()),
    );
    const speed = Math.max(
      0.001,
      (Number.isFinite(parameters.speed) ? parameters.speed : 8) *
        (0.7 + 0.6 * random()),
    );
    const weight = 0.7 + 0.6 * random();
    weightMean += weight / count;
    drafts.push({
      amplitude: 0,
      cycles: Math.max(1, Math.round((speed / wavelength) * duration)),
      directionX: Math.cos(angle),
      directionY: Math.sin(angle),
      phase: random() * TWO_PI,
      weight,
      wavelength,
    });
  }

  const share = (amplitude * WAVE_AMPLITUDE_SHARE) / Math.sqrt(count);

  return drafts.map(({ weight, ...wave }) => ({
    ...wave,
    amplitude: (weight / weightMean) * share,
  }));
}

function sampleWaveSum(
  waves: readonly ToolcraftFieldWave[],
  x: number,
  y: number,
  loopProgress: number,
): number {
  let total = 0;
  for (const wave of waves) {
    const projection = x * wave.directionX + y * wave.directionY;
    total += wave.amplitude * Math.sin(
      TWO_PI * (projection / wave.wavelength - wave.cycles * loopProgress) +
        wave.phase,
    );
  }
  return total;
}

/**
 * Samples one cell in `0..1`. Decay is evaluated as a backward-looking maximum
 * over the loop rather than frame-to-frame state, so scrubbing, export, and
 * playback all resolve the same value for the same time.
 */
export function sampleToolcraftFieldCell(
  waves: readonly ToolcraftFieldWave[],
  parameters: ToolcraftFieldParameters,
  column: number,
  row: number,
  loopProgress: number,
): number {
  // Wave geometry lives in cell-index space, and the field is deliberately
  // anisotropic. The inspected reference varies far faster down rows (2-9 rows
  // per cycle) than across columns (18-55 cells per cycle), which decorrelates
  // neighbouring rows and offsets each from the next. Row scale reproduces that
  // ratio; without it every row is a near-copy of its neighbour and the field
  // reads as smooth vertical smears instead of banded rows.
  const x = column + 0.5;
  const y = (row + 0.5) * (
    Number.isFinite(parameters.rowScale) && parameters.rowScale > 0
      ? parameters.rowScale
      : 1
  );
  const progress = ((loopProgress % 1) + 1) % 1;

  let level = TOOLCRAFT_FIELD_BASE_LEVEL + sampleWaveSum(waves, x, y, progress);
  const decay = clamp01(parameters.decay);
  if (decay > 0) {
    const window = decay * DECAY_LOOP_WINDOW;
    for (let tap = 1; tap <= TOOLCRAFT_FIELD_DECAY_TAPS; tap += 1) {
      const back = ((progress - (window * tap) / TOOLCRAFT_FIELD_DECAY_TAPS) % 1 + 1) % 1;
      const trail =
        (TOOLCRAFT_FIELD_BASE_LEVEL + sampleWaveSum(waves, x, y, back)) *
        (1 - tap / (TOOLCRAFT_FIELD_DECAY_TAPS + 1));
      if (trail > level) level = trail;
    }
  }

  const noise = clamp01(parameters.noise);
  if (noise > 0) {
    level += (sampleToolcraftCellGrain(column, row, parameters.seed) * 2 - 1) * noise * 0.5;
  }

  const threshold = clamp01(parameters.threshold);
  if (threshold > 0) {
    if (level <= threshold) return 0;
    level = (level - threshold) / (1 - threshold);
  }

  return clamp01(level);
}
