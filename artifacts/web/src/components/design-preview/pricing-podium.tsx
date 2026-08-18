import { plans } from "@/components/design-preview/data";
import { cn } from "@/lib/utils";

// Direction: Podium — the classic symmetric 3-up grid. The emphasized plan
// pokes out top and bottom using explicit grid rows, never negative margins.
export function PricingPodium() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          One template, three ways to license it.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Start free, upgrade the day you take on a second client.
        </p>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:mt-16 lg:grid-cols-3 lg:grid-rows-[--spacing(6)_1fr_--spacing(6)]">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col justify-between gap-8 rounded-card border p-8 lg:row-start-2",
                plan.emphasized ? "border-brand" : "border-border",
                plan.emphasized && "lg:row-span-full",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  {plan.emphasized && (
                    <span className="font-mono text-xs tracking-wide text-brand uppercase">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="font-mono text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </p>
                <p className="mt-4 text-base text-pretty text-muted-foreground">
                  {plan.description}
                </p>
                <ul className="mt-6 flex flex-col gap-3">
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
                  "rounded-card px-6 py-3 text-center",
                  plan.emphasized
                    ? "bg-brand text-brand-foreground"
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
