import { features } from "@/components/design-preview/data";

// Direction: Even Field — symmetric, airy, uniform grid. No dividers, no
// numerals, no cards. Weight contrast between dt and dd carries the
// hierarchy on whitespace alone.
export function FeaturesField() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          A template that stays out of your way once the client signs off.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Six pieces, each one doing a single job well.
        </p>
        <dl className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 sm:mt-20 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <dt className="text-lg font-semibold text-foreground">{feature.title}</dt>
              <dd className="mt-2 max-w-sm text-base text-pretty text-muted-foreground">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
