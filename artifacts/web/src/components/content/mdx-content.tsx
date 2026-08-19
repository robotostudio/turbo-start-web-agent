import { run } from "@mdx-js/mdx";
import type { ComponentProps, ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { blockComponents } from "@/components/blocks";
import { BlockSpec } from "@/components/blocks/block-spec";

// One top-level markdown element (heading, paragraph, list) wrapped in the
// site's shared `.page-inset` gutter, using `font-sans` for body copy, and
// styled by @tailwindcss/typography's `prose` scope — its --tw-prose-*
// variables are remapped to the site's design tokens in globals.css — rather
// than hand-rolled per-element classes. Blocks (Hero, CTA, …) are matched by
// capitalised name and never reach this wrapper — they already carry their
// own `page-inset`, so wrapping the whole MDX tree in one ancestor container
// would double that padding up on every page a Block renders on, and would
// let `.prose`'s descendant selectors reach into a Block's own markup (its
// rules use `:where()`, zero specificity, so a Block's own classes would
// usually win — but "usually" isn't the guarantee this file wants).
//
// The unstyled inner <div> exists only so the real element ends up a
// GRANDCHILD of `.prose`, never a direct child: the plugin zeroes the margin
// of whatever is `.prose`'s own `> :first-child` / `> :last-child` — and
// since every element here is alone in its own isolated `.prose` scope
// (there being no way to group a run of markdown nodes across independent
// component-map lookups without also risking engulfing a Block), it would
// otherwise BE both at once, collapsing its own margin-top and margin-bottom
// to zero — i.e. completely unspaced. Browser-verified: computed
// `margin-top` on a rendered `p`/`h2` is non-zero with this indirection, zero
// without it.
const ProseBlock = ({ children }: { children: ReactNode }) => (
  <div className="page-inset font-sans">
    <div className="prose prose-base max-w-3xl">
      <div>{children}</div>
    </div>
  </div>
);

// Only the elements markdown can produce as TOP-LEVEL nodes need an entry
// here. Inline-level tags nested inside one of these — li, a, code, strong —
// are styled automatically by `.prose`'s descendant selectors regardless of
// depth, so they don't need their own override; one rendered by a Block's own
// JSX is untouched either way, since Blocks never resolve through this map.
const proseComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <ProseBlock>
      <h1 {...props} />
    </ProseBlock>
  ),
  h2: (props: ComponentProps<"h2">) => (
    <ProseBlock>
      <h2 {...props} />
    </ProseBlock>
  ),
  h3: (props: ComponentProps<"h3">) => (
    <ProseBlock>
      <h3 {...props} />
    </ProseBlock>
  ),
  p: (props: ComponentProps<"p">) => (
    <ProseBlock>
      <p {...props} />
    </ProseBlock>
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ProseBlock>
      <ul {...props} />
    </ProseBlock>
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ProseBlock>
      <ol {...props} />
    </ProseBlock>
  ),
};

// Velite pre-compiles each MDX body to a function-body string (the entry's
// `code`, passed here as `source`). @mdx-js/mdx's run() executes it with the
// JSX runtime and injects the Block registry — no per-file imports. Runs
// server-side (RSC) at build, so the Blocks' parseBlock guards fail the build
// on bad props.
export async function MdxContent({ source }: { source: string }) {
  const { default: Content } = await run(source, runtime);
  // BlockSpec is Block Gallery chrome, injected here rather than registered in
  // blockComponents/blockSchemas — a Block listing itself in its own gallery
  // would skew blockCount. See src/components/blocks/block-spec.tsx.
  return <Content components={{ ...blockComponents, BlockSpec, ...proseComponents }} />;
}
