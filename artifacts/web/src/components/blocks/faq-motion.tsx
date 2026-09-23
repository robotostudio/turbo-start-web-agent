"use client";

import { type ReactNode, useEffect, useRef } from "react";

// Smooths the FAQ's open and close. The list itself is server-rendered native
// <details>, which opens and closes with no JavaScript at all (see faq.tsx);
// this only takes over the click once it has loaded, and animates the height
// the browser would otherwise jump. If it never runs, the FAQ still works,
// just without the motion. A reduced-motion visitor keeps the instant toggle.
//
// Web Animations rather than a CSS transition to `height: auto`: that needs
// `interpolate-size`, which only Chromium ships, and this has to be smooth in
// Safari and Firefox too.

const DURATION = 260;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";

export function FaqMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const running = new WeakMap<HTMLDetailsElement, Animation>();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onClick = (event: MouseEvent) => {
      const summary = (event.target as Element).closest("summary");
      const details = summary?.parentElement;
      if (!summary || !(details instanceof HTMLDetailsElement) || !root.contains(details)) return;
      if (reduced.matches) return;
      event.preventDefault();

      // Start from wherever the row is now, so a second click mid-animation
      // reverses it from there instead of snapping back.
      const from = details.getBoundingClientRect().height;
      running.get(details)?.cancel();
      const closing = details.open && !details.hasAttribute("data-closing");

      if (closing) {
        // Flagged, not closed: the answer has to stay rendered until the row
        // has shrunk past it. faq.tsx styles the mark and the number off this
        // so they switch back the moment the click lands.
        details.setAttribute("data-closing", "");
      } else {
        details.removeAttribute("data-closing");
        details.open = true;
      }
      // A closed row is its summary plus the row's own bottom padding.
      const to = closing
        ? summary.getBoundingClientRect().bottom -
          details.getBoundingClientRect().top +
          Number.parseFloat(getComputedStyle(details).paddingBottom)
        : details.getBoundingClientRect().height;

      details.style.overflow = "hidden";
      const animation = details.animate(
        { height: [`${from}px`, `${to}px`] },
        { duration: DURATION, easing: EASING },
      );
      running.set(details, animation);
      animation.onfinish = () => {
        if (closing) {
          details.open = false;
          details.removeAttribute("data-closing");
        }
        details.style.overflow = "";
        running.delete(details);
      };
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}
