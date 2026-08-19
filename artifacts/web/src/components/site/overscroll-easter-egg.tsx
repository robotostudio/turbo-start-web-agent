"use client";

import { useEffect, useRef, useState } from "react";
import { overscroll } from "#velite";
import { cn } from "@/lib/utils";

// Idle gap after the last overscroll tick before treating the pull as
// finished, so one continuous pull reads as a single reveal rather than a
// flicker of on/off.
const GESTURE_END_MS = 140;

// Hidden easter egg revealed only in the native rubber-band gap when the
// page bounces past the top (macOS/trackpad elastic scroll, and its
// equivalent on some Windows browsers). Pinned to the top of the viewport
// at `-z-10`, *behind* the opaque <body> (`bg-background`, `@layer base` in
// globals.css) — invisible at rest, only exposed when the bounce reveals
// the space above the document. One line, content-driven
// (content/settings/overscroll.yml), random per reveal. Purely decorative:
// `aria-hidden`, carries no information anyone needs.
//
// The native bounce fires no event this can hook directly, so a passive
// wheel/touch listener *observes* scrollY <= 0 plus an upward gesture — it
// never calls preventDefault and never pins scroll. The browser's own
// rubber-band is completely untouched; this only reacts to it.
//
// Under prefers-reduced-motion this attaches no listeners at all and
// renders the line statically instead — still behind body, so still
// invisible at rest, just with no fade transition if the native bounce
// happens to reveal it.
export function OverscrollEasterEgg() {
  const lines = overscroll.lines;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const touchStartYRef = useRef(0);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial random line — also the one reduced-motion users see, since they
  // get no gesture detector below. Runs once on mount; `overscroll.lines`
  // is a stable module-level constant from the velite singleton.
  useEffect(() => {
    if (lines.length <= 1) return;
    setIndex(Math.floor(Math.random() * lines.length));
  }, []);

  // prefers-reduced-motion via matchMedia, read on mount (SSR-safe) and
  // tracked live.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || lines.length === 0) return;

    const pick = () => {
      if (lines.length <= 1) return;
      // Fresh line each new pull, avoiding an immediate repeat.
      setIndex((prev) => {
        const next = Math.floor(Math.random() * (lines.length - 1));
        return next >= prev ? next + 1 : next;
      });
    };

    const hide = () => {
      revealedRef.current = false;
      setRevealed(false);
    };
    const scheduleHide = () => {
      if (endTimer.current) clearTimeout(endTimer.current);
      endTimer.current = setTimeout(hide, GESTURE_END_MS);
    };
    const reveal = () => {
      if (!revealedRef.current) {
        revealedRef.current = true;
        pick();
        setRevealed(true);
      }
      scheduleHide();
    };

    const onWheel = (event: WheelEvent) => {
      if (window.scrollY <= 0 && event.deltaY < 0) reveal();
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (window.scrollY <= 0 && event.touches[0].clientY - touchStartYRef.current > 0) reveal();
    };

    // All passive: this observes the overscroll, it never blocks or
    // hijacks it.
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      if (endTimer.current) clearTimeout(endTimer.current);
    };
    // lines is overscroll.lines — a stable module-level constant from the
    // velite singleton, intentionally not a dep.
  }, [reduceMotion]);

  if (lines.length === 0) return null;
  const line = lines[index];
  const shown = reduceMotion ? true : revealed;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 flex justify-center px-6 pt-4 text-center font-sans text-primary-foreground"
    >
      <p
        className={cn(
          "text-sm font-semibold transition duration-300 ease-out motion-reduce:transition-none",
          shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {line}
      </p>
    </div>
  );
}
