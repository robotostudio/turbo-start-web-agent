import type { GridPresetName } from "@/lib/texture/presets";
import { cn } from "@/lib/utils";
import { GridFieldCanvas } from "./grid-field-canvas";

// The decorative grid texture, drawn from the same algorithm the design was made
// in rather than shipped as a hand-exported bitmap. See
// src/lib/texture/vendor/README.md for where that algorithm came from.
//
// A primitive, not a Block: composed by Blocks, never registered in blockSchemas
// or blockComponents, so it stays out of the catalog and out of blockCount. Same
// status as SectionHeader. Content authors never name it; a Block decides it
// wants a texture.
//
// WHY A MASK AND NOT AN <img>. The still frame is a generated file
// (scripts/generate-texture.ts, committed under public/texture/). An SVG loaded
// by URL is an isolated document and cannot see this page's custom properties,
// so a fill baked into it would be a colour that survives a retheme -- the one
// thing the token layer exists to prevent. Used as a mask it contributes only
// alpha, and the element under it supplies the colour from --foreground.
//
// WHY A FILE AND NOT INLINE. Measured: the dense preset inline costs about
// 95 KB gzipped in the HTML of every page that carries it, and the design uses
// this texture in six places on one page. As a file it is 12 KB gzipped, fetched
// once and cached across all six. The saving is mostly that a stylesheet inside
// the file sets the per-cell width, height and radius once instead of on every
// one of four thousand rects -- which an inline <svg> cannot do, because a
// <style> inside inline SVG applies to the whole document.
//
// The canvas on top is the animated layer, and is optional in every sense: if it
// never loads, never hydrates, or is switched off by the visitor's motion
// preference, this still renders the finished texture.

export function GridField({
  animate = true,
  className,
  preset = "coarse",
}: {
  /**
   * Whether the canvas layer mounts at all. `false` ships no client JavaScript
   * for this texture. Reduced-motion visitors get the still frame regardless of
   * what is passed here -- that decision belongs to them, not to the caller.
   */
  animate?: boolean;
  className?: string;
  preset?: GridPresetName;
}) {
  const mask = `url(/texture/${preset}.svg)`;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none relative isolate overflow-hidden", className)}
      data-texture={preset}
    >
      <div
        className="size-full bg-foreground"
        style={{
          maskImage: mask,
          maskPosition: "center",
          maskSize: "cover",
          WebkitMaskImage: mask,
          WebkitMaskPosition: "center",
          WebkitMaskSize: "cover",
        }}
      />
      {animate && <GridFieldCanvas preset={preset} />}
    </div>
  );
}
