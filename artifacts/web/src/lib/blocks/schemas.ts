import { z } from "zod";
import { isSafeUrl } from "../content/remark-content-lockdown.ts";

// One Block = one schema here + one component + one registry entry. Variants
// are z.enum([...]).default(...), so this file shows an author every allowed
// value and its default.

// The lockdown's URL check is a NAME heuristic (href, src, url, to, cite,
// ping, srcset, or any name ending url/href/src) — a prop named something
// outside that list gets no check from it at all. This is the second,
// independent gate: Zod checks every href here regardless of what the prop
// is named. `.refine()` predicates are silently dropped by z.toJSONSchema(),
// so the rule is restated in `.describe()`, which does survive conversion —
// without it the generated catalog would tell an authoring agent that `href`
// is a bare string, inviting exactly the unsafe value this refine rejects.
export const URL_RULE = "Must be an http(s), mailto, tel, or relative URL.";

/** The ONLY sanctioned way to declare a URL prop. The .refine() enforces the
 * rule at build time; the .describe() is what carries it into catalog.json,
 * because z.toJSONSchema() silently drops refinements. Never hand-write this
 * pairing — a bare .refine() validates correctly and documents nothing. */
export const safeUrl = () =>
  z.string().min(1, "must not be blank").refine(isSafeUrl, URL_RULE).describe(URL_RULE);

export const link = z.object({
  label: z.string(),
  href: safeUrl(),
});

// The hosts next.config.mjs's images.remotePatterns actually allows, plus any
// *.public.blob.vercel-storage.com subdomain. A media src outside this list
// passes the catalog and this schema today only because safeUrl() is a
// generic href check — but next/image throws at RENDER for a host it isn't
// configured for, so a wrong host used to reach production as a broken page
// instead of a build failure. Keep this in step with next.config.mjs by
// hand; there's no single source both a Next config and this script can
// share without importing one into the other's runtime.
const MEDIA_EXACT_HOSTS = ["images.unsplash.com", "assets.ui.sh"];
const MEDIA_HOST_SUFFIX = ".public.blob.vercel-storage.com";

function isAllowedMediaHost(hostname: string): boolean {
  return MEDIA_EXACT_HOSTS.includes(hostname) || hostname.endsWith(MEDIA_HOST_SUFFIX);
}

function isAllowedMediaSrc(src: string): boolean {
  if (src.startsWith("/")) return true; // served from /public, always allowed
  try {
    const url = new URL(src);
    return url.protocol === "https:" && isAllowedMediaHost(url.hostname);
  } catch {
    return false;
  }
}

export const MEDIA_SRC_RULE =
  "Must be a relative path served from /public, or an https URL on images.unsplash.com, assets.ui.sh, or a *.public.blob.vercel-storage.com subdomain — the hosts next.config.mjs images.remotePatterns allows.";

/** The ONLY sanctioned way to declare an image src prop. Deliberately
 * stricter than safeUrl(): every media prop renders through next/image,
 * which fails at request time for a host outside remotePatterns, so — unlike
 * a link href — an arbitrary https URL is not actually safe here. Same
 * .refine()/.describe() pairing as safeUrl() and for the same reason:
 * z.toJSONSchema() silently drops refinements, so the rule is restated in
 * .describe() to reach the catalog at all. */
export const mediaSrc = () =>
  z
    .string()
    .min(1, "must not be blank")
    .refine(isAllowedMediaSrc, MEDIA_SRC_RULE)
    .describe(MEDIA_SRC_RULE);

/** A single image: a validated URL plus its alt text. `alt` defaults to ""
 * (decorative) rather than being required, matching the purely-visual images
 * ported from the design-preview sources this Block family draws on. */
export const media = z.object({
  src: mediaSrc(),
  alt: z.string().default(""),
});

/** A named individual: display name, role/title, and a photo. Deliberately
 * carries no `href` — Team (the first Block to use this) is a settled
 * decision to have no per-member link, since no team member is a link and
 * there are no bio pages, so any other Block reusing `person` inherits the
 * same no-link shape rather than each reinventing it. */
export const person = z.object({
  name: z.string(),
  role: z.string(),
  avatar: media,
});
export type Person = z.infer<typeof person>;

/** One run of the prompt shown in the Hero's floating card. Plain text by
 * default; supplying `icon` turns the run into a chip, which is how the comp
 * marks out the things an agent would act on (a section, a design file, a
 * repository). */
export const promptSegment = z.object({
  text: z.string(),
  icon: mediaSrc().optional(),
});
export type PromptSegment = z.infer<typeof promptSegment>;

export const heroSchema = z
  .object({
    variant: z.enum(["showcase", "centered", "left"]).default("showcase"),
    /** Optional because the home comp's hero leads on the lede and carries no
     * headline at all, while the interior variants always want one. Rendered
     * whenever it is supplied, in every variant. */
    title: z.string().optional(),
    lede: z.string().optional(),
    primary: link.optional(),
    secondary: link.optional(),
    /** `showcase` only: the prompt inside the card floating over the textured
     * band, as a run of segments. The card is markup rather than an exported
     * image, so its copy is content like any other and stays editable here. */
    prompt: z.array(promptSegment).optional(),
    /** `showcase` only: the model named in the card's toolbar. */
    model: z.string().default("Claude Opus 5"),
    /** `showcase` only: the marks beside `agentsLabel`. Reuses `media`, so a
     * relative path served from /public validates without touching
     * next.config.mjs — `{ src: "/agents/claude.svg", alt: "Claude" }`. */
    agents: z.array(media).optional(),
    agentsLabel: z.string().default("Edit with agents"),
  })
  .describe(
    "The page-opening section: an optional headline, a supporting line, and up to two calls to action. Use once per page, at the top. `showcase` (the default) is the home-page treatment: the copy and calls to action sit above a full-bleed textured band carrying a floating card that shows an agent mid-instruction, so it wants `prompt` and `agents` supplied. `centered` and `left` are the plain interior-page treatments, which ignore `prompt`, `model`, `agents` and `agentsLabel`.",
  );
export type HeroProps = z.input<typeof heroSchema>;

export const bannerSchema = z
  .object({
    message: z.string(),
    link: link.optional(),
  })
  .describe(
    "An in-page, full-bleed, brand-colored callout strip carrying one short message and an optional link — placed wherever it earns attention within a page's own content, like any other Block. NOT the site-wide announcement bar: this Block is composed into page content, so it can never render above the header. For a single notice shown above the header on every page (a launch, an incident, a promotion), edit content/settings/announcement.yml instead — see src/components/site/announcement-bar.tsx.",
  );
export type BannerProps = z.input<typeof bannerSchema>;

export const ctaBandSchema = z
  .object({
    title: z.string(),
    /** A second line of the same heading, set in the muted tone. Part of the
     * one `<h2>`, not a separate element, so it is read as a single heading:
     * the comp's "Compose pages from Blocks." / "The build is the gate." */
    titleMuted: z.string().optional(),
    lede: z.string().optional(),
    primary: link,
    secondary: link.optional(),
  })
  .describe(
    "A full-bleed closing band on the site's dark animated texture, with its content pinned to the corners: the heading top left (optionally a second line in a muted tone, via `titleMuted`), the supporting copy bottom left, and a primary button with an optional outline `secondary` bottom right. Use once, as the last section on a page.",
  );
export type CtaBandProps = z.input<typeof ctaBandSchema>;

export const newsletterSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    action: safeUrl(),
    buttonLabel: z.string().default("Subscribe"),
  })
  .describe(
    "A centered heading over a native email-capture form (no client JavaScript) that posts to a URL you provide, on a full-bleed band of the site's texture. Use to grow an email list without embedding a third-party widget.",
  );
export type NewsletterProps = z.input<typeof newsletterSchema>;

export const featureGridSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    features: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
        }),
      )
      .min(1),
  })
  .describe(
    "A ruled ledger grid of short title/body pairs, three per row on desktop, each numbered in order, with no icons or images. Use mid-page to list what the product does when each point needs only a sentence. Provide a multiple of 3 (3 or 6 is typical): a short last row is closed with empty ruled cells, which reads as a gap.",
  );
export type FeatureGridProps = z.input<typeof featureGridSchema>;

export const featureSplitSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    points: z.array(z.string()).optional(),
    image: media,
  })
  .describe(
    "A two-column section pairing a headline, supporting copy, and an optional ruled list of points against a single supporting image, framed 4:3 on a bed of the site's texture. Use mid-page to explain one capability in more depth than a feature grid allows. A darker image sits better on the dark page than a pale one.",
  );
export type FeatureSplitProps = z.input<typeof featureSplitSchema>;

/** Three rows, no more and no less. Unlike FeatureGrid's `.min(1)`, the count
 * is load-bearing: each row's illustration is fixed artwork selected by
 * POSITION (see components/blocks/feature-row-art.tsx), so a fourth row would
 * have nothing to draw. Exported so the component and the tests read the same
 * number rather than repeating it, the same reason statsCount and
 * galleryImageCount are exported. */
export const featureRowsCount = 3;

export const featureRowsSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    rows: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
          /** Reuses `link` rather than `cta` (pricingSchema.plans[].cta)
           * because the comp draws a text link with a chevron here, not a
           * button — the name says which of the two a Block renders. Either
           * way the href goes through safeUrl(), so its rule reaches the
           * catalog. */
          link: link.optional(),
        }),
      )
      .length(featureRowsCount),
  })
  .describe(
    "Exactly three full-width rows, each pairing a numbered title, a short body and an optional text link against its own illustration. The illustrations are fixed artwork from the design, not something you supply: row 1 draws a content file listing its Blocks, row 2 a branch merging into main, row 3 a file of design tokens — so the copy has to describe those three things, in that order. The 01/02/03 index is derived from position and is not a prop. Use mid-page to walk through three capabilities in more depth than a feature grid allows; for one capability against one image of your own, use FeatureSplit.",
  );
export type FeatureRowsProps = z.input<typeof featureRowsSchema>;

export const previewStageSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
  })
  .describe(
    "A heading and optional lede above a full-width illustration of this site being edited in place: a browser showing the home page's Hero under selection, the Block toolbar over it, an AI agent's cursor, and status pills for the file being edited and the content check. The illustration is fixed artwork, not something you supply; it reads the site's name and description from content/settings/site.yml, so it follows a rebrand. Use once, to show what editing with an agent looks like.",
  );
export type PreviewStageProps = z.input<typeof previewStageSchema>;

export const imageCardsSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    cards: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
          image: media,
        }),
      )
      // The grid is a fixed 3-column row (sm:grid-cols-3) — fewer than 3
      // cards leaves empty columns and looks unfinished. More than 3 wraps
      // cleanly onto additional full-width rows.
      .min(3),
  })
  .describe(
    "A row of cards, each pairing an image with a short title and body copy, three per row, in the same framed 4:3 card PostGrid uses for posts. Use to showcase several examples, case studies, or products side by side — provide at least 3, ideally a multiple of 3.",
  );
export type ImageCardsProps = z.input<typeof imageCardsSchema>;

/** The mosaic layout is a fixed 8-tile arrangement (2 wide tiles, 6 square),
 * not an authorable variant — the count is load-bearing for the component's
 * position-based tile sizing, so it is exported for tests to reference rather
 * than hard-coded twice. */
export const galleryImageCount = 8;

export const gallerySchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    images: z.array(media).length(galleryImageCount),
  })
  .describe(
    "An eight-image mosaic in three even rows (wide, square, square / square, square, wide / wide, wide), square-cornered frames on the ledger hairline, for showcasing a set of visual assets (photography, product shots, wallpapers) rather than making an argument. The 1st, 6th, 7th and 8th images take the wide slots, so order them with that in mind. Use when the goal is browsing images, not reading copy.",
  );
export type GalleryProps = z.input<typeof gallerySchema>;

/** The default and maximum number of posts PostGrid pulls, and the row it
 * renders in (sm:grid-cols-3, same as ImageCards/Testimonial) — kept close to
 * the schema since both the default and the cap exist for the same reason:
 * 3 fills one clean row, 6 fills two, and beyond that the section stops
 * reading as a "highlights" grid and starts duplicating the /blog index. */
export const postGridMaxCount = 6;

export const postGridSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    count: z.number().int().min(1).max(postGridMaxCount).default(3),
    category: z.string().optional(),
    /** The link to /blog opposite the title. The route is fixed, because it is
     * code and every site built on this template has it; only the words are
     * copy. */
    allPostsLabel: z.string().default("All posts"),
  })
  .describe(
    "A row of recent post cards, each linking to its article, three per row, with a link to /blog opposite the heading. Each card shows the post's cover image (its `cover` frontmatter, or the site's texture when it has none), its title, and its category and date. Unlike every other Block here, its cards are NOT authored as props: it reads the live blog collection at render (newest first, optionally filtered to one `category`) and takes only `count` and `category`, so a card can never drift out of step with its post. To change a card's picture, set `cover` in that post's frontmatter. Use to surface recent writing on a page other than /blog, e.g. the homepage. If `category` matches no published post, the row renders a plain 'No posts published yet.' line instead.",
  );
export type PostGridProps = z.input<typeof postGridSchema>;

export const faqSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    contact: z
      .object({
        prompt: z.string().optional(),
        label: z.string(),
        href: safeUrl(),
      })
      .optional()
      .describe(
        'An optional text link under the title for anyone whose question is not listed, e.g. { prompt: "Still unsure?", label: "Ask us directly", href: "/contact" }.',
      ),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .min(1),
  })
  .describe(
    "A numbered list of questions that each open to show their answer, beside the section title. Uses the browser's native disclosure, so every answer is in the page and it works without JavaScript; the first question starts open. Use to pre-empt objections or answer common questions, typically ahead of a closing CTA.",
  );
export type FaqProps = z.input<typeof faqSchema>;

// The five marks the ledger can draw beside a name, by the shape each one is
// rather than the comp placeholder it was drawn for — `mark: "diamond"` still
// means something once the ledger holds real clients. The list lives here, not
// beside the drawings in components/blocks/logo-wordmarks.tsx, because
// generate-catalog.ts and schemas.test.ts both import THIS file under Node's
// --experimental-strip-types, which cannot load a .tsx file. The drawings key
// a total Record off LedgerMarkId, so the enum and the glyphs cannot drift:
// an id with no glyph, or a glyph with no id, fails typecheck.
export const ledgerMarkIds = ["squares", "diamond", "chevron", "grid", "triangle"] as const;
export type LedgerMarkId = (typeof ledgerMarkIds)[number];

/** One cell of the ledger, in either of the two forms a cell can take: an
 * image (a real client logo, validated like every other media prop), or a name
 * set as a wordmark — on its own, or with one of the five marks beside it.
 * Three authorable shapes, mixable in any order within one `logos` array. */
export const logoCloudEntry = z.union([
  media,
  z.object({
    name: z.string(),
    mark: z.enum(ledgerMarkIds).optional(),
  }),
]);
export type CompanyEntry = z.infer<typeof logoCloudEntry>;

export const logoCloudSchema = z
  .object({
    eyebrow: z.string(),
    meta: z.string().optional(),
    // The grid is 2 columns, 3 at sm and 6 at lg, and every cell draws its own
    // right and bottom rule — so a count that is not a multiple of 6 leaves a
    // short final row at the widest breakpoint, with the bottom-right
    // crosshair hanging in space beside it rather than sitting on the rule.
    // Six is the floor: one whole row at every breakpoint. Twelve, the comp's
    // count, is the one that divides by 2, 3 AND 6, so nothing is ragged
    // anywhere.
    logos: z.array(logoCloudEntry).min(6),
  })
  .describe(
    "A bordered ledger of client logos under a small-caps label, with an optional note opposite it. Each entry is one of three shapes, mixable in any order: an image ({ src, alt }), a name with one of the five marks beside it ({ name, mark }), or a name on its own ({ name }) — a name is set as a wordmark in the ledger's own type, which varies by position so the grid reads as separate logos rather than one list. Marks: squares, diamond, chevron, grid, triangle. Use to signal adoption without making an argument — provide at least 6, ideally a multiple of 6, since anything else leaves a short final row.",
  );
export type LogoCloudProps = z.input<typeof logoCloudSchema>;

export const HIGHLIGHT_RULE =
  "An exact phrase from `quote` to mark in the accent colour. Must appear in `quote` word for word, or the build fails.";

/** One quote in a Testimonial, as the ledger's cells and its `featured` panel
 * both take it. Declared below logoCloudEntry, not beside the other card rows,
 * because `company` reuses it and a const cannot be read before its
 * declaration. */
export const testimonialEntry = z
  .object({
    quote: z.string(),
    person,
    /** The comp marks one phrase in each quote. A substring rather than markup
     * inside `quote`, because content carries no markup
     * (remark-content-lockdown.ts). */
    highlight: z.string().min(1).optional().describe(HIGHLIGHT_RULE),
    /** The company, drawn on a textured panel. The ledger's entry shape, as
     * FeaturedQuote's `company` is. */
    company: logoCloudEntry.optional(),
  })
  // The refine is what actually fails the build; the describe() above is what
  // carries the rule into catalog.json, since toJSONSchema() drops
  // refinements. Without it, a mistyped phrase would render as an unmarked
  // quote and nothing would say why.
  .refine((t) => t.highlight === undefined || t.quote.includes(t.highlight), {
    message: HIGHLIGHT_RULE,
    path: ["highlight"],
  });

export const testimonialSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    /** One quote drawn the whole width, above the ledger, in FeaturedQuote's
     * panel: the section's lead endorsement with the rest beneath it. */
    featured: testimonialEntry.optional(),
    testimonials: z
      .array(testimonialEntry)
      // The ledger is a fixed 3-column row from lg, and every cell draws its
      // own right and bottom rule, so fewer than 3 quotes leaves the row open.
      // More than 3 wraps onto further full rows, which close cleanly.
      .min(3),
  })
  .describe(
    "A bordered row of customer quotes, three per row, each attributed to a named person with their role and a greyscale photo, optionally led by one `featured` quote drawn the full width above them. Each quote can mark one phrase in the accent colour (`highlight`, an exact phrase from the quote) and carry its company on a textured panel (`company`, the same shapes as a LogoCloud entry: { src, alt }, { name, mark } or { name }). Use to build trust with third-party praise rather than first-party claims. Provide at least 3 in `testimonials`, ideally a multiple of 3. For one quote on its own, use FeaturedQuote.",
  );
export type TestimonialProps = z.input<typeof testimonialSchema>;

export const featuredQuoteSchema = z
  .object({
    eyebrow: z.string().optional(),
    quote: z.string(),
    person,
    /** The company the quote comes from, drawn large on a textured panel
     * beside it. The ledger's entry shape, reused: a logo image, a name set as
     * a wordmark, or a name with one of the five marks. Optional, so a quote
     * with no logo to show takes the panel's full width instead of prompting a
     * made-up one. */
    company: logoCloudEntry.optional(),
  })
  .describe(
    "One quote, set large in a bordered panel, attributed to a named person with their role and photo, with the company it comes from drawn large on a textured panel beside it. `company` takes the same three shapes as a LogoCloud entry: an image ({ src, alt }), a name with a mark ({ name, mark }), or a name alone ({ name }); leave it out and the quote takes the full width. Use once, for the single strongest endorsement on a page. For three or more quotes side by side, use Testimonial.",
  );
export type FeaturedQuoteProps = z.input<typeof featuredQuoteSchema>;

export const teamSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    // A ledger grid, three to a row from lg and two below. Fewer than 3
    // members reads as a fragment; a short last row is closed with empty
    // ruled cells, so any count renders, but a multiple of 3 fills cleanly.
    team: z.array(person).min(3),
  })
  .describe(
    "A ruled ledger grid of team members, three per row from desktop and two on a phone: a square greyscale portrait, the name, and the role in small caps. Carries no links or hover state; use to put faces to an organization, not when members have individual bio pages. Provide at least 3, ideally a multiple of 3 (a multiple of 6 also fills the two-column phone layout).",
  );
export type TeamProps = z.input<typeof teamSchema>;

// The row is a fixed 4-column divided layout (sm:grid-cols-4 with
// sm:divide-x) — not an authorable variant, same rationale as
// galleryImageCount: any count other than exactly 4 either leaves empty
// divided columns or drops an orphan stat onto an undivided second row, so
// the count is exported for tests to reference rather than hard-coded twice.
export const statsCount = 4;

/** The small segmented meter beside a stat's value. Measured off the comp
 * rather than invented: the ledger's four cells each encode something
 * different, and a single filled-bar prop could express only the first.
 * `filled` ticks are drawn solid, `partial` adds a shorter tick for the
 * fraction after them, and the remainder up to `total` are drawn empty.
 *
 * `tone` selects the EMPTY treatment as much as the filled one. A cell with
 * nothing filled (0kb of client JS) still has to show its slots, and a dim
 * fill reads there as missing data rather than as a deliberate zero, so it
 * outlines them instead. */
export const statMeter = z.object({
  filled: z.number().int().min(0),
  /** Total slots. Defaults to `filled`, which is the plain tally case. */
  total: z.number().int().min(1).optional(),
  /** Fraction of the tick after the filled ones, drawn at part height. */
  partial: z.number().min(0).max(1).optional(),
  tone: z.enum(["solid", "accent", "outline"]).default("solid"),
  /** A short note after the ticks naming the unit or the thing counted
   * ("/ 8 hr day", "tokens.css"). Unlike the ticks it is not hidden from
   * assistive tech: it says something the value and label do not. */
  note: z.string().optional(),
});
export type StatMeterProps = z.infer<typeof statMeter>;

export const statsSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    /** The note set opposite the title, naming what the figures are drawn
     * from. The same slot LogoCloud puts its note in. */
    meta: z.string().optional(),
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          meter: statMeter.optional(),
        }),
      )
      .length(statsCount),
  })
  .describe(
    "A bordered ledger of exactly four large figures, each with a short label and an optional segmented meter beneath it. Use to make a quantitative case — scale, results, usage — at a glance. The meter is what makes it a ledger rather than four numbers: give each stat a `meter` whose `filled` count reads against its `total`, and a `note` naming the unit it is measured in.",
  );
export type StatsProps = z.input<typeof statsSchema>;

export const pricingSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    plans: z
      .array(
        z.object({
          title: z.string(),
          price: z.string(),
          period: z.string().optional(),
          body: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: link.optional(),
          emphasized: z.boolean().default(false),
        }),
      )
      // One ledger row from lg: four plans is the widest row the grid draws,
      // and a fifth would wrap into a row the ledger's rules do not close.
      .min(1)
      .max(4),
  })
  .describe(
    "A ruled ledger of pricing plans side by side (stacked on a phone), each with a title, price, optional period, description, checked feature list, and call to action. Mark one plan `emphasized` to raise it as the recommended choice: a lifted panel under a brand-coloured rule, a Popular label and the primary button. Use 2 to 4 plans to compare tiers on a pricing page or section; not for a single fixed price.",
  );
export type PricingProps = z.input<typeof pricingSchema>;

export const comparisonSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    usLabel: z
      .string()
      .optional()
      .describe(
        "The heading over the recommended column. Leave it out to use the site's name from content/settings/site.yml.",
      ),
    traditionalLabel: z
      .string()
      .default("The old way")
      .describe("The heading over the alternative column."),
    rows: z
      .array(
        z.object({
          criteria: z.string(),
          us: z.string(),
          traditional: z.string(),
        }),
      )
      .min(5)
      .max(6),
  })
  .describe(
    "A comparison table with five or six concise rows: a criteria column, the recommended column (highlighted, headed by the site name unless usLabel says otherwise), and the alternative. On a phone each row stacks. Use to compare the product or service with a familiar alternative, keeping each cell short enough to scan.",
  );
export type ComparisonProps = z.input<typeof comparisonSchema>;

// The registry the catalog generator reads. Keep in step with blockComponents
// in src/components/blocks/index.ts — a schema with no component renders
// nothing, and a component with no schema cannot be validated.
export const blockSchemas: Array<{ name: string; schema: z.ZodType }> = [
  { name: "Banner", schema: bannerSchema },
  { name: "Hero", schema: heroSchema },
  { name: "CTA", schema: ctaBandSchema },
  { name: "Comparison", schema: comparisonSchema },
  { name: "FeatureGrid", schema: featureGridSchema },
  { name: "FeatureSplit", schema: featureSplitSchema },
  { name: "FeatureRows", schema: featureRowsSchema },
  { name: "PreviewStage", schema: previewStageSchema },
  { name: "ImageCards", schema: imageCardsSchema },
  { name: "Gallery", schema: gallerySchema },
  { name: "PostGrid", schema: postGridSchema },
  { name: "Faq", schema: faqSchema },
  { name: "Testimonial", schema: testimonialSchema },
  { name: "FeaturedQuote", schema: featuredQuoteSchema },
  { name: "LogoCloud", schema: logoCloudSchema },
  { name: "Team", schema: teamSchema },
  { name: "Stats", schema: statsSchema },
  { name: "Newsletter", schema: newsletterSchema },
  { name: "Pricing", schema: pricingSchema },
];

// Validate a Block's props at render. Every Block calls this first, so invalid
// content fails the static build with a message naming the Block and each bad
// prop path — the authoring agent's only feedback channel.
export function parseBlock<S extends z.ZodType>(
  name: string,
  schema: S,
  raw: unknown,
): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`<${name}> received invalid props:\n${issues}`);
  }
  return result.data;
}
