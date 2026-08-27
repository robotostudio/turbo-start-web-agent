"use client";

import { useEffect } from "react";

// Scrollspy for the article side panel: marks the one table-of-contents link
// whose section is currently being read with `data-active`, which
// article-toc.tsx styles. Renders nothing.
//
// Client by necessity — scroll position and layout are browser-only — but
// deliberately the ONLY client code in the panel: the list itself, and every
// jump link in it, is server-rendered and works before this island loads and
// with JS off entirely. If this component never runs, the panel simply has no
// highlight.
export function TocActive({
  container = "[data-toc]",
  link = "a[data-toc-link]",
}: {
  container?: string;
  link?: string;
} = {}) {
  useEffect(() => {
    const toc = document.querySelector(container);
    if (!toc) return;

    // Each heading id -> its link. Reading the ids back off the links (rather
    // than re-deriving them) means the two can never disagree: whatever
    // Velite's `s.toc()` emitted is exactly what gets tracked.
    const linkById = new Map<string, HTMLAnchorElement>();
    for (const anchor of toc.querySelectorAll<HTMLAnchorElement>(link)) {
      const id = decodeURIComponent(new URL(anchor.href).hash.slice(1));
      if (id && !linkById.has(id)) linkById.set(id, anchor);
    }

    const headings = [...linkById.keys()]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // `const`-only: mutable state lives on an object holder rather than a
    // reassigned binding, so the closure below has one obvious owner.
    const state = { activeId: "" };

    const update = () => {
      // A heading counts as "reached" once it has scrolled above this line,
      // which sits just below the sticky header (top-4 plus its own height)
      // and matches SCROLL_MARGIN in globals.css.
      //
      // A proportional line (say 30% of the viewport) reads better while
      // free-scrolling, but it breaks the panel's primary interaction:
      // clicking an entry jumps that heading to the scroll-margin offset,
      // and any section shorter than the remaining gap leaves the NEXT
      // heading already above the line — so clicking "Quotes" highlights
      // "Code". Verified in the browser, not reasoned about. Predictable
      // beats pretty for a control whose whole job is telling you where
      // you are.
      const readingLine = 140;
      // The active heading is the last one that has passed the reading line.
      // `findIndex` gives the first heading still below it, so everything
      // before that has passed; -1 means they all have, i.e. the last one.
      const firstBelow = headings.findIndex((h) => h.getBoundingClientRect().top > readingLine);
      const active =
        firstBelow === -1 ? headings[headings.length - 1] : headings[Math.max(0, firstBelow - 1)];
      if (active.id === state.activeId) return;
      state.activeId = active.id;
      for (const [id, anchor] of linkById) anchor.toggleAttribute("data-active", id === active.id);
    };

    // Scroll fires far more often than the highlight can change, so the work
    // is coalesced to one read per animation frame — measuring layout on
    // every raw scroll event is what makes a scrollspy janky.
    const frame = { pending: false };
    const onScroll = () => {
      if (frame.pending) return;
      frame.pending = true;
      requestAnimationFrame(() => {
        frame.pending = false;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [container, link]);

  return null;
}
