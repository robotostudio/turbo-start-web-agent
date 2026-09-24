import { CornerTick } from "@/components/site/site-mark";
import { cn } from "@/lib/utils";

// The two parts every ledger grid shares (LogoCloud, Stats, FeatureGrid, Team,
// Pricing, Gallery): the crosshairs on its four outer corners, and the empty
// cells that close a short last row. Drawn once here so a new ledger Block
// composes them rather than copying them.
//
// The grid itself stays in each Block, because its columns differ, but it
// always closes the same way: the container owns `border-t border-l` and each
// cell its own `border-r border-b`, all `border-ledger-rule`, so no two rules
// ever stack into a line twice as bright.

/** The four crosshairs, hung off the corners of a `relative` parent. `away`
 * sets them 13px out rather than 4px, for a grid whose tiles sit in a gap
 * (Gallery) instead of sharing rules, so the ticks still mark its outer edge. */
export function LedgerCorners({ away = false }: { away?: boolean }) {
  const tick = "absolute size-2.25 text-ledger-tick";
  return (
    <>
      <CornerTick className={cn(tick, away ? "-top-3.25 -left-3.25" : "-top-1 -left-1")} />
      <CornerTick className={cn(tick, away ? "-top-3.25 -right-3.25" : "-top-1 -right-1")} />
      <CornerTick className={cn(tick, away ? "-bottom-3.25 -left-3.25" : "-bottom-1 -left-1")} />
      <CornerTick className={cn(tick, away ? "-right-3.25 -bottom-3.25" : "-right-1 -bottom-1")} />
    </>
  );
}

/** Classes for the empty ruled cells that close a short last row, so the grid
 * never ends on a gap. `columns` is the grid's column count at each
 * breakpoint, matching its `grid-cols-*` classes; a filler shows only at the
 * breakpoints where it is needed. Render each as an `aria-hidden` `<li>`. */
export function ledgerFillers(
  count: number,
  columns: { base?: 1 | 2; md?: 2 | 3; lg?: 3 },
): string[] {
  const missing = (cols: number | undefined) => (cols ? (cols - (count % cols)) % cols : 0);
  const base = missing(columns.base);
  const md = missing(columns.md);
  const lg = missing(columns.lg);
  return Array.from({ length: Math.max(base, md, lg) }, (_, index) =>
    cn(
      "border-r border-b border-ledger-rule",
      index < base ? "block" : "hidden",
      columns.md && (index < md ? "md:block" : "md:hidden"),
      columns.lg && (index < lg ? "lg:block" : "lg:hidden"),
    ),
  );
}
