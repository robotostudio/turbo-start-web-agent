"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// Direction: Floating panel (xl and up) + drill-down drawer (below xl).
// Reuses the "floating nav panel" shape already picked for this header
// (rounded panel inset from the page edge, referenced from
// daylightcomputer.com) and pairs it with a stacked drill-down mobile menu —
// the interaction pattern the user asked to bring back from an earlier
// project. Only the interaction/layout ideas were carried over: bottom sheet
// on phones, side panel above 640px, tapping a parent slides forward to its
// children, a back control returns, and the drill-down stack resets shortly
// after close so it never visibly snaps back to root mid-transition. No
// branding, copy, nav items, or tokens from that project were reused.
//
// Hand-rolled with React state and CSS transitions (no motion/animation
// dependency is installed). A later task can swap this for shadcn's `drawer`
// (Vaul) for real swipe-to-dismiss and focus trapping — the open/close and
// drill-down state here is kept simple on purpose so that swap stays easy.

type NavNode = {
  label: string;
  href: string;
  children?: NavNode[];
};

const navItems: NavNode[] = [
  {
    label: "Product",
    href: "/product",
    children: [
      { label: "Blocks gallery", href: "/blocks-gallery" },
      { label: "Style guide", href: "/style-guide" },
      { label: "Templates", href: "/templates" },
    ],
  },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

type Level = { title: string; items: NavNode[] };
type Direction = "forward" | "back";

const rootLevel: Level = { title: "Menu", items: navItems };

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
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

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

function DrilldownLevel({
  level,
  direction,
  onDrillInto,
  onNavigate,
}: {
  level: Level;
  direction: Direction;
  onDrillInto: (item: NavNode) => void;
  onNavigate: () => void;
}) {
  // Enter-only transition: the new level's rows fade/slide in from the side
  // matching the drill direction. The outgoing level unmounts immediately
  // (this key remount replaces it) rather than animating out in parallel —
  // a deliberate simplification given the "hand-roll, no motion lib"
  // constraint; a real Vaul-based swap could add a true two-panel crossfade.
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
                  "flex w-full items-center justify-between gap-3 rounded-card px-3 py-3 text-left text-base text-foreground hover:bg-muted",
                  focusRing,
                )}
              >
                {item.label}
                <ChevronRightIcon />
              </button>
            </li>
          ) : (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center rounded-card px-3 py-3 text-base text-foreground hover:bg-muted",
                  focusRing,
                )}
              >
                {item.label}
              </a>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

export function SiteHeaderDrawer() {
  const titleId = useId();
  const panelId = useId();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const nav = useDrilldown();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setMounted(true);
    setOpen(true);
  };

  const closeMenu = () => {
    setOpen(false);
    setEntered(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // Defer unmount + the drill-down reset until the ~300ms close
    // transition has actually finished, so the stack never visibly snaps
    // back to the root level while the panel is still sliding away. Any
    // previous timer is always cleared first (here and in openMenu), so a
    // quick close-then-reopen can't leave a stale timer that later yanks
    // the stack mid-interaction.
    closeTimer.current = setTimeout(() => {
      setMounted(false);
      nav.reset();
      closeTimer.current = null;
    }, 350);
    triggerRef.current?.focus();
  };

  // Flip to the "entered" position on the frame after mount so the panel
  // actually transitions in from off-screen instead of appearing already
  // open.
  useEffect(() => {
    if (!mounted || !open) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted, open]);

  // Keep a live ref to the latest closeMenu so the escape-key effect below
  // doesn't need to list it as a dependency (and re-subscribe) every time
  // it's recreated.
  const closeMenuRef = useRef(closeMenu);
  closeMenuRef.current = closeMenu;

  // Escape-to-close and a body scroll lock while the panel is in the DOM
  // (covers the open state and the closing transition window).
  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenuRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  // Move focus into the panel on open; clear any pending close timer on
  // unmount so it can never fire after the component is gone.
  useEffect(() => {
    if (mounted && open) closeButtonRef.current?.focus();
  }, [mounted, open]);
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // Minimal hand-rolled focus trap (Tab/Shift+Tab wrap within the panel).
  // No focus-trap library is installed; see the report for what this still
  // misses versus a real dialog primitive.
  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      "a[href], button:not(:disabled)",
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <header className="sticky top-4 z-40 font-sans">
      <div className="page-inset">
        <div className="flex items-center gap-6 rounded-card border border-border bg-background px-4 py-3 sm:px-6">
          <div className="flex flex-1 items-center">
            <a href="/" aria-label="Homepage" className="text-base font-semibold text-foreground">
              Harbour
            </a>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3">
            <a
              href="/docs"
              className={cn(
                "hidden rounded-card border border-border px-4 py-2 text-sm text-foreground xl:inline-block",
                focusRing,
              )}
            >
              Read the docs
            </a>
            <button
              ref={triggerRef}
              type="button"
              onClick={openMenu}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label="Open menu"
              className={cn(
                "flex items-center justify-center rounded-card p-1.5 xl:hidden",
                focusRing,
              )}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {mounted ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeMenu}
            className={cn(
              "fixed inset-0 bg-foreground/40 transition-opacity duration-300 ease-out motion-reduce:transition-none",
              entered ? "opacity-100" : "opacity-0",
            )}
          />
          <div className="fixed inset-3 flex items-end sm:items-stretch sm:justify-end">
            <div
              id={panelId}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onKeyDown={onPanelKeyDown}
              inert={!open ? true : undefined}
              className={cn(
                "flex max-h-full w-full flex-col overflow-hidden rounded-card border border-border bg-background transition-transform duration-300 ease-out motion-reduce:transition-none sm:h-full sm:w-96",
                entered
                  ? "translate-x-0 translate-y-0"
                  : "translate-y-full sm:translate-y-0 sm:translate-x-full",
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
                        "-ml-1 flex shrink-0 items-center justify-center rounded-card p-1.5",
                        focusRing,
                      )}
                    >
                      <BackIcon />
                    </button>
                  ) : null}
                  <p id={titleId} className="truncate text-lg font-medium text-foreground">
                    {nav.current.title}
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-card p-1.5",
                    focusRing,
                  )}
                >
                  <CloseIcon />
                </button>
              </div>

              <DrilldownLevel
                key={`${nav.current.title}-${nav.current.items.length}`}
                level={nav.current}
                direction={nav.direction}
                onDrillInto={nav.drillInto}
                onNavigate={closeMenu}
              />

              <div className="shrink-0 border-t border-border p-4">
                <a
                  href="/docs"
                  onClick={closeMenu}
                  className={cn(
                    "flex w-full items-center justify-center rounded-card border border-border px-4 py-3 text-base text-foreground",
                    focusRing,
                  )}
                >
                  Read the docs
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
