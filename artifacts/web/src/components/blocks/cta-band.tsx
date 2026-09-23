import { BED_VIGNETTE, groundAt } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";
import { ButtonLink } from "@/components/ui/button-link";
import { type CtaBandProps, ctaBandSchema, parseBlock } from "@/lib/blocks/schemas";

// The comp's closing band, "cta / 3 — Corner-pinned": the site's texture at
// full bleed, darkened to the page at its edges, with the heading pinned top
// left and the lede and buttons pinned along the bottom. It replaced a centred
// band filled with --primary, outright rather than behind a variant, the way
// the logo marquee went.
//
// Measured off the Paper comp (artboard "home", frame "cta / 3 — Corner-
// pinned"): a 520px band, 56px block padding, a 52/62 heading (--text-
// statement), a 20px lede held to about 436px, and the Hero's button pair.
//
// The comp draws a chevron after "Read the docs". It is left out: the Hero's
// primary button in the same comp has none, and ButtonLink takes no icon, so
// the chevron would be a second primary-button treatment for one call site.

// The two scrims the comp lays across the vignette, both on the same 109.74°
// diagonal: one darkens the top left, where the heading sits, and the other,
// drawn at half strength, the bottom right, behind the buttons. Written against
// --background for the reason groundAt gives in site-mark.tsx.
const HEADING_SCRIM = `linear-gradient(in oklab 109.74deg, ${groundAt(92)} 0%, ${groundAt(55)} 38%, ${groundAt(0)} 62%)`;
const ACTIONS_SCRIM = `linear-gradient(in oklab 109.74deg, ${groundAt(0)} 69%, ${groundAt(55)} 81%, ${groundAt(92)} 100%)`;

export function CtaBand(raw: CtaBandProps) {
  const { title, titleMuted, lede, primary, secondary } = parseBlock("CTA", ctaBandSchema, raw);

  return (
    <section className="relative isolate overflow-hidden font-sans">
      {/* The bed. Animated, unlike the footer's and the feature rows': presets.ts
          names this band and the Hero's as the texture's animated register. No
          pointer, which grid-field.tsx reserves for the one large placement.
          The canvas never mounts for a reduced-motion visitor, who gets the
          same field as a still frame. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <GridField className="size-full opacity-50" preset="dense" />
        <div className="absolute inset-0" style={{ backgroundImage: BED_VIGNETTE }} />
        <div className="absolute inset-0" style={{ backgroundImage: HEADING_SCRIM }} />
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: ACTIONS_SCRIM }} />
      </div>

      {/* Pinned to the corners only from lg, where the band takes the comp's
          fixed 520px. Below that the three pieces stack in reading order, and
          the band grows to fit them instead of pinning them into each other. */}
      <div className="page-inset flex min-h-100 flex-col justify-between gap-12 py-14 lg:h-130">
        {/* text-4xl below lg, the fallback the Hero uses for its display
            heading: 52px is most of a phone's width per word. */}
        <h2 className="text-4xl text-balance text-foreground lg:text-statement">
          <span className="block">{title}</span>
          {titleMuted && <span className="block text-muted-foreground">{titleMuted}</span>}
        </h2>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          {lede && <p className="max-w-md text-xl text-pretty text-muted-foreground">{lede}</p>}
          {/* ml-auto keeps the buttons in the right-hand corner when there is
              no lede to push them there. */}
          <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
            <ButtonLink href={primary.href} label={primary.label} />
            {secondary && (
              <ButtonLink href={secondary.href} label={secondary.label} variant="outline" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
