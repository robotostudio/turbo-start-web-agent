---
name: design-a-block
description: Use before writing or editing any component under src/components/ — a new Block, a change to how an existing one looks, an animation, a layout change, or anything a visitor will see. Use whenever asked to design a section, restyle something, "make it look like", add a UI element, or when a request cannot be met by composing existing Blocks. Not for editing content — that is compose-page.
---

# Designing inside an existing system

This site is not a blank canvas. Every Block is assembled from the same small
set of decisions: eight type roles, one section rhythm, one button primitive,
three families of colour tokens, and a handful of shared parts (the ledger
grid, the texture bed, the card frame). The reason a page of nineteen unrelated
Blocks looks like one site is that none of them invented their own.

Designing here means finding the decision that already exists. The failure mode
is not ugly work; it is *plausible* work that quietly adds a ninth type size, a
second button treatment, or a rounded card among square ones, none of which
look wrong alone and all of which make the system a little less true.

**The mechanics of adding a Block (schema, component, registry, catalog) are
`AGENTS.md` §4.** This skill is the part §4 does not cover: what to reuse, and
what not to introduce.

## Look before you build

- **`/blocks-gallery`**: every Block rendered live, then the button primitive
  across every variant and size, the type scale, SectionHeader's slots, and the
  texture. If something like your task is already there, use it.
- **`/style-guide`**: the same system written down, with the same specimens.
- **The Paper file** ("Harbour", page `1-0`): the design every Block was
  measured from. A new Block is designed there first, as an artboard in the
  same language, and built only once it is approved.

Then read the Block whose shape is closest to yours. The conventions are more
legible in a file than in any list.

**Prefer a variant to a new Block.** `Hero` takes `variant: "showcase" |
"centered" | "left"` (`showcase` is the default and what home uses) rather than
existing three times. A layout that differs by alignment, column count or
emphasis is a variant. A Block earns its own entry only when the *content it
accepts* is genuinely different: different props, not different CSS.

## Type

Eight roles, defined as `--text-*` in `src/app/globals.css`. Pick one; never a
bare Tailwind size for something a role covers.

| Role | Size | For |
|---|---|---|
| `text-display` | 64/70 | The page title: Hero, the `/blog` heading, a post's `h1` |
| `text-statement` | 52/62 | A closing statement: the CTA band, Newsletter |
| `text-title` | 36/44 | A section title (SectionHeader) |
| `text-subtitle` | 22/30 | An item title inside a section: FAQ questions, grid cells, plan names |
| `text-lede` | 18/28 | The line under a title |
| `text-stat` | 60/64 | A figure: Stats, a plan price (both at `font-light`) |
| `text-eyebrow` | 12/16, 0.14em | Mono small caps: eyebrows, column labels, roles, periods |
| `text-label` | 10/14, 0.14em | The footer's column headings only. Not for anything read as prose |

- **Weight is not in the tokens.** Titles are 400, the inherited default. The
  old `font-semibold tracking-tight` title is gone; do not bring it back. The
  one exception is `text-stat`, set at `font-light`.
- **Step down on small screens with a Tailwind size, then take the role.** 64px
  is most of a phone's width per word, so large roles start smaller:
  `text-5xl lg:text-display`, `text-3xl sm:text-title lg:text-statement`.
- Body copy is `text-base` (16px), at `leading-6.5` where it sits in a ledger.
- `--text-wordmark-*` is a separate family for LogoCloud's placeholder
  wordmarks only (`logo-wordmarks.tsx`). Nothing else uses it.

## Colour

Tokens only: `bg-primary`, `text-muted-foreground`, `border-ledger-rule`. Never
a hex code in a component, never a palette class like `bg-zinc-400`. A retheme
is an edit to `globals.css` and nothing else, and that holds only while every
Block names tokens.

Three families:

- **Base** (the shadcn contract): `background`, `foreground`, `primary` and
  friends. Text runs in three tiers: `foreground`, `muted-foreground`, and
  `subtle-foreground`. The third tier is for mono indexes, labels and chrome;
  at 3.7:1 it is not for body copy. `primary-foreground` is near-black on
  purpose, because white on the accent fails contrast.
- **`ledger-*`**: the hairline grids and their parts (`ledger-rule`,
  `ledger-tick`, `ledger-meta`, `ledger-meter*`, `ledger-wordmark*`). They
  exist because the nearest base tokens were close but not equal to the comp.
- **`mock-*`**: only for the UI drawings inside FeatureRows and PreviewStage.

The theme is **dark only**: `color-scheme: dark`, and a `dark:` utility never
applies. The ledger and mock tokens are white-on-dark alphas, so a light
retheme must set them too.

## Rhythm

A Block is `<section>` wrapping `<div className="page-inset">`. `page-inset` is
the only horizontal measure (90rem, gutters 1.5rem, 3rem from `lg`); a Block
that sets its own `max-w-*` container will not line up with the one above it.

Vertical rhythm is **`py-16 lg:py-22`** (64px, 88px from lg). Stats, LogoCloud,
PostGrid, ImageCards and PreviewStage sit tighter at `py-16`, because the comp
draws them that way. Measure against the comp; do not guess.

A **full-bleed band** (the Hero's texture, PreviewStage's stage, the CTA and
Newsletter beds) draws its bed outside `page-inset` as an absolutely placed
layer, then keeps its content inside a `page-inset` as usual.

## Shape and elevation

- **Square**: cards, frames, image tiles and ledger cells. Square corners with
  a hairline (`outline outline-ledger-rule`). No `rounded-lg` card, no hover
  zoom.
- **Fully rounded**: buttons, pills and the eyebrow tick.
- **Radius** (`--radius`) is only for the UI mock drawings, images inside
  prose, and small inline marks: the quote avatar (`rounded-md`) and the
  highlight behind quoted words (`rounded-xs`).
- **Shadows** are tokens: `--shadow-button` and `--shadow-button-primary` (both
  already inside `buttonVariants`), `--shadow-prompt-card`,
  `--shadow-stage-window`, `--shadow-stage-float`. Use them by name,
  `shadow-(--shadow-stage-window)`; do not write a new shadow.

## Buttons and links

- **A link that looks like a button** is `ButtonLink`
  (`src/components/ui/button-link.tsx`), which defaults to `size="marketing"`.
  `variant="default"` for the primary action, `variant="outline"` beside it.
- **A real `<button>`** (a form submit) takes `buttonVariants()` directly, as
  Newsletter does.
- **Never import `ui/button.tsx` into a Block.** It is a client component, and a
  Block is a server component.
- **A text link that is not a call to action** is `TextLink`
  (`src/components/ui/text-link.tsx`): the label with a chevron, as FeatureRows,
  PostGrid and the FAQ's contact line use.

## Section headings

`SectionHeader` (`src/components/blocks/section-header.tsx`) takes `eyebrow`,
`title`, `meta` (a note opposite the title) and `lede`. `SectionHeaderSplit`
beside it sets the lede opposite the title, bottom-aligned, as the ledger
sections do.

**Eyebrows are part of the system.** An earlier version of this skill banned
them; the redesign reversed that, and the reason is recorded in
`section-header.tsx`. The rule that survives: an eyebrow says something the
title does not. "OUR FEATURES" above "Our features" is noise. The eyebrow is an
optional prop on most Blocks, and required on LogoCloud, which has no title.

Hand-roll a header only when there is no title (the LogoCloud precedent), and
then copy SectionHeader's tick and label exactly.

## Patterns

Each has a reference file. Compose these rather than redrawing them.

- **Ledger grid** (`ledger.tsx`; used by FeatureGrid, Team, Pricing, Stats,
  LogoCloud). The container owns `border-t border-l` and each cell its own
  `border-r border-b`, all `border-ledger-rule`, so no two rules ever stack.
  Put `<LedgerCorners />` in a `relative` wrapper for the crosshairs, or
  `<LedgerCorners away />` when the tiles sit in a gap (Gallery). Close a short
  last row with `ledgerFillers(count, { base, md, lg })`, rendering each as an
  `aria-hidden` `<li>`, and tell authors the count that fills cleanly in the
  schema's `.describe()`.
- **Mono index** (FeatureGrid, FAQ, FeatureRows): `String(index + 1).padStart(2,
  "0")` in `font-mono text-xs tabular-nums tracking-widest
  text-subtle-foreground`, `aria-hidden`, since the list already announces its
  order.
- **Texture** (`src/components/texture/grid-field.tsx`). `GridField` is a
  primitive, not a Block. `preset` is `dense` or `coarse`. `animate` defaults to
  true; pass `false` for a still bed that ships no JavaScript. `pointer` (cursor
  glow) is for the Hero's one large placement only. `tile={{ width, position }}`
  fixes the cell size for a small bed (never animated). The texture masks
  `bg-foreground`, so it follows a retheme.
- **Beds** (`src/components/site/site-mark.tsx`). Fade a texture into the page
  with `groundAt(alpha)`, `BED_VIGNETTE` and `EdgeScrims`: every stop is
  `--background` at an alpha, set as an inline `backgroundImage` because a
  gradient of token colours has no canonical class.
- **Card frame** (`src/components/content/card-image.tsx`). `CardImage` is an
  image in the shared 4:3 square frame on the hairline; `cardFrame` is the
  frame alone. PostCard, ImageCards and FeatureSplit share it.
- **Ledger marks** (`ledger-marks.tsx`). `CheckMark` for the recommended side
  (`text-primary`) or a plain list (`text-muted-foreground`), `DashMark` for the
  alternative. Both are `aria-hidden`.
- **The recommended choice** (Comparison's column, Pricing's emphasized plan): a
  lifted `bg-foreground/3` panel under a 2px `bg-primary` rule, pink checks, and
  the primary button. Pink appears once per section, for that choice.
- **Interactive without JavaScript** (`faq.tsx` with `faq-motion.tsx`). The
  server renders native HTML that already works: `<details>`/`<summary>`,
  styled by state with `group-open:`. A small client component may enhance it
  (the FAQ's animated height), respecting `prefers-reduced-motion`. If the
  enhancer never loads, nothing breaks. This is the template for anything
  interactive.
- **Brand-coloured strip** (`banner.tsx`). The one Block drawn on `bg-primary`,
  for an in-page callout. Not the site-wide announcement bar, which is chrome in
  `content/settings/announcement.yml`.

## Rules that have not changed

**No arbitrary values.** `p-[13px]`, `text-[#4a4a4a]`, `w-[347px]` bypass the
rhythm and the tokens, and the class you want usually exists: `py-8.5` is 34px,
`lg:w-95` is 380px, `opacity-16` is 16%. Canonical Tailwind classes only.

**Never write the site's name.** It lives in `content/settings/site.yml` and is
read from `site` in `#velite` (see `src/app/layout.tsx`, and Comparison's
default column label). `pnpm run brand:check` fails on it, including inside an
`sr-only` caption.

**Server components by default.** A Block ships client JavaScript only when it
genuinely needs it, and then as an enhancer over working HTML (above).

**Measure against the comp.** Record measured values in a comment, and when the
nearest token is close but not equal, add a named token rather than rounding by
eye; that is how the `ledger-*` family arrived.

## Motion

CSS first, gated on the visitor's setting: `motion-safe:animate-*`, never an
unconditional `animate-*`. Where a loop duplicates content to run seamlessly,
the duplicate is `aria-hidden="true"` and `motion-reduce:hidden`. Check
`globals.css` for an existing keyframe before writing one: `--animate-marquee`
is there, used only by the announcement bar.

When CSS cannot do it (animating to an unknown height, the texture), use the
enhancer pattern above and check `prefers-reduced-motion` in the script.

## Markup that passes the gate

`pnpm run checks` runs biome, and its accessibility rules are not advisory. **A
list is `<ul>` and `<li>`, not a `<div>` with `role="list"`**; the ledger grids
are lists.

Images use `next/image`: explicit `width` and `height`, or `fill` inside
`CardImage` or another sized frame, with `sizes` matching the layout.
Decorative images take `alt=""`; an image that carries meaning takes a real
description.

## A Block is not finished until the gallery shows it

`pnpm catalog` writes an empty stub for a new Block so the generator can run
mid-work. Fill it in with a real usage example in
`content/pages/blocks-gallery.mdx`, including an `eyebrow` if the Block takes
one, and drop the `status="todo"`. Use the copy you would actually ship; the
gallery is where the next person decides whether to reuse your Block.

`pnpm run checks` fails on a Block with no example.

## Before you deliver

Run `pnpm run checks`, the same gate CI runs. Then **look at the page** at
1440, 768 and 375, beside its artboard. A Block can validate, typecheck, build,
and still be half a rhythm out from the one above it. Where you have a browser,
open it. Where you do not, serve the build and assert on the HTML.
