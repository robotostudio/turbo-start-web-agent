import { parseBlock, type TestimonialProps, testimonialSchema } from "@/lib/blocks/schemas";
import { CompanyPanel, QuoteAttribution, QuoteText } from "./quote-parts";
import { SectionHeader } from "./section-header";

// Three or more quotes, each drawn the way FeaturedQuote draws its one: a light
// quote, a square greyscale photo, and the company on a textured strip. The
// parts come from quote-parts.tsx, so the two Blocks are one design at two
// widths rather than two designs.
//
// The quote is the subtitle role at FeaturedQuote's weight, not its size: 36px
// in a third of the page runs a quote ten lines deep.
export function Testimonial(raw: TestimonialProps) {
  const { eyebrow, title, testimonials } = parseBlock("Testimonial", testimonialSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16 lg:py-22">
        <SectionHeader eyebrow={eyebrow} title={title} />

        {/* The ledger arrangement Stats and LogoCloud use: the top and left
            rules belong to the list, every other rule is a cell's own right
            and bottom, so no two ever stack into a doubled line, and any
            count closes at one column or three. */}
        <ul className="mt-12 grid grid-cols-1 border-border border-t border-l lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <li
              className="flex flex-col border-border border-r border-b"
              // Name and quote together: nothing in the schema makes a name
              // unique, and one person can be quoted twice.
              key={`${testimonial.person.name}-${testimonial.quote}`}
            >
              <figure className="flex flex-1 flex-col">
                <div className="flex flex-1 flex-col justify-between gap-10 px-6 py-8 sm:px-8">
                  <blockquote>
                    <p className="text-subtitle font-light text-pretty text-foreground">
                      <QuoteText highlight={testimonial.highlight} quote={testimonial.quote} />
                    </p>
                  </blockquote>
                  <QuoteAttribution person={testimonial.person} />
                </div>
                {/* At the foot, under its own rule. Grid rows stretch, so a
                    cell with no company still ends level with one that has. */}
                {testimonial.company && (
                  <CompanyPanel
                    className="h-24 border-border border-t"
                    company={testimonial.company}
                  />
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
