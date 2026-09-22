"use client";

import { useEffect, useRef, useState } from "react";
import {
  fieldParametersFor,
  type GridPresetName,
  geometryInputFor,
  LOOP_SECONDS,
} from "@/lib/texture/presets";
import { planToolcraftFieldSampler } from "@/lib/texture/vendor/field-modes";
import { resolveToolcraftGridGeometry } from "@/lib/texture/vendor/grid-geometry";
import {
  ensureToolcraftLevelBuffer,
  renderToolcraftGridPreviewFrame,
} from "@/lib/texture/vendor/grid-render";

// The animated layer. This is the only client component the texture needs, and
// it is a deliberate exception to "no client JS by default" -- AGENTS.md allows
// one where a Block "actually needs" it, and an animation does.
//
// What makes the exception cheap is that nothing depends on it. GridField has
// already rendered the whole texture as SVG on the server, so this file's job is
// to replace a correct still picture with a moving one. If it never loads, never
// hydrates, or is switched off by the visitor's motion preference, the page is
// still finished.
//
// Three things keep it from being a battery complaint. It does not mount under
// prefers-reduced-motion. It stops when scrolled out of view, which matters
// because the comp uses this texture in six places on one page. And it only
// reveals itself once it has painted, so there is never a blank frame where the
// SVG used to be.

export function GridFieldCanvas({
  pointer = false,
  preset,
}: {
  pointer?: boolean;
  preset: GridPresetName;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const geometry = resolveToolcraftGridGeometry(geometryInputFor(preset));
    const planned = planToolcraftFieldSampler(fieldParametersFor(preset), LOOP_SECONDS);
    const levels = ensureToolcraftLevelBuffer(null, planned.cellCount);

    // Where the cursor is, in the grid's own pixel space, or null when it is
    // not over this instance. A ref rather than state on purpose: the loop
    // already redraws every frame, so moving the pointer never needs to
    // schedule a render of its own.
    let pointerAt: { x: number; y: number } | null = null;

    const stepX = geometry.cellWidth + geometry.gap;
    const stepY = geometry.cellHeight + geometry.gap;
    // Ten columns reads as a pool of light rather than a spotlight. Measured in
    // pixels rather than cells so the highlight is round: cells are more than
    // twice as tall as they are wide, so a radius counted in cells would be an
    // ellipse on screen.
    const radius = stepX * 10;
    const strength = 0.55;

    // Decorates the planned sampler rather than editing it. The vendored maths
    // stay untouched and diffable, and the pointer is a pass over the level
    // buffer the renderer was going to read anyway.
    const sampler = {
      cellCount: planned.cellCount,
      resolveLevels(buffer: Float32Array, loopProgress: number) {
        planned.resolveLevels(buffer, loopProgress);
        const at = pointerAt;
        if (!at) return;
        // Only the neighbourhood, not the whole grid: at the dense preset that
        // is a few hundred cells out of four thousand.
        const minCol = Math.max(0, Math.floor((at.x - radius) / stepX));
        const maxCol = Math.min(geometry.columns - 1, Math.ceil((at.x + radius) / stepX));
        const minRow = Math.max(0, Math.floor((at.y - radius) / stepY));
        const maxRow = Math.min(geometry.rows - 1, Math.ceil((at.y + radius) / stepY));
        for (let row = minRow; row <= maxRow; row += 1) {
          const offset = row * geometry.columns;
          const dy = (row + 0.5) * stepY - at.y;
          for (let column = minCol; column <= maxCol; column += 1) {
            const dx = (column + 0.5) * stepX - at.x;
            const distance = (dx * dx + dy * dy) / (radius * radius);
            if (distance >= 1) continue;
            // Squared falloff, so the edge of the pool is soft rather than a
            // visible circle.
            const lifted = buffer[offset + column] + strength * (1 - distance) ** 2;
            buffer[offset + column] = lifted > 1 ? 1 : lifted;
          }
        }
      },
    };

    // The cell colour is a design token, resolved off the element rather than
    // passed as a hex, so a retheme carries the texture with it.
    const cellColor = getComputedStyle(canvas).color;

    let frame = 0;
    let startedAt = 0;
    let visible = true;
    let running = false;

    const draw = (loopProgress: number) => {
      // Back the canvas at device resolution, or the cells are soft on a retina
      // screen. The grid's own extent is the coordinate space; CSS scales the
      // element to whatever box it has been given.
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const pixelWidth = Math.max(1, Math.round(geometry.width * ratio));
      const pixelHeight = Math.max(1, Math.round(geometry.height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      renderToolcraftGridPreviewFrame({
        background: null,
        cellColor,
        context,
        geometry,
        levels,
        loopProgress,
        pixelHeight,
        pixelWidth,
        sampler,
        scale: ratio,
      });
    };

    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      // Whole loops only. Every wave's temporal frequency is a whole number of
      // cycles per loop, so the first and last frames stitch and the field never
      // jumps at the seam.
      draw(((now - startedAt) / (LOOP_SECONDS * 1000)) % 1);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      startedAt = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    // Paint frame zero before anything else so the reveal below swaps one
    // finished picture for an identical one.
    draw(0);
    setPainted(true);

    // The texture is pointer-events-none, and has to be: it sits behind
    // content and must never swallow a click. So the listener goes on the
    // window and each instance decides from its own rect whether the cursor is
    // over it -- which also means only the one under the cursor ever lights up.
    //
    // Gated on a real hovering pointer. On touch there is no cursor to follow,
    // and `pointermove` fires on tap, which would make the texture flash under
    // a finger that was trying to scroll.
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      pointerAt = inside
        ? {
            x: ((event.clientX - rect.left) / rect.width) * geometry.width,
            y: ((event.clientY - rect.top) / rect.height) * geometry.height,
          }
        : null;
    };
    const clearPointer = () => {
      pointerAt = null;
    };

    if (pointer && hoverQuery.matches) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", clearPointer, { passive: true });
      window.addEventListener("blur", clearPointer);
    }

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) start();
      else stop();
    });
    observer.observe(canvas);

    const onMotionChange = () => {
      if (motion.matches) stop();
      else if (visible) start();
    };
    motion.addEventListener("change", onMotionChange);

    return () => {
      stop();
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("blur", clearPointer);
    };
  }, [pointer, preset]);

  return (
    <canvas
      className="absolute inset-0 size-full object-cover text-foreground transition-opacity duration-300"
      ref={canvasRef}
      style={{ opacity: painted ? 1 : 0 }}
    />
  );
}
