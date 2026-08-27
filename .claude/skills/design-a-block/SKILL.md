---
name: design-a-block
description: Use before writing or editing any component under src/components/ — a new Block, a change to how an existing one looks, an animation, a layout change, or anything a visitor will see. Use whenever asked to design a section, restyle something, "make it look like", add a UI element, or when a request cannot be met by composing existing Blocks. Not for editing content — that is compose-page.
---

# Designing inside an existing system

This site is not a blank canvas. Every Block is assembled from the same small
set of decisions — five type roles, one spacing rhythm, one button primitive,
twenty colour tokens — and the reason a page of fifteen unrelated Blocks looks
like one site is that none of them invented their own.

Designing here means finding the decision that already exists. The failure mode
is not ugly work; it is *plausible* work that quietly adds a sixth type size, a
second button treatment, or a third container width, none of which look wrong
alone and all of which make the system a little less true.

**The mechanics of adding a Block — schema, component, registry, catalog — are
`AGENTS.md` §4.** This skill is the part §4 does not cover: what to reuse, and
what not to introduce.

## Look before you build

Two pages exist for this and cost a minute:

- **`/blocks-gallery`** — every Block rendered live, then the button primitive
  across every variant and size, then the type scale. If something like your
  task is already there, use it.
- **`/style-guide`** — the same system written down: tokens, type roles,
  rhythm, and what the system deliberately omits.

Then read one Block whose shape is closest to what you are building. The
conventions are more legible in a file than in any list.

**Prefer a variant to a new Block.** `Hero` takes `variant: "centered" | "left"`
rather than existing twice. A layout that differs by alignment, column count,
or emphasis is a variant. A Block earns its own entry only when the *content
it accepts* is genuinely different — different props, not different CSS.

## The decisions already made

**Colour** is tokens only — `bg-primary`, `text-muted-foreground`,
`border-border`. Never a hex code, never a Tailwind palette class like
`bg-zinc-400`. Re-theming a client site is meant to be an edit to
`globals.css` and nothing else, and that only holds while every Block refers to
tokens by name.

**Type** is the five roles in `/style-guide`. Pick one. A section title is
`text-4xl font-semibold tracking-tight`; a lede is `text-lg
text-muted-foreground` at `max-w-md`. If you find yourself reaching for
`text-3xl`, you want one of the two rows either side of it.

**Rhythm** is `<section>` wrapping `<div class="page-inset">`, with `py-20
sm:py-28`. `page-inset` is the only horizontal measure on the site; a Block
that sets its own `max-w-*` container is a Block that will not line up with the
one above it.

**Buttons** come from `src/components/ui/button.tsx`. `variant="default"` for
a primary action, `variant="outline"` beside it, `size="marketing"` for a call
to action under a large heading. A Block writing `rounded-lg bg-primary px-6
py-3` is re-implementing the primitive, which is exactly the duplication that
primitive was extracted to end.

**Section headings** come from `SectionHeader`, which renders a title and an
optional lede and nothing else — no eyebrow, no small-caps kicker, no coloured
rule. That combination was rejected as generic; do not reintroduce it.

**No arbitrary values.** `p-[13px]`, `text-[#4a4a4a]`, `w-[347px]` bypass both
the rhythm and the tokens. Canonical Tailwind classes only — and the class you
want usually exists: `min-w-[36rem]` shipped on 2026-08-27 where `min-w-xl` is
the same 36rem.

**Never write the site's name.** It lives in `content/settings/site.yml` and is
read from `site` in `#velite` — see `src/app/layout.tsx`. A Block that spells
the brand out is a Block that still says the template's name after a client
rebrand, in a file nobody thought to open. `pnpm run brand:check` fails on it,
including inside an `sr-only` caption, which is where it got through once.

**Server components by default.** A Block ships client JavaScript only when it
genuinely needs interactivity. Reach for CSS before `"use client"`.

## Motion

Animate through CSS, gated on the visitor's own setting: `motion-safe:animate-*`
and never an unconditional `animate-*`. Where a loop duplicates content to run
seamlessly, the duplicate is `aria-hidden="true"` and `motion-reduce:hidden`.

Check `globals.css` for an existing keyframe before writing one.
`--animate-marquee` is already there, translating `-50%` for exactly the
two-copy pattern — the logo cloud and the announcement bar both use it.

## Markup that passes the gate

`pnpm run checks` runs biome, and its accessibility rules are not advisory.
The one that bites most often: **a list is `<ul>` and `<li>`, not a `<div>`
with `role="list"`.** A pull request landed with exactly that on 2026-08-27 and
failed lint on a change that was otherwise correct.

Images use `next/image` with explicit `width` and `height`. Decorative images
take `alt=""`; an image that carries meaning takes a real description.

## Before you deliver

Run `pnpm run checks` — one command, the same gate CI runs.

Then **look at the page**, not just the green tick. A Block can validate, typecheck,
build, and still be half a rhythm out from the one above it. Where you have a
browser, open it. Where you do not, serve the build and assert on the HTML for
what you changed.
