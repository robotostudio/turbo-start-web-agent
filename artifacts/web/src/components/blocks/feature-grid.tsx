import { type FeatureGridProps, featureGridSchema, parseBlock } from "@/lib/blocks/schemas";

export function FeatureGrid(raw: FeatureGridProps) {
  const { title, subtitle, features } = parseBlock("FeatureGrid", featureGridSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">{subtitle}</p>
        )}
        <dl className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
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
