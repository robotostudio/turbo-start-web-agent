import Link from "next/link";
import { type PricingProps, parseBlock, pricingSchema } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./section-header";

// Podium: a symmetric grid of plan cards where the emphasized plan pokes out
// top and bottom via explicit grid rows, never negative margins. The
// `--spacing()` grid-row-template value is a reviewed, deliberate exception
// to "canonical Tailwind only" — no canonical utility expresses "half a row
// of overhang above and below", and the ratio is load-bearing for the raised
// card effect. Ported from the design-preview exploration; content now comes
// entirely from props instead of shared fixture data.
export function Pricing(raw: PricingProps) {
  const { title, lede, plans } = parseBlock("Pricing", pricingSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <SectionHeader title={title} lede={lede} />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:mt-16 lg:grid-cols-3 lg:grid-rows-[--spacing(6)_1fr_--spacing(6)]">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className={cn(
                "flex flex-col justify-between gap-8 rounded-lg border p-8 lg:row-start-2",
                plan.emphasized ? "border-primary" : "border-border",
                plan.emphasized && "lg:row-span-full",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground">{plan.title}</h3>
                  {plan.emphasized && (
                    <span className="font-mono text-xs tracking-wide text-primary uppercase">
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
                {plan.body && (
                  <p className="mt-4 text-base text-pretty text-muted-foreground">{plan.body}</p>
                )}
                {plan.features && plan.features.length > 0 && (
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
                )}
              </div>
              {plan.cta &&
                (plan.cta.href.startsWith("/") ? (
                  <Link
                    href={plan.cta.href}
                    className={cn(
                      "rounded-lg px-6 py-3 text-center",
                      plan.emphasized
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground",
                    )}
                  >
                    {plan.cta.label}
                  </Link>
                ) : (
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
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
