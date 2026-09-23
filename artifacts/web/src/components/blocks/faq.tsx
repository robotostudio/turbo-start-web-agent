import { TextLink } from "@/components/ui/text-link";
import { type FaqProps, faqSchema, parseBlock } from "@/lib/blocks/schemas";
import { FaqMotion } from "./faq-motion";
import { SectionHeader } from "./section-header";

// The redesign's FAQ, drawn in Paper as "faq / redesign": the header in a
// 432px column on the left, held in view while the questions scroll past it,
// and the questions as a ruled, numbered ledger on the right, the way
// FeatureRows numbers its rows.
//
// Each question is a native <details>, not React state, for the reason
// article-toc.tsx gives: it opens and closes with no JavaScript at all, the
// keyboard and screen readers get a real disclosure for free, and every
// answer is in the server HTML whether or not it is open. The first starts
// open, as the comp draws it, so the section never reads as a wall of
// headings with nothing under them. FaqMotion animates the open and close
// once JavaScript has loaded; without it, they are instant.
//
// `data-closing` is FaqMotion's: set on a row while it animates shut, still
// technically open. The number and the mark read it so they switch back the
// moment the click lands rather than when the animation ends.

/** The disclosure mark: a plus while closed, its upright dropped to leave a
 * minus while open. Switched by the <details> element's own open state
 * through CSS, so it needs no script either. */
function DisclosureMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 self-center text-muted-foreground group-open:text-primary group-data-closing:text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <path d="M3 8h10" />
      <path className="group-open:hidden group-data-closing:inline" d="M8 3v10" />
    </svg>
  );
}

export function Faq(raw: FaqProps) {
  const { eyebrow, title, contact, faqs } = parseBlock("Faq", faqSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset flex flex-col gap-12 py-16 lg:flex-row lg:items-start lg:gap-14 lg:py-22">
        {/* Sticky only beside the list, from lg: stacked above it, there is
            nothing for the header to stay alongside. */}
        <div className="lg:sticky lg:top-24 lg:w-108 lg:shrink-0">
          <SectionHeader eyebrow={eyebrow} title={title} />
          {contact && (
            <p className="mt-7 flex flex-wrap items-center gap-x-1.75 text-sm">
              {contact.prompt && <span className="text-muted-foreground">{contact.prompt}</span>}
              <TextLink href={contact.href} label={contact.label} />
            </p>
          )}
        </div>

        <FaqMotion className="min-w-0 flex-1 border-border border-b">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group border-border border-t pb-3"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-baseline gap-5 pt-6 pb-3 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
                {/* The number is the ledger's, not the question's: hidden from
                    assistive tech, which already announces the list order. */}
                <span
                  aria-hidden="true"
                  className="w-5 shrink-0 font-mono text-subtle-foreground text-xs tabular-nums tracking-widest group-open:text-primary group-data-closing:text-subtle-foreground"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-pretty text-foreground text-subtitle">
                  {faq.question}
                </span>
                <DisclosureMark />
              </summary>
              <p className="max-w-170 pb-4 pl-10 sm:pr-9 text-base text-muted-foreground text-pretty leading-6.5">
                {faq.answer}
              </p>
            </details>
          ))}
        </FaqMotion>
      </div>
    </section>
  );
}
