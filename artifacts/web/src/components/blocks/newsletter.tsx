import { groundAt } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";
import { buttonVariants } from "@/components/ui/button-variants";
import { type NewsletterProps, newsletterSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

// The comp's centred band, "cta / 2 — Centered": the site's texture at full
// bleed, darkened under the text, with the eyebrow, title and lede stacked on
// the centre line. The comp ends in two buttons; here the email field and
// Subscribe take their place, since this band's job is the form.
//
// Measured off the Paper comp: a 420px band, a 46px title (the statement role,
// 52px, rather than a third size between it and the title role), a 16px lede
// held to 520px, and 70px fades into the page above and below.

// The comp's vignette: darkest under the text, opening out at the rim, where
// the texture shows. Written against --background for the reason groundAt
// gives in site-mark.tsx.
const CENTRE_VIGNETTE = `radial-gradient(ellipse 56% 78% at 50% 50% in oklab, ${groundAt(100)} 0%, ${groundAt(90)} 45%, ${groundAt(20)} 100%)`;

export function Newsletter(raw: NewsletterProps) {
  const { eyebrow, title, lede, action, buttonLabel } = parseBlock(
    "Newsletter",
    newsletterSchema,
    raw,
  );

  return (
    <section className="relative isolate overflow-hidden font-sans">
      {/* The bed. Still, unlike the CTA band's: presets.ts keeps the animated
          register to the Hero and the CTA, and this band sits near the CTA. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <GridField animate={false} className="size-full opacity-55" band preset="dense" />
        <div className="absolute inset-0" style={{ backgroundImage: CENTRE_VIGNETTE }} />
        <div className="absolute inset-x-0 top-0 h-17.5 bg-linear-to-b from-background to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-17.5 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="page-inset flex min-h-105 flex-col items-center justify-center py-20 text-center">
        {eyebrow && (
          <p className="flex items-center gap-2.5">
            {/* The 4x10 accent tick, same mark SectionHeader draws. */}
            <span aria-hidden="true" className="h-2.5 w-1 shrink-0 rounded-full bg-primary" />
            <span className="font-mono text-eyebrow text-muted-foreground uppercase">
              {eyebrow}
            </span>
          </p>
        )}
        {/* Centred, so it does not use SectionHeader and carries the title
            role by hand, stepping up to the statement role from lg as the
            CTA band's heading does. */}
        <h2
          className={cn(
            "max-w-4xl text-3xl text-balance text-foreground sm:text-title lg:text-statement",
            eyebrow && "mt-5",
          )}
        >
          {title}
        </h2>
        {lede && (
          <p className="mt-4 max-w-130 text-balance text-base text-muted-foreground">{lede}</p>
        )}
        <form
          action={action}
          className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          method="post"
        >
          {/* A pill, the height of the button beside it, so the pair reads
              as the comp's two pill buttons. */}
          <input
            aria-label="Email address"
            className="h-11 min-w-0 rounded-full bg-background/70 px-5 text-base text-foreground outline outline-input placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary sm:flex-1"
            name="email"
            placeholder="you@company.com"
            required
            type="email"
          />
          {/* The one button on the site that is genuinely a button rather
              than a link, so it takes the classes directly instead of going
              through ButtonLink. */}
          <button className={cn("shrink-0", buttonVariants({ size: "marketing" }))} type="submit">
            {buttonLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
