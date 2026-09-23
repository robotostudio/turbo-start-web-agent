import { type FeaturedQuoteProps, featuredQuoteSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";
import { CompanyPanel, QuoteAttribution } from "./quote-parts";

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
// The attribution and the company panel live in quote-parts.tsx, shared with
// Testimonial, which draws the same quote three times over.

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

        {/* A figure, so the quote and the person it belongs to are one thing
            to assistive tech rather than a paragraph followed by a name.
            Side by side only from xl. At lg the 406px panel took nearly half
            of a 928px inset and set the quote six lines deep in a column four
            words wide; stacked, the quote gets the whole measure. */}
        <figure
          className={cn("flex flex-col outline outline-border xl:flex-row", eyebrow && "mt-11")}
        >
          <div className="flex flex-1 flex-col justify-between gap-12 px-6 py-8 sm:px-12 xl:pt-11 xl:pr-14 xl:pb-10 xl:pl-12">
            {/* 24px on a phone, where 36px set a quote this long nine lines
                deep, and the comp's size from sm. The comp breaks the lines by
                hand; this lets them wrap under a measure instead, since the copy
                is an author's and its line breaks cannot be. */}
            <blockquote>
              <p className="max-w-3xl text-2xl font-light text-pretty text-foreground sm:text-title">
                {quote}
              </p>
            </blockquote>
            <QuoteAttribution person={person} />
          </div>

          {company && (
            // min-h-84 is the comp's 337px (336, the nearest step): the panel
            // sets the band's height there, not the quote, so a short quote
            // still gets the full textured panel beside it.
            <CompanyPanel
              className="h-56 xl:h-auto xl:min-h-84 xl:w-101.5 xl:shrink-0"
              company={company}
            />
          )}
        </figure>
      </div>
    </section>
  );
}
