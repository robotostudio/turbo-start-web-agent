"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navigation, site } from "#velite";

import { SiteLink } from "@/components/site/site-link";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

// Direction: Floating panel (xl and up) + drill-down drawer (below xl).
// Reuses the "floating nav panel" shape already picked for this header
// (rounded panel inset from the page edge, referenced from
// daylightcomputer.com) and pairs it with a stacked drill-down mobile menu —
// the interaction pattern the user asked to bring back from an earlier
// project (itself built on Base UI's Drawer, so this is the same primitive).
// Only the interaction/layout ideas were carried over: bottom sheet on
// phones, side panel above 640px, tapping a parent slides forward to its
// children, a back control returns. No branding, copy, nav items, or tokens
// from that project were reused.
//
// Dialog mechanics (focus trap, scroll lock, outside-press dismissal,
// swipe-to-dismiss, close animation timing) are fully delegated to the
// vendored `@/components/ui/drawer` (Base UI). Only the drill-down stack
// stays as plain local React state — that part was never the problem.
//
// This is the ONE client component in the site-chrome system: it needs
// `useState`/`useEffect` for the drill-down stack and the `sm`-breakpoint
// media query. Nav items themselves are content, not state — they come from
// the `navigation` singleton collection (content/settings/navigation.yml),
// validated at build time by velite.config.ts.

type NavLink = { label: string; href: string };
type NavNode = NavLink & { children?: NavLink[] };

const navItems: NavNode[] = navigation.items;

type Level = { title: string; items: NavNode[] };
type Direction = "forward" | "back";

const rootLevel: Level = { title: "Menu", items: navItems };

// Matches Tailwind's `sm` breakpoint (--breakpoint-sm: 40rem in this
// project's Tailwind theme) so the JS-driven swipeDirection swap lands at
// the exact same viewport width as the primitive's own `sm:` sizing classes
// (e.g. the 24rem side-panel width in `@/components/ui/drawer`).
const SIDE_PANEL_QUERY = "(min-width: 40rem)";

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-6 text-foreground"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-6 text-foreground"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-5 text-foreground"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 15.5 7 10l5.5-5.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-5 shrink-0 text-muted-foreground"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 4.5 13 10l-5.5 5.5" />
    </svg>
  );
}

const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function useDrilldown() {
  const [stack, setStack] = useState<Level[]>([rootLevel]);
  const [direction, setDirection] = useState<Direction>("forward");

  const current = stack[stack.length - 1] ?? rootLevel;
  const canGoBack = stack.length > 1;

  const drillInto = (item: NavNode) => {
    if (!item.children?.length) return;
    setDirection("forward");
    setStack((prev) => [...prev, { title: item.label, items: item.children ?? [] }]);
  };

  const goBack = () => {
    setDirection("back");
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const reset = () => {
    setDirection("forward");
    setStack([rootLevel]);
  };

  return { current, canGoBack, direction, drillInto, goBack, reset };
}

// Tracks the `sm` breakpoint so the drawer's swipe direction (and therefore
// bottom-sheet-vs-side-panel shape) can be driven through the primitive's
// own `swipeDirection` API instead of CSS positioning hacks.
function useSidePanel() {
  const [isSidePanel, setIsSidePanel] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(SIDE_PANEL_QUERY);
    const update = () => setIsSidePanel(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isSidePanel;
}

function DrilldownLevel({
  level,
  direction,
  onDrillInto,
}: {
  level: Level;
  direction: Direction;
  onDrillInto: (item: NavNode) => void;
}) {
  // Enter-only transition: the new level's rows fade/slide in from the side
  // matching the drill direction. The outgoing level unmounts immediately
  // (this key remount replaces it) rather than animating out in parallel —
  // a deliberate simplification given the "no motion lib" constraint. This
  // is internal drill-down state, not dialog mechanics, so it stays
  // hand-rolled per the brief.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(false);
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <nav
      aria-label={level.title}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto p-2 transition duration-200 ease-out motion-reduce:transition-none",
        entered
          ? "translate-x-0 opacity-100"
          : direction === "forward"
            ? "translate-x-4 opacity-0"
            : "-translate-x-4 opacity-0",
      )}
    >
      <ul className="flex flex-col">
        {level.items.map((item) =>
          item.children?.length ? (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => onDrillInto(item)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-base text-foreground hover:bg-muted",
                  focusRing,
                )}
              >
                {item.label}
                <ChevronRightIcon />
              </button>
            </li>
          ) : (
            <li key={item.label}>
              <DrawerClose
                nativeButton={false}
                // `render` clones this element and merges the props below onto
                // it, so a next/link element works here exactly as a raw <a>
                // did — the drawer still closes on click, but the navigation
                // is now client-side. Written inline rather than through
                // SiteLink because `render` merges props onto the element it
                // is given, and a custom wrapper would have to forward
                // className, ref, and the drawer's own handlers by hand.
                render={
                  item.href.startsWith("/") ? (
                    <Link href={item.href} />
                  ) : (
                    // This element is a template for `render`, not the anchor
                    // that ships: DrawerClose clones it with this component's
                    // children (the nav label) attached, so it never reaches
                    // the DOM without content.
                    // biome-ignore lint/a11y/useAnchorContent: DrawerClose supplies the children
                    <a href={item.href} />
                  )
                }
                className={cn(
                  "flex items-center rounded-lg px-3 py-3 text-base text-foreground hover:bg-muted",
                  focusRing,
                )}
              >
                {item.label}
              </DrawerClose>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

export function SiteHeader() {
  const nav = useDrilldown();
  const isSidePanel = useSidePanel();

  return (
    <header className="sticky top-0 z-40 font-sans">
      <div className="page-inset">
        <div className="flex items-center gap-6 border-2 border-border bg-background px-4 py-3 sm:px-6">
          <div className="flex flex-1 items-center">
            <Link
              href="/"
              aria-label="Homepage"
              className="text-base font-semibold text-foreground"
            >
              {site.name}
            </Link>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
            {navItems.map((item) => (
              <SiteLink
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </SiteLink>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3">
            <Link
              href="/style-guide"
              className={cn(
                "hidden rounded-lg border border-border px-4 py-2 text-sm text-foreground xl:inline-block",
                focusRing,
              )}
            >
              Read the docs
            </Link>

            <Drawer
              swipeDirection={isSidePanel ? "right" : "down"}
              onOpenChangeComplete={(open) => {
                // Preferred over a fixed-duration timeout: this fires only
                // after the primitive's own close animation has actually
                // finished, so the drill-down stack never visibly snaps back
                // to the root level mid-transition, and a fast
                // close-then-reopen can't race a stale timer (there isn't
                // one) into yanking the stack mid-interaction.
                if (!open) nav.reset();
              }}
            >
              <DrawerTrigger
                aria-label="Open menu"
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5 xl:hidden",
                  focusRing,
                )}
              >
                <MenuIcon />
              </DrawerTrigger>

              <DrawerContent
                className={cn(
                  "drawer-panel-inset rounded-lg border bg-background text-foreground xl:hidden",
                  // The vendored Popup only rounds the edge-attached corners
                  // by default (`rounded-t-xl` for a bottom sheet,
                  // `rounded-l-xl` for a right side panel — appropriate when
                  // the drawer is flush with the viewport edge). Now that
                  // it's inset on every side, all four corners need to
                  // match; these direction-scoped overrides win over the
                  // vendor's own (via matching data-attribute specificity)
                  // instead of leaving the two edge corners at `rounded-xl`
                  // while the other two fall back to plain `rounded-lg`.
                  "data-[swipe-direction=down]:rounded-t-lg data-[swipe-direction=up]:rounded-b-lg data-[swipe-direction=left]:rounded-r-lg data-[swipe-direction=right]:rounded-l-lg",
                )}
              >
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <div className="flex min-w-0 items-center gap-1">
                    {nav.canGoBack ? (
                      <button
                        type="button"
                        onClick={nav.goBack}
                        aria-label="Back"
                        className={cn(
                          "-ml-1 flex shrink-0 items-center justify-center rounded-lg p-1.5",
                          focusRing,
                        )}
                      >
                        <BackIcon />
                      </button>
                    ) : null}
                    <DrawerTitle className="truncate text-lg font-medium">
                      {nav.current.title}
                    </DrawerTitle>
                  </div>
                  <DrawerClose
                    aria-label="Close menu"
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-lg p-1.5",
                      focusRing,
                    )}
                  >
                    <CloseIcon />
                  </DrawerClose>
                </div>

                {/* Announces the current drill-down level to screen readers
                    on every stack change — the primitive wires the panel's
                    accessible name (via DrawerTitle) but has no notion of
                    our in-panel drill-down navigation, so this stays our
                    responsibility rather than the primitive's. */}
                <div aria-live="polite" className="sr-only">
                  {nav.current.title}
                </div>

                <DrilldownLevel
                  key={`${nav.current.title}-${nav.current.items.length}`}
                  level={nav.current}
                  direction={nav.direction}
                  onDrillInto={nav.drillInto}
                />

                <div className="shrink-0 border-t border-border p-4">
                  <DrawerClose
                    nativeButton={false}
                    render={<Link href="/style-guide" />}
                    className={cn(
                      "flex w-full items-center justify-center rounded-lg border border-border px-4 py-3 text-base text-foreground",
                      focusRing,
                    )}
                  >
                    Read the docs
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
}
