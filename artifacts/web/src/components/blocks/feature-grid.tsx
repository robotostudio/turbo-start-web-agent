import { type FeatureGridProps, featureGridSchema, parseBlock } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function FeatureGrid(raw: FeatureGridProps) {
  const { title, lede, features } = parseBlock("FeatureGrid", featureGridSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <SectionHeader title={title} lede={lede} />
        <dl className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <dt className="text-lg font-semibold text-foreground">{feature.title}</dt>
              <dd className="mt-2 max-w-sm text-base text-pretty text-muted-foreground">
                {feature.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
