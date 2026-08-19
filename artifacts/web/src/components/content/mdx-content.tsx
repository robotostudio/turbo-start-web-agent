import { run } from "@mdx-js/mdx";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { blockComponents } from "@/components/blocks";
import { BlockSpec } from "@/components/blocks/block-spec";

// How a top-level markdown element is wrapped. Every variant below keeps the
// same three-layer shape, and each layer is load-bearing:
//
//   outer  — page gutter (or nothing, when a route supplies its own column)
//   .prose — @tailwindcss/typography's scope, with its --tw-prose-* variables
//            remapped to the site's design tokens in globals.css
//   inner  — an unstyled <div> so the real element is a GRANDCHILD of .prose,
//            never a direct child
//
// That last layer is the non-obvious one. The plugin zeroes the margin of
// whatever is `.prose`'s own `> :first-child` / `> :last-child` — and since
// every element here sits alone in its own isolated `.prose` scope (there
// being no way to group a run of markdown nodes across independent
// component-map lookups without also risking engulfing a Block), it would
// otherwise BE both at once, collapsing its own margin-top and margin-bottom
// to zero — i.e. completely unspaced. Browser-verified: computed `margin-top`
// on a rendered `p`/`h2` is non-zero with this indirection, zero without it.
//
// Per-element isolation (rather than one .prose around the whole body) is
// also what keeps Blocks out of .prose's reach. Blocks are matched by
// capitalised name and never resolve through this map, so they never get a
// wrapper — they already carry their own `page-inset`, and a shared .prose
// ancestor would let its descendant selectors reach into a Block's markup.
type ProseWrap = ComponentType<{ children: ReactNode }>;

// Route-level pages: each element carries the site's shared `page-inset`
// gutter itself, because a page's markdown is interleaved with Blocks that
// bring their own.
const PageWrap: ProseWrap = ({ children }) => (
  <div className="page-inset font-sans">
    <div className="prose prose-base max-w-3xl">
      <div>{children}</div>
    </div>
  </div>
);

// Blog articles: the route already puts the body in a fixed measure column
// beside the table-of-contents rail (src/app/blog/[slug]/page.tsx), so the
// gutter and the max-width both come from that column instead — a second
// `page-inset` here would indent the body inside its own column, and
// `max-w-3xl` would fight the column for the measure.
const ArticleWrap: ProseWrap = ({ children }) => (
  <div className="prose prose-base max-w-none font-sans">
    <div>{children}</div>
  </div>
);

// Every element markdown can produce as a TOP-LEVEL node needs an entry here:
// anything missing renders bare, i.e. outside both the gutter and the .prose
// scope — full-bleed and unstyled. Inline-level tags nested inside one of
// these — li, a, code, strong, td — are styled automatically by `.prose`'s
// descendant selectors regardless of depth, so they need no override; one
// rendered by a Block's own JSX is untouched either way, since Blocks never
// resolve through this map.
//
// GFM is on by default in Velite's MDX pipeline, so `table` is reachable from
// content and belongs in this list alongside the CommonMark elements.
const proseComponents = (Wrap: ProseWrap) => ({
  h1: (props: ComponentProps<"h1">) => (
    <Wrap>
      <h1 {...props} />
    </Wrap>
  ),
  h2: (props: ComponentProps<"h2">) => (
    <Wrap>
      <h2 {...props} />
    </Wrap>
  ),
  h3: (props: ComponentProps<"h3">) => (
    <Wrap>
      <h3 {...props} />
    </Wrap>
  ),
  h4: (props: ComponentProps<"h4">) => (
    <Wrap>
      <h4 {...props} />
    </Wrap>
  ),
  p: (props: ComponentProps<"p">) => (
    <Wrap>
      <p {...props} />
    </Wrap>
  ),
  ul: (props: ComponentProps<"ul">) => (
    <Wrap>
      <ul {...props} />
    </Wrap>
  ),
  ol: (props: ComponentProps<"ol">) => (
    <Wrap>
      <ol {...props} />
    </Wrap>
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <Wrap>
      <blockquote {...props} />
    </Wrap>
  ),
  pre: (props: ComponentProps<"pre">) => (
    <Wrap>
      <pre {...props} />
    </Wrap>
  ),
  hr: (props: ComponentProps<"hr">) => (
    <Wrap>
      <hr {...props} />
    </Wrap>
  ),
  // The only element that needs more than the wrapper: a wide table has to
  // scroll inside its own box, or it pushes the whole page sideways on a
  // phone. `overflow-x-auto` establishes a block formatting context, so the
  // table's own prose margins stay contained rather than collapsing with the
  // neighbouring elements — the spacing either side is set by those elements
  // instead, which is why this stays visually in step with the rest.
  table: (props: ComponentProps<"table">) => (
    <Wrap>
      <div className="overflow-x-auto">
        <table {...props} />
      </div>
    </Wrap>
  ),
});

const componentsByVariant = {
  page: proseComponents(PageWrap),
  article: proseComponents(ArticleWrap),
} as const;

export type MdxVariant = keyof typeof componentsByVariant;

// Velite pre-compiles each MDX body to a function-body string (the entry's
// `code`, passed here as `source`). @mdx-js/mdx's run() executes it with the
// JSX runtime and injects the Block registry — no per-file imports. Runs
// server-side (RSC) at build, so the Blocks' parseBlock guards fail the build
// on bad props.
export async function MdxContent({
  source,
  variant = "page",
}: {
  source: string;
  variant?: MdxVariant;
}) {
  const { default: Content } = await run(source, runtime);
  // BlockSpec is Block Gallery chrome, injected here rather than registered in
  // blockComponents/blockSchemas — a Block listing itself in its own gallery
  // would skew blockCount. See src/components/blocks/block-spec.tsx.
  return (
    <Content components={{ ...blockComponents, BlockSpec, ...componentsByVariant[variant] }} />
  );
}
