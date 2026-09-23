import { parseBlock, type TestimonialProps, testimonialSchema } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";
import { CompanyPanel, FeaturedFigure, QuoteAttribution, QuoteText } from "./quote-parts";
import { SectionHeader } from "./section-header";

// Three or more quotes, each drawn the way FeaturedQuote draws its one: a light
// quote, a square greyscale photo, and the company on a textured strip. The
// parts come from quote-parts.tsx, so the two Blocks are one design at two
// widths rather than two designs.
//
// The quote is the subtitle role at FeaturedQuote's weight, not its size: 36px
// in a third of the page runs a quote ten lines deep.
export function Testimonial(raw: TestimonialProps) {
  const { eyebrow, title, featured, testimonials } = parseBlock(
    "Testimonial",
    testimonialSchema,
    raw,
  );

  return (
    <section className="font-sans">
      <div className="page-inset py-16 lg:py-22">
        <SectionHeader eyebrow={eyebrow} title={title} />

        {/* The lead quote, FeaturedQuote's panel, sitting directly on the
            ledger: the two read as one set of endorsements. */}
        {featured && (
          <FeaturedFigure
            // A border, where FeaturedQuote draws an outline: inside the box,
            // so its edge lands on the ledger's rules below. See FeaturedFigure.
            className="mt-11 border border-border"
            company={featured.company}
            highlight={featured.highlight}
            person={featured.person}
            quote={featured.quote}
          />
        )}

        {/* The ledger arrangement Stats and LogoCloud use: the top and left
            rules belong to the list, every other rule is a cell's own right
            and bottom, so no two ever stack into a doubled line.

            One column on a phone, two on a tablet, three from lg. Two columns
            leave an odd count's last quote alone on its row, with the ledger's
            right-hand rule missing beside it, so between md and lg that quote
            takes both columns and the ledger stays closed. max-lg keeps the
            span from leaking into the three-column row, where a pseudo-class
            selector would otherwise outrank a plain lg:col-span-1. */}
        <ul
          className={cn(
            "grid grid-cols-1 border-border border-l md:grid-cols-2 lg:grid-cols-3",
            // Flush under the featured panel, sharing its bottom edge as the
            // ledger's top rule; a top border of its own would stack on that
            // one into a doubled line. Without a featured quote the ledger
            // opens a step under the header and draws its own.
            featured ? undefined : "mt-12 border-t",
          )}
        >
          {testimonials.map((testimonial) => (
            <li
              className="flex flex-col border-border border-r border-b md:max-lg:odd:last:col-span-2"
              // Name and quote together: nothing in the schema makes a name
              // unique, and one person can be quoted twice.
              key={`${testimonial.person.name}-${testimonial.quote}`}
            >
              {/* The quote column is the figure, so the attribution's
                  figcaption is its last child and captions the quote. */}
              <figure className="flex flex-1 flex-col justify-between gap-10 px-6 py-8 sm:px-8">
                <blockquote>
                  <p className="text-subtitle font-light text-pretty text-foreground">
                    <QuoteText highlight={testimonial.highlight} quote={testimonial.quote} />
                  </p>
                </blockquote>
                <QuoteAttribution person={testimonial.person} />
              </figure>
              {/* At the foot, under its own rule. Grid rows stretch, so a cell
                  with no company still ends level with one that has. */}
              {testimonial.company && (
                <CompanyPanel
                  className="h-24 border-border border-t"
                  company={testimonial.company}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
