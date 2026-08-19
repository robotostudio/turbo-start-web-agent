import { plans } from "@/components/design-preview/data";
import { cn } from "@/lib/utils";

// Direction: Stacked Full-Width — vertical rhythm even on desktop, never
// converts to a side-by-side grid. Each plan is a full-width row; the
// emphasized row is marked by a border wrapper, not a card or a fill color.
export function PricingStacked() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          Pick a license, not a sales call.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Every tier ships the same block library. The difference is how many sites you run on it.
        </p>
        <div className="mt-12 flex flex-col sm:mt-16">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col gap-6 border-t border-foreground/10 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10",
                index === 0 && "border-t-0",
                plan.emphasized && "rounded-lg border border-primary px-6 py-8 sm:px-8",
              )}
            >
              <div className="sm:w-64 sm:shrink-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  {plan.emphasized && (
                    <span className="font-mono text-xs tracking-wide text-primary uppercase">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="font-mono text-xs text-muted-foreground">{plan.period}</span>
                  )}
                </p>
                <p className="mt-2 text-base text-pretty text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <ul className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
                {plan.features.map((item) => (
                  <li key={item} className="text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={plan.cta.href}
                className={cn(
                  "rounded-lg px-6 py-3 text-center sm:shrink-0",
                  plan.emphasized
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground",
                )}
              >
                {plan.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
