import Image from "next/image";
import { LogoWordmark } from "@/components/blocks/logo-wordmarks";
import { groundAt } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";
import { type FeaturedQuoteProps, featuredQuoteSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

// The comp's "testimonial / 1 — Marked": one quote, set large in a bordered
// panel, with the person at its foot and the company drawn large on a textured
// panel to the right. Built beside Testimonial rather than as a variant of it,
// because the content differs, not just the layout: Testimonial takes three or
// more quotes and has nowhere to put a company.
//
// Measured off the Paper comp (artboard "home", frame "testimonial / 1 —
// Marked"): 88px block padding, a 44px gap under the eyebrow, a 34/46 quote at
// weight 300 (text-title, which carries the same -0.48px tracking, is 36/44),
// a 44px square avatar, and a 406px company panel.
//
// No SectionHeader: it requires a title and this section has none, which is
// the case logo-cloud.tsx already argues through. The eyebrow below is the same
// eight lines LogoCloud carries, tick and 10px gap included.

// The comp fades the company panel's texture in from the left, so it rises out
// of the quote rather than starting on a hard edge. Its stops, against
// --background for the reason groundAt gives in site-mark.tsx.
const COMPANY_FADE = `linear-gradient(in oklab 90deg, ${groundAt(100)} 12.82%, ${groundAt(72)} 71.5%, ${groundAt(0)} 130.18%)`;

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
            <figcaption className="flex items-center gap-3.5">
              {/* grayscale for the comp's luminosity blend: it draws the
                  person in the same neutral register as the rest of the
                  panel, whatever the photo's own colour. */}
              <Image
                alt={person.avatar.alt}
                className="size-11 shrink-0 rounded-md object-cover grayscale"
                height={44}
                src={person.avatar.src}
                width={44}
              />
              <span className="flex flex-col gap-0.75">
                <span className="text-base font-medium text-foreground">{person.name}</span>
                <span className="text-sm text-muted-foreground">{person.role}</span>
              </span>
            </figcaption>
          </div>

          {company && (
            // min-h-84 is the comp's 337px (336, the nearest step): the panel
            // sets the band's height there, not the quote, so a short quote
            // still gets the full textured panel beside it.
            <div className="relative flex h-56 items-center justify-center overflow-hidden xl:h-auto xl:min-h-84 xl:w-101.5 xl:shrink-0">
              {/* Still, not animated: a moving field under a word you are
                  meant to read is the footer's reason for keeping its own
                  texture still, and this Block then ships no client JS. */}
              <div className="absolute inset-0">
                <GridField animate={false} className="size-full opacity-50" preset="dense" />
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ backgroundImage: COMPANY_FADE }}
              />
              {/* Readable, not hidden: the role line usually names the
                  company too, but nothing guarantees it, and a logo carries
                  its own alt. */}
              <div className="relative text-foreground/75">
                {"src" in company ? (
                  // Unoptimized for the reason logo-cloud.tsx gives: company
                  // logos are usually SVG, which next/image will not optimize.
                  <Image
                    alt={company.alt}
                    className="h-8 w-auto"
                    height={32}
                    src={company.src}
                    unoptimized
                    width={160}
                  />
                ) : (
                  <LogoWordmark
                    className="text-2xl font-semibold tracking-tight"
                    mark={company.mark}
                    name={company.name}
                  />
                )}
              </div>
            </div>
          )}
        </figure>
      </div>
    </section>
  );
}
