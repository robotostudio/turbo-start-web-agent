"use client";

import { useEffect } from "react";

// Fallback for the two-tone overscroll canvas (globals.css
// `@keyframes overscroll-color-transition`, driven by `animation-timeline:
// scroll(root y)` on `html`). That rule is guarded twice — reduced-motion
// users are excluded on purpose, and Firefox has no `animation-timeline` at
// all — and wherever it doesn't run, `html` never gets a background painted
// on it, so the rubber-band gap would show the wrong color (or none) at one
// edge. This covers both excluded cases with an instant background-color
// swap at the scroll midpoint — not an animation, so it stays correct under
// `prefers-reduced-motion: reduce` instead of reintroducing the motion the
// guard exists to suppress.
//
// Reads the same --color-overscroll-top/--color-overscroll-bottom tokens
// the CSS animation uses (globals.css `:root`), so there is one source of
// truth for what the two endpoints are — this only decides *whether* to
// apply them, never *what* they are.
export function OverscrollColorFallback() {
  useEffect(() => {
    const timelineSupported =
      typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");
    const motionAllowed = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    // The scroll-driven CSS rule already covers this case — stay out of its
    // way rather than double-apply a background.
    if (timelineSupported && motionAllowed) return;

    const root = document.documentElement;
    const apply = () => {
      const max = root.scrollHeight - window.innerHeight;
      root.style.backgroundColor =
        max <= 0 || window.scrollY < max / 2
          ? "var(--color-overscroll-top)"
          : "var(--color-overscroll-bottom)";
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    return () => {
      window.removeEventListener("scroll", apply);
      root.style.backgroundColor = "";
    };
  }, []);

  return null;
}
