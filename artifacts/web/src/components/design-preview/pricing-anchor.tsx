import { plans } from "@/components/design-preview/data";
import { cn } from "@/lib/utils";

// Direction: Numeral Anchor — type-scale-driven and asymmetric. The price is
// the largest element on the page. Column widths use whole-number ratios so
// the emphasized plan is visibly wider, not just visually louder.
export function PricingAnchor() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
          What it costs to stop rebuilding from scratch.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:mt-20 lg:grid-cols-[9fr_11fr_9fr]">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col justify-between gap-10 rounded-lg border p-8",
                plan.emphasized ? "border-primary" : "border-border",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                    {plan.name}
                  </span>
                  {plan.emphasized && (
                    <span className="font-mono text-xs tracking-wide text-primary uppercase">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-6xl font-semibold tracking-tight text-foreground tabular-nums sm:text-7xl">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="font-mono text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </p>
                <p className="mt-4 max-w-2xs text-base text-pretty text-muted-foreground">
                  {plan.description}
                </p>
                <ul className="mt-8 flex flex-col gap-3">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground"
                      />
                      <span className="text-base text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={plan.cta.href}
                className={cn(
                  "rounded-lg px-6 py-3 text-center",
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
