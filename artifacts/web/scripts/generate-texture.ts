import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { planGridFieldSvg } from "../src/lib/texture/grid-svg.ts";
import {
  fieldParametersFor,
  GRID_PRESETS,
  type GridPresetName,
  geometryInputFor,
  LOOP_SECONDS,
} from "../src/lib/texture/presets.ts";
import { planToolcraftFieldSampler } from "../src/lib/texture/vendor/field-modes.ts";
import { resolveToolcraftGridGeometry } from "../src/lib/texture/vendor/grid-geometry.ts";
import { ensureToolcraftLevelBuffer } from "../src/lib/texture/vendor/grid-render.ts";

// Writes the still frame of each texture preset to public/texture/.
//
// This exists because of a measurement, not a preference. Rendering the dense
// preset inline costs about 95 KB gzipped in the HTML of every page that uses
// it, and the design puts the texture in six places on one page. As a file it is
// fetched once and cached across all six.
//
// The file is consumed as a CSS mask, not as an <img>. An SVG loaded by URL is
// an isolated document and cannot see the page's custom properties, so a fill
// baked into it would be a colour that survives a retheme -- exactly what the
// token layer exists to prevent. As a mask it contributes only alpha, and the
// element behind it supplies the colour from --foreground.
//
// No timestamp, same reasoning as the other generators here: a pure function of
// (presets, algorithm) keeps the --check drift gate honest.

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = join(here, "..", "public", "texture");

/** Whole tenths, matching planGridFieldSvg. Full float precision doubles the bytes for nothing. */
function renderPreset(preset: GridPresetName): string {
  const geometry = resolveToolcraftGridGeometry(geometryInputFor(preset));
  const sampler = planToolcraftFieldSampler(fieldParametersFor(preset), LOOP_SECONDS);
  const levels = ensureToolcraftLevelBuffer(null, sampler.cellCount);
  // Loop position 0, the same frame the canvas starts from, so the animated
  // layer replaces this picture with an identical one.
  const plan = planGridFieldSvg({ geometry, levels, loopProgress: 0, sampler });

  const groups = plan.buckets
    .map((bucket) => {
      const cells = bucket.cells.map((cell) => `<rect x="${cell.x}" y="${cell.y}"/>`).join("");
      return `<g fill-opacity="${bucket.opacity}">${cells}</g>`;
    })
    .join("");

  // Width, height and corner radius are identical for every cell, so they are
  // declared once in a style rule rather than repeated a few thousand times.
  // `width`, `height` and `rx` are SVG2 geometry properties, which means they
  // are settable from CSS; writing them per rect is what makes this file large.
  //
  // Fill is solid white because only the alpha reaches the mask. The colour a
  // visitor sees comes from the element behind it, which reads a design token.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${plan.viewBox}">`,
    `<style>rect{width:${plan.cell.width}px;height:${plan.cell.height}px;rx:${plan.cell.radius}px;fill:#fff}</style>`,
    groups,
    `</svg>`,
  ].join("");
}

const rendered = (Object.keys(GRID_PRESETS) as GridPresetName[]).map((preset) => ({
  content: renderPreset(preset),
  path: join(outputDir, `${preset}.svg`),
  preset,
}));

const check = process.argv.includes("--check");

if (check) {
  const stale = rendered.filter(
    (file) => !existsSync(file.path) || readFileSync(file.path, "utf8") !== file.content,
  );
  if (stale.length > 0) {
    process.stderr.write(
      `Texture assets are out of date (${stale.map((file) => file.preset).join(", ")}). ` +
        "Run `pnpm texture` and commit the result.\n",
    );
    process.exit(1);
  }
  process.stdout.write(`Texture assets up to date (${rendered.length} presets)\n`);
} else {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  for (const file of rendered) writeFileSync(file.path, file.content);
  process.stdout.write(`Texture assets written (${rendered.length} presets)\n`);
}
