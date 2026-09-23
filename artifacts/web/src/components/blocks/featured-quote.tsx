import { type FeaturedQuoteProps, featuredQuoteSchema, parseBlock } from "@/lib/blocks/schemas";
import { FeaturedFigure } from "./quote-parts";

// The comp's "testimonial / 1 — Marked": one quote, set large in a bordered
// panel, with the person at its foot and the company drawn large on a textured
// panel to the right. Built beside Testimonial rather than as a variant of it,
// because the content differs, not just the layout: Testimonial takes three or
// more quotes, each given a third of the width, where this gives one quote all
// of it.
//
// Measured off the Paper comp (artboard "home", frame "testimonial / 1 —
// Marked"): 88px block padding, a 44px gap under the eyebrow, a 34/46 quote at
// weight 300 (text-title, which carries the same -0.48px tracking, is 36/44),
// a 44px square avatar, and a 406px company panel.
//
// No SectionHeader: it requires a title and this section has none, which is
// the case logo-cloud.tsx already argues through. The eyebrow below is the same
// eight lines LogoCloud carries, tick and 10px gap included.
//
// The figure itself lives in quote-parts.tsx, shared with Testimonial, which
// can draw it above its ledger and draws its parts three times over.

export function FeaturedQuote(raw: FeaturedQuoteProps) {
  const { eyebrow, quote, person, company } = parseBlock("FeaturedQuote", featuredQuoteSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16 lg:py-22">
        {eyebrow && (
          <p className="flex items-center gap-2.5">
            {/* The 4x10 accent tick. Decorative: the label beside it carries
                the meaning. */}
            <span aria-hidden="true" className="h-2.5 w-1 shrink-0 rounded-full bg-primary" />
            <span className="font-mono text-eyebrow text-muted-foreground uppercase">
              {eyebrow}
            </span>
          </p>
        )}

        <FeaturedFigure
          className={eyebrow ? "mt-11" : undefined}
          company={company}
          person={person}
          quote={quote}
        />
      </div>
    </section>
  );
}
