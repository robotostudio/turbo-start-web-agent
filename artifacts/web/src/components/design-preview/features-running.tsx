import { features } from "@/components/design-preview/data";
import { cn } from "@/lib/utils";

// Direction: Running Text — content-led, no chrome. No separate heading
// group; the opening statement is set larger and reads as the first line of
// a running list. Offset margins alternate to break the vertical stack out
// of a rigid column.
export function FeaturesRunning() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <p className="max-w-sm text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
          Here is everything the template already handles.
        </p>
        <dl className="mt-12 flex flex-col gap-10 sm:mt-16 sm:gap-12">
          {features.map((feature, index) => (
            <div key={feature.title} className={cn("max-w-prose", index % 2 === 1 && "sm:ml-16")}>
              <dt className="text-xl font-semibold text-foreground">{feature.title}</dt>
              <dd className="mt-1 text-lg text-pretty text-muted-foreground">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
