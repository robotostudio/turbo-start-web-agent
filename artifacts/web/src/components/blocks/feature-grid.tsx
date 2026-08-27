import { type FeatureGridProps, featureGridSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./section-header";

export function FeatureGrid(raw: FeatureGridProps) {
  const { title, lede, features } = parseBlock("FeatureGrid", featureGridSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset section-y">
        <SectionHeader title={title} lede={lede} />
        <dl className="stack-content grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const wide = index < 2;
            return (
              <div
                key={feature.title}
                className={cn(
                  "flex flex-col justify-end card p-6 sm:p-8",
                  wide ? "min-h-52 xl:col-span-2 xl:min-h-80" : "min-h-52",
                )}
              >
                <dt className="type-subheading text-foreground">{feature.title}</dt>
                <dd
                  className={cn(
                    "stack-tight text-muted-foreground",
                    wide ? "max-w-md type-lead" : "type-para",
                  )}
                >
                  {feature.body}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
