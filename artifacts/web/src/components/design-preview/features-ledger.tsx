import { features } from "@/components/design-preview/data";

// Direction: Ledger Rows — dense, horizontal rhythm, dividers doing the
// structural work. Mono index numbers carry real information (row position),
// not decoration.
export function FeaturesLedger() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          Six decisions we already made so you don&apos;t have to remake them per client.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Everything below ships in the template today — not on a roadmap.
        </p>
        <dl className="mt-12 divide-y divide-foreground/10 border-t border-foreground/10 sm:mt-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex flex-col gap-2 py-6 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span className="font-mono text-sm text-muted-foreground tabular-nums sm:w-10 sm:shrink-0">
                {String(index + 1).padStart(2, "0")}
              </span>
              <dt className="text-lg font-semibold text-foreground sm:w-64 sm:shrink-0">
                {feature.title}
              </dt>
              <dd className="max-w-prose text-base text-pretty text-muted-foreground sm:text-base">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
