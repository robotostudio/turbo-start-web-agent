import { features } from "@/components/design-preview/data";
import { cn } from "@/lib/utils";

// Direction: Anchor Numerals — type-scale-driven and asymmetric. Oversized
// mono numerals anchor each block; the grid spans are deliberately uneven
// instead of a uniform 3-up layout.
const spans = [
  "lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-4",
  "lg:col-span-3",
  "lg:col-span-3",
];

export function FeaturesAnchor() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
          Six defaults, already decided.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-6 sm:mt-20">
          {features.map((feature, index) => (
            <div key={feature.title} className={cn("flex flex-col", spans[index])}>
              <span
                aria-hidden="true"
                className="font-mono text-7xl font-semibold tracking-tight text-muted-foreground/25 tabular-nums sm:text-8xl"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <dl className="-mt-3 sm:-mt-4">
                <dt className="text-xl font-semibold text-foreground">{feature.title}</dt>
                <dd className="mt-2 max-w-sm text-base text-pretty text-muted-foreground">
                  {feature.description}
                </dd>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
