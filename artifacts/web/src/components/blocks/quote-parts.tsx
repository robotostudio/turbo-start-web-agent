import Image from "next/image";
import { LogoWordmark } from "@/components/blocks/logo-wordmarks";
import { groundAt } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";
import type { CompanyEntry, Person } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

// The pieces a quote is drawn from, shared by FeaturedQuote (one quote, the
// full width) and Testimonial (three or more, in a ledger). Lifted out of
// featured-quote.tsx when Testimonial took the same design, so the two cannot
// drift into two treatments of one idea.
//
// Private to those Blocks: never registered in blockSchemas or
// blockComponents, so it stays out of catalog.json and out of blockCount. Same
// status as SectionHeader.

// The comp fades the company panel's texture in from the left, so it rises out
// of the quote rather than starting on a hard edge. Its stops, against
// --background for the reason groundAt gives in site-mark.tsx.
const COMPANY_FADE = `linear-gradient(in oklab 90deg, ${groundAt(100)} 12.82%, ${groundAt(72)} 71.5%, ${groundAt(0)} 130.18%)`;

/** The quote's text, with `highlight` marked in the accent colour where it
 * first occurs. The schema has already refused a highlight that is not in the
 * quote, so a miss here only happens for a caller that skipped parseBlock, and
 * it degrades to the plain quote rather than throwing at render. */
export function QuoteText({ quote, highlight }: { quote: string; highlight?: string }) {
  const at = highlight ? quote.indexOf(highlight) : -1;
  if (!highlight || at === -1) return <>{quote}</>;

  return (
    <>
      {quote.slice(0, at)}
      {/* Dark text on the accent, as the comp draws it: --primary-foreground
          is already that near-black, chosen for contrast on --primary.
          box-decoration-clone pads every line of a phrase that wraps, not
          only its first and last. */}
      <mark className="rounded-xs bg-primary box-decoration-clone px-1 text-primary-foreground">
        {highlight}
      </mark>
      {quote.slice(at + highlight.length)}
    </>
  );
}

/** Who said it: a 44px square photo, the name, the role. */
export function QuoteAttribution({ person }: { person: Person }) {
  return (
    <figcaption className="flex items-center gap-3.5">
      {/* grayscale for the comp's luminosity blend: it draws the person in the
          same neutral register as the rest of the panel, whatever the photo's
          own colour. */}
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
  );
}

/** The company, drawn large on a still texture that fades in from the left.
 * The caller gives it a size through `className`: a 406px column beside
 * FeaturedQuote's quote, a short strip at the foot of a Testimonial cell. */
export function CompanyPanel({
  company,
  className,
}: {
  company: CompanyEntry;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden", className)}>
      {/* Still, not animated: a moving field under a word you are meant to
          read is the footer's reason for keeping its own texture still, and
          neither Block then ships client JS. */}
      <div className="absolute inset-0">
        <GridField animate={false} className="size-full opacity-50" preset="dense" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: COMPANY_FADE }}
      />
      {/* Readable, not hidden: the role line usually names the company too,
          but nothing guarantees it, and a logo carries its own alt. */}
      <div className="relative text-foreground/75">
        {"src" in company ? (
          // Unoptimized for the reason logo-cloud.tsx gives: company logos are
          // usually SVG, which next/image will not optimize.
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
  );
}

/** One quote given the whole width: the quote and the person on the left, the
 * company on a textured panel to the right. FeaturedQuote is this and an
 * eyebrow; Testimonial draws it above its ledger when given `featured`. */
export function FeaturedFigure({
  quote,
  highlight,
  person,
  company,
  className,
}: {
  quote: string;
  highlight?: string;
  person: Person;
  company?: CompanyEntry;
  className?: string;
}) {
  return (
    // A figure, so the quote and the person it belongs to are one thing to
    // assistive tech rather than a paragraph followed by a name. Side by side
    // only from xl. At lg the 406px panel took nearly half of a 928px inset
    // and set the quote six lines deep in a column four words wide; stacked,
    // the quote gets the whole measure.
    //
    // A border, not an outline. An outline sits a pixel outside the box, so
    // above Testimonial's ledger (whose rules are borders, inside theirs) the
    // two edges missed by a pixel each side; pulling the outline in with a
    // negative offset put it under the company panel, which painted over it.
    // A border is inside the box and under nothing.
    <figure className={cn("flex flex-col border border-border xl:flex-row", className)}>
      <div className="flex flex-1 flex-col justify-between gap-12 px-6 py-8 sm:px-12 xl:pt-11 xl:pr-14 xl:pb-10 xl:pl-12">
        {/* 24px on a phone, where 36px set a quote this long nine lines deep,
            and the comp's size from sm. The comp breaks the lines by hand;
            this lets them wrap under a measure instead, since the copy is an
            author's and its line breaks cannot be. */}
        <blockquote>
          <p className="max-w-3xl text-2xl font-light text-pretty text-foreground sm:text-title">
            <QuoteText highlight={highlight} quote={quote} />
          </p>
        </blockquote>
        <QuoteAttribution person={person} />
      </div>

      {company && (
        // min-h-84 is the comp's 337px (336, the nearest step): the panel sets
        // the band's height there, not the quote, so a short quote still gets
        // the full textured panel beside it.
        <CompanyPanel
          className="h-56 xl:h-auto xl:min-h-84 xl:w-101.5 xl:shrink-0"
          company={company}
        />
      )}
    </figure>
  );
}
