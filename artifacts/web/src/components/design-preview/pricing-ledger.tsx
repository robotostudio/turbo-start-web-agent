import { plans } from "@/components/design-preview/data";
import { cn } from "@/lib/utils";

// Direction: Ledger — plans read as rows in a table, not cards in a grid.
// Dense and structured; the divider rules do the separating, emphasis comes
// from the button and a text label only.
export function PricingLedger() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          Three licenses, laid out side by side.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Compare what each tier unlocks before you commit to one.
        </p>
        <dl className="mt-12 divide-y divide-foreground/10 border-t border-foreground/10 sm:mt-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="grid grid-cols-1 gap-6 py-10 first:pt-0 last:pb-0 sm:grid-cols-[9rem_1fr_auto] sm:items-start sm:gap-10"
            >
              <div>
                <dt className="text-base font-semibold text-foreground">{plan.name}</dt>
                <dd className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="font-mono text-xs text-muted-foreground">{plan.period}</span>
                  )}
                </dd>
                {plan.emphasized && (
                  <span className="mt-2 inline-block font-mono text-xs tracking-wide text-primary uppercase">
                    Recommended
                  </span>
                )}
              </div>
              <div>
                <p className="text-base text-pretty text-muted-foreground">{plan.description}</p>
                <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
                  {plan.features.map((item) => (
                    <li key={item} className="text-sm text-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={plan.cta.href}
                className={cn(
                  "rounded-lg px-6 py-3 text-center sm:self-start",
                  plan.emphasized
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground",
                )}
              >
                {plan.cta.label}
              </a>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
