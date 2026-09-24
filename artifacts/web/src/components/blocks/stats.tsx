import { parseBlock, type StatsProps, statsSchema } from "@/lib/blocks/schemas";
import { LedgerCorners } from "./ledger";
import { SectionHeader } from "./section-header";
import { StatMeter } from "./stat-meter";

export function Stats(raw: StatsProps) {
  const { eyebrow, title, meta, stats } = parseBlock("Stats", statsSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16">
        <SectionHeader eyebrow={eyebrow} meta={meta} title={title} />

        {/* `relative` so the crosshairs can hang off the grid's corners. The
            grid closes itself the way the comp draws it, the same arrangement
            the logo ledger uses: the rule on the top and left edges belongs to
            the container, every other rule is a cell's own bottom and right,
            so no two rules ever stack into a doubled line.

            Four cells only go side by side from lg. A tablet splitting 1440
            four ways leaves about 112px of content per cell, and the widest
            meter is a sixteen-tick tally at roughly 176px, so 4-up before lg
            overflowed. 4, 2 and 1 all divide the row evenly, which is what
            keeps the border arrangement closing at every breakpoint. */}
        <div className="relative mt-12">
          <dl className="grid grid-cols-1 border-ledger-rule border-t border-l sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                className="flex flex-col gap-4 border-ledger-rule border-r border-b px-7 py-8"
                // Value and label together, because the schema constrains
                // neither to be unique and two cells could legitimately share
                // a label under different figures.
                key={`${stat.value}-${stat.label}`}
              >
                {/* Figure first, then the meter reading it, then what it
                    counts — the comp's order, and the opposite of the row
                    this Block drew before the redesign. `dd` before `dt` is
                    fine in a definition list as long as they pair up. */}
                <dd className="text-stat font-light text-foreground tabular-nums">{stat.value}</dd>
                {stat.meter && <StatMeter {...stat.meter} />}
                <dt className="text-sm text-muted-foreground leading-normal">{stat.label}</dt>
              </div>
            ))}
          </dl>
          <LedgerCorners />
        </div>
      </div>
    </section>
  );
}
