import { GridField } from "@/components/texture/grid-field";
import { cn } from "@/lib/utils";

// The three illustrations beside FeatureRows' three rows, plus the textured bed
// they all sit on.
//
// FIXED ARTWORK, NOT CONTENT. Nothing here is authorable, and the row's index
// is what picks a drawing. That is the LogoCloud precedent, whose wordmarks are
// "fixed artwork from the design, not a list you supply": the comp draws three
// specific pictures of software -- a content file listing its Blocks, a branch
// merging into main, a file of design tokens -- and each one only means anything
// beside the copy it was drawn for. `featureRowsCount` is what keeps a fourth
// row from arriving with no picture to show.
//
// Markup and SVG rather than three exported bitmaps, for the reason
// hero-prompt-card.tsx gives for the Hero's card: built from tokens it rethemes
// with the site and stays sharp at any density. The token panel in row 3 is the
// strongest case for it -- its four swatches ARE --primary, --background,
// --foreground and --border, so a client re-theming the site repaints the
// picture that is describing the re-theme.
//
// A private part of FeatureRows, not a Block: never registered in blockSchemas
// or blockComponents, so it stays out of catalog.json and out of blockCount.
// Same status as SectionHeader, GridField and HeroPromptCard.
//
// Measured off the Paper comp (page Desktop, artboard "feature-cards / 2 --
// Rows"): a 290px bed, a 319px file panel, a 261px token panel, and the graph's
// own 900x290 coordinate space. The four tones no existing token matched are
// --mock-* in globals.css; everything else here is a system token already.

/** The rows of the file listing in row 1. Not placeholders: these are the first
 * five Blocks actually composed into content/pages/home.mdx, in that order, and
 * the selected row is this Block drawing itself. The comp listed `FeatureGrid`
 * third, which stopped being true the moment FeatureRows took its place on the
 * home page -- a picture captioned `home.mdx` that lists a Block the file does
 * not contain is the kind of thing every gate here passes and no reader
 * forgives. If the home page's opening sections are reordered, reorder these.
 *
 * This is also why it is not read from the content collection at render: the
 * Block is composed into the gallery too, where a listing of home.mdx's Blocks
 * would be describing a different page than the one it sits on. */
const CONTENT_FILE = "home.mdx";
const CONTENT_FILE_BLOCKS = ["Hero", "LogoCloud", "FeatureRows", "FeatureSplit", "Stats"] as const;
/** Which of those rows is drawn selected. Position, not a name match, so the
 * highlight cannot silently move if the list above is edited. */
const SELECTED_BLOCK_ROW = 2;

/** The token file in row 3, as swatch plus name. The colours are the site's own
 * tokens rather than the comp's measured hex, which is the whole point of the
 * drawing: rebrand the site and this picture rebrands with it. */
const TOKEN_SWATCHES = [
  { className: "bg-primary", name: "--primary" },
  // The only swatch that needs help to be seen, because it is the page's own
  // ground colour sitting on a panel barely lighter than itself. --input is the
  // token for a border that has to read on a control, which is the same job.
  { className: "bg-background outline outline-input", name: "--background" },
  { className: "bg-foreground", name: "--foreground" },
  { className: "bg-border", name: "--border" },
] as const;

/** Row 1: a content file listing the Blocks composed into it, one of them
 * selected. */
function ContentFilePanel() {
  return (
    <div className="w-full max-w-80 rounded-md bg-linear-to-b from-card to-background shadow-(--shadow-prompt-card) outline outline-mock-edge">
      <div className="border-mock-rule border-b px-4 py-3">
        <span className="font-mono text-xs tracking-wide text-muted-foreground">
          {CONTENT_FILE}
        </span>
      </div>
      <ul className="py-2">
        {CONTENT_FILE_BLOCKS.map((block, index) =>
          index === SELECTED_BLOCK_ROW ? (
            <li
              className="flex items-center gap-3.5 border-primary border-l-2 bg-primary/10 py-2.25 pr-4 pl-3.5"
              key={block}
            >
              <span className="w-4.5 shrink-0 font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-sm text-foreground">{block}</span>
            </li>
          ) : (
            <li className="flex items-center gap-3.5 px-4 py-2.25" key={block}>
              <span className="w-4.5 shrink-0 font-mono text-xs text-subtle-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-sm text-mock-text">{block}</span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

/** Row 2: a branch leaving main, carrying one change, and merging back.
 *
 * One SVG rather than markup, because it is a drawing and not a panel: the
 * curve, the nodes and the chip all have to keep their positions relative to
 * each other at any width, which is exactly what a viewBox does. */
function CommitGraph() {
  return (
    // The viewBox is cropped to the drawing's own bounds rather than the comp's
    // 900x290 frame, so `meet` has no dead margin to fit. Because the drawing is
    // wider than any bed it lands in, `meet` is always width-limited: main's
    // trunk spans the bed edge to edge at every width and only the vertical
    // shrinks, which is why nothing here is ever cropped or overflows. `slice`
    // was the other option and it dropped the `main` label off the left edge
    // below about 1400px.
    <svg
      aria-hidden="true"
      className="size-full"
      preserveAspectRatio="xMidYMid meet"
      viewBox="45 34 830 190"
    >
      {/* main itself. A hairline, so it reads as the ground the nodes sit on
          rather than as a second branch competing with the accent one. */}
      <path className="stroke-border" d="M0 176H900" fill="none" />
      <path
        className="stroke-primary"
        d="M270 176C300 176 300 92 330 92H440C470 92 470 176 500 176"
        fill="none"
        strokeLinecap="round"
        strokeWidth="2"
      />

      {/* Commits before and after, drawn inert. */}
      <circle className="fill-mock-node" cx="70" cy="176" r="5.5" />
      <circle className="fill-mock-node" cx="170" cy="176" r="5.5" />
      <circle className="fill-mock-node" cx="620" cy="176" r="5.5" />
      <circle className="fill-mock-node" cx="740" cy="176" r="5.5" />
      <circle className="fill-mock-node" cx="860" cy="176" r="5.5" />
      {/* Where the branch leaves: one step brighter than the inert nodes, so
          the eye starts at the fork rather than at the left edge. */}
      <circle className="fill-subtle-foreground" cx="270" cy="176" r="5.5" />

      <circle className="fill-primary" cx="330" cy="92" r="6" />
      <circle className="fill-primary" cx="440" cy="92" r="6" />
      {/* The merge, with a halo, is the one place the eye is meant to land. */}
      <circle className="fill-primary" cx="500" cy="176" r="8.5" />
      <circle
        className="stroke-primary/40"
        cx="500"
        cy="176"
        fill="none"
        r="15"
        strokeWidth="1.5"
      />

      {/* The change the branch is carrying. A flat card rather than the comp's
          gradient: at this size a two-stop gradient across 33px is a solid
          fill with extra markup. */}
      <rect className="fill-card stroke-mock-edge" height="33" rx="7" width="170" x="354" y="44" />
      <text className="fill-primary font-mono text-xs" x="362" y="65">
        +
      </text>
      <text className="fill-foreground font-mono text-xs" x="379" y="65">
        Title: &quot;ship today&quot;
      </text>

      <text
        className="fill-subtle-foreground font-mono text-xs tracking-widest"
        textAnchor="middle"
        x="70"
        y="212"
      >
        main
      </text>
      <text
        className="fill-muted-foreground font-mono text-xs tracking-widest"
        textAnchor="middle"
        x="500"
        y="212"
      >
        merged
      </text>
    </svg>
  );
}

/** Row 3: the file of design tokens a rebrand edits. */
function TokenPanel() {
  return (
    <div className="w-full max-w-65 overflow-hidden rounded-md bg-linear-to-b from-card to-background shadow-(--shadow-prompt-card) outline outline-mock-edge">
      <div className="border-mock-rule border-b px-3 py-2.25">
        <span className="font-mono text-xs text-muted-foreground">tokens.css</span>
      </div>
      <ul className="flex flex-col gap-2 px-3 py-2.5">
        {TOKEN_SWATCHES.map((swatch, index) => (
          <li className="flex items-center gap-2.25" key={swatch.name}>
            <span className={cn("size-2.75 shrink-0 rounded-xs", swatch.className)} />
            {/* The accent is the one a client actually changes, so it is the one
                row set at full strength. */}
            <span
              className={cn(
                "font-mono text-xs",
                index === 0 ? "text-mock-text" : "text-muted-foreground",
              )}
            >
              {swatch.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Indexed by row position, which is what makes `featureRowsCount` load-bearing
 * in the schema: a fourth row would land past the end of this array. */
const rowDrawings = [ContentFilePanel, CommitGraph, TokenPanel];

export function FeatureRowArt({ index }: { index: number }) {
  const Drawing = rowDrawings[index];
  if (!Drawing) return null;

  return (
    // Decorative throughout: every one of these pictures illustrates something
    // the row's own title and body already say, so there is nothing here for a
    // screen reader to gain by announcing it.
    //
    // `animate={false}`, unlike the Hero's band: grid-field.tsx notes the
    // animated layer "suits one large placement and reads as a gimmick on six",
    // and this Block alone would add three. It also keeps the whole Block free
    // of client JavaScript.
    <div
      aria-hidden="true"
      className="relative flex h-72 w-full items-center justify-center overflow-hidden lg:min-w-0 lg:flex-1"
    >
      <div className="absolute inset-0">
        <GridField animate={false} className="size-full opacity-30" preset="dense" />
      </div>

      {/* The comp's four edge fades, as fractions of the bed rather than the
          170px and 150px it measures, so the falloff stays proportional at a
          width the 1440 artboard never had (170/896 is a fifth, 150/896 a
          sixth, and each vertical fade is half the height). They sit over the
          texture and under the drawing, so they quieten the field without
          touching the picture on it -- the comp stacks its bottom fade over the
          graph instead, which dims the lower half of that artwork too.

          Two of the four are NOT what they look like in the comp's export, and
          both cost a re-read to get right:

          The left fade is drawn TWICE there, the second copy at 50%, so the
          single gradient it looks like is far too weak. Stacking two of the
          comp's ramps gives a combined alpha of 1.5g - 0.5g², which reaches
          half strength at 67% of the way across; one ramp held solid for its
          first 35% lands in the same place, which is what this is.

          The bottom fade is a CHILD of the 0.4-opacity texture layer in the
          comp, not a sibling of it, so its 95% never lands at 95% -- it peaks
          at 0.4 x 0.95, and the bed is nearly as bright at its bottom edge as
          it is in the middle. Read as a sibling it produces a heavy vignette
          the design does not have. */}
      <div className="absolute inset-y-0 left-0 w-1/5 bg-linear-to-r from-background from-35% to-transparent" />
      <div className="absolute inset-y-0 right-0 w-1/6 bg-linear-to-l from-background to-transparent" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-background/95 from-14% to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-background/40 from-14% to-transparent" />

      {/* px-6 keeps a panel off the bed's own edges once the row stacks and
          the bed narrows to the page inset: without it the 320px file panel
          sits flush against a 327px bed and the texture reads as a border
          rather than as something the drawing is resting on. */}
      <div className="relative flex size-full items-center justify-center px-6">
        <Drawing />
      </div>
    </div>
  );
}
