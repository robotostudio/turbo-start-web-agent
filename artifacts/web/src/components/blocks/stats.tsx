import { parseBlock, type StatsProps, statsSchema } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function Stats(raw: StatsProps) {
  const { title, stats } = parseBlock("Stats", statsSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset section-y">
        <SectionHeader title={title} />
        <dl className="stack-content grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 card p-6 sm:p-8">
              <dt className="type-caption text-muted-foreground">{stat.label}</dt>
              <dd className="order-first type-heading text-foreground tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
