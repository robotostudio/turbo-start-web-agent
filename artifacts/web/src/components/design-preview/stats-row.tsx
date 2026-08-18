import { stats } from "@/components/design-preview/data";

// Direction: Even Field. Stats sit in a single row on desktop (stacked on
// mobile), separated by dividers per surfaces.md — the sibling-in-a-shared-
// context case dividers are meant for. Geist Mono on the values.
export function StatsRow() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          The numbers behind the pitch.
        </h2>
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
