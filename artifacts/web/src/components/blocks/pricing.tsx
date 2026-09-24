import { ButtonLink } from "@/components/ui/button-link";
import { type PricingProps, parseBlock, pricingSchema } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";
import { LedgerCorners } from "./ledger";
import { CheckMark } from "./ledger-marks";
import { SectionHeaderSplit } from "./section-header";

// The redesign's pricing, drawn in Paper as "pricing / redesign" (and its 375
// frame): the plans side by side in one ruled ledger rather than as floating
// cards, stacked on a phone. It replaced a podium of rounded, bordered cards,
// and with it the one arbitrary grid template the Blocks carried.
//
// The emphasized plan takes Comparison's treatment for the recommended
// column: a lifted `foreground/3` panel under a brand-coloured rule, pink
// checks, and the primary button. Every other plan is plain, with muted
// checks and outline buttons, so the choice reads at a glance.

// One column per plan from lg, up to four; more than four wraps.
const COLUMNS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
};

export function Pricing(raw: PricingProps) {
  const { eyebrow, title, lede, plans } = parseBlock("Pricing", pricingSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16 lg:py-22">
        <SectionHeaderSplit eyebrow={eyebrow} lede={lede} title={title} />
        <div className="relative mt-14">
          <ul
            className={cn(
              "grid grid-cols-1 border-ledger-rule border-t border-l",
              COLUMNS[plans.length] ?? "lg:grid-cols-4",
            )}
          >
            {plans.map((plan) => (
              <li
                className={cn(
                  "relative flex flex-col justify-between gap-10 border-ledger-rule border-r border-b p-6 sm:p-8",
                  plan.emphasized && "bg-foreground/3",
                )}
                key={plan.title}
              >
                {plan.emphasized && (
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                )}
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-foreground text-subtitle">{plan.title}</h3>
                    {plan.emphasized && (
                      <span className="font-mono text-eyebrow text-primary uppercase">Popular</span>
                    )}
                  </div>
                  <p className="flex flex-wrap items-baseline gap-x-2.5 pt-7">
                    <span className="font-light text-foreground text-stat tabular-nums">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="font-mono text-eyebrow text-subtle-foreground uppercase">
                        {plan.period}
                      </span>
                    )}
                  </p>
                  {plan.body && (
                    <p className="pt-3 text-base text-muted-foreground text-pretty leading-6.5">
                      {plan.body}
                    </p>
                  )}
                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-7 border-border border-b">
                      {plan.features.map((item) => (
                        <li
                          className="flex items-center gap-3 border-border border-t py-3"
                          key={item}
                        >
                          <CheckMark
                            className={cn(
                              "size-3.5 shrink-0",
                              plan.emphasized ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                          <span className="text-base text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {plan.cta && (
                  <ButtonLink
                    className="w-full"
                    href={plan.cta.href}
                    label={plan.cta.label}
                    variant={plan.emphasized ? "default" : "outline"}
                  />
                )}
              </li>
            ))}
          </ul>
          <LedgerCorners />
        </div>
      </div>
    </section>
  );
}
