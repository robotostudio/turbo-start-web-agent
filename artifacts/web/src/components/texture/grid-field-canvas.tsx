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

export function GridFieldCanvas({ preset }: { preset: GridPresetName }) {
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
    const sampler = planToolcraftFieldSampler(fieldParametersFor(preset), LOOP_SECONDS);
    const levels = ensureToolcraftLevelBuffer(null, sampler.cellCount);

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
    };
  }, [preset]);

  return (
    <canvas
      className="absolute inset-0 size-full text-foreground transition-opacity duration-300"
      ref={canvasRef}
      style={{ opacity: painted ? 1 : 0 }}
    />
  );
}
