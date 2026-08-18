import { stats } from "@/components/design-preview/data";

// Direction: Even Field, pure whitespace. Symmetric 2x2 grid, no dividers
// — the contrast between the bold mono value and the muted label carries
// the hierarchy on its own.
export function StatsGrid() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          What changes when you switch templates.
        </h2>
        <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="font-mono text-4xl font-semibold text-foreground tabular-nums sm:text-5xl">
                {stat.value}
              </dd>
              <dt className="mt-2 truncate text-sm text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
