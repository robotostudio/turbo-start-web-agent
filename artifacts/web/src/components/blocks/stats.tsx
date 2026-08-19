import { parseBlock, type StatsProps, statsSchema } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function Stats(raw: StatsProps) {
  const { title, stats } = parseBlock("Stats", statsSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <SectionHeader title={title} />
        <dl className="mt-14 divide-y divide-foreground/10 sm:mt-20 sm:grid sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2 py-8 first:pt-0 last:pb-0 sm:px-8 sm:py-0 sm:first:pl-0 sm:last:pr-0"
            >
              <dt className="truncate text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="font-mono text-4xl font-semibold text-foreground tabular-nums sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
