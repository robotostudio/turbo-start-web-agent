import { type FeatureGridProps, featureGridSchema, parseBlock } from "@/lib/blocks/schemas";
import { LedgerCorners, ledgerFillers } from "./ledger";
import { SectionHeaderSplit } from "./section-header";

// The redesign's feature grid, drawn in Paper as "feature-grid / redesign": a
// ruled ledger of numbered cells under a header whose lede sits opposite the
// title, with LogoCloud's crosshairs on the grid's four corners. Text only, by
// design: the comp's feature-card variants lean on per-card artwork this
// Block's content does not carry.
//
// The rules close the way LogoCloud's do: the container owns the top and left
// edges and every cell its own bottom and right, so no two rules ever stack
// into a line twice as bright.
//
// A list of <h3>s rather than the <dl> this used to be: the filler cells below
// are empty list items hidden from assistive tech, and a <dl> may only hold
// terms and descriptions.

export function FeatureGrid(raw: FeatureGridProps) {
  const { eyebrow, title, lede, features } = parseBlock("FeatureGrid", featureGridSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16 lg:py-22">
        <SectionHeaderSplit eyebrow={eyebrow} lede={lede} title={title} />

        {/* `relative` so the crosshairs can hang off the grid's corners. */}
        <div className="relative mt-14">
          <ul className="grid grid-cols-1 border-ledger-rule border-t border-l md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <li
                className="flex flex-col gap-10 border-ledger-rule border-r border-b px-6 pt-8 pb-9 sm:px-8"
                key={feature.title}
              >
                {/* The number is the ledger's, not the feature's: hidden from
                    assistive tech, which already announces the list order. */}
                <span
                  aria-hidden="true"
                  className="font-mono text-subtle-foreground text-xs tabular-nums tracking-widest"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-balance text-foreground text-subtitle">{feature.title}</h3>
                  <p className="mt-2.5 max-w-90 text-base text-muted-foreground text-pretty leading-6.5">
                    {feature.body}
                  </p>
                </div>
              </li>
            ))}
            {ledgerFillers(features.length, { md: 2, lg: 3 }).map((className, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fillers are identical and positional
              <li aria-hidden="true" className={className} key={`filler-${index}`} />
            ))}
          </ul>
          <LedgerCorners />
        </div>
      </div>
    </section>
  );
}
