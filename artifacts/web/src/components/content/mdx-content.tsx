import { run } from "@mdx-js/mdx";
import type { ComponentProps, ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { blockComponents } from "@/components/blocks";
import { BlockSpec } from "@/components/blocks/block-spec";

// One top-level prose element (heading, paragraph, list) wrapped in the
// site's shared `.page-inset` gutter, using `font-sans` for body copy, then
// narrowed to a readable measure inside it. Blocks (Hero, CTA, …) are matched
// by capitalised name and never reach this wrapper — they already carry
// their own `page-inset`, so wrapping the whole MDX tree in one ancestor
// container would double that padding up on every page a Block renders on.
const ProseBlock = ({ children }: { children: ReactNode }) => (
  <div className="page-inset font-sans">{children}</div>
);

const proseComponents = {
  h1: ({ children, ...props }: ComponentProps<"h1">) => (
    <ProseBlock>
      <h1
        className="mx-auto max-w-3xl pt-12 pb-4 font-semibold text-4xl text-foreground"
        {...props}
      >
        {children}
      </h1>
    </ProseBlock>
  ),
  h2: ({ children, ...props }: ComponentProps<"h2">) => (
    <ProseBlock>
      <h2
        className="mx-auto max-w-3xl pt-10 pb-3 font-semibold text-3xl text-foreground"
        {...props}
      >
        {children}
      </h2>
    </ProseBlock>
  ),
  h3: ({ children, ...props }: ComponentProps<"h3">) => (
    <ProseBlock>
      <h3 className="mx-auto max-w-3xl pt-8 pb-2 font-semibold text-2xl text-foreground" {...props}>
        {children}
      </h3>
    </ProseBlock>
  ),
  p: ({ children, ...props }: ComponentProps<"p">) => (
    <ProseBlock>
      <p className="mx-auto max-w-3xl pb-4 text-foreground leading-7" {...props}>
        {children}
      </p>
    </ProseBlock>
  ),
  ul: ({ children, ...props }: ComponentProps<"ul">) => (
    <ProseBlock>
      <ul className="mx-auto max-w-3xl list-disc space-y-2 pb-4 pl-6 text-foreground" {...props}>
        {children}
      </ul>
    </ProseBlock>
  ),
  ol: ({ children, ...props }: ComponentProps<"ol">) => (
    <ProseBlock>
      <ol className="mx-auto max-w-3xl list-decimal space-y-2 pb-4 pl-6 text-foreground" {...props}>
        {children}
      </ol>
    </ProseBlock>
  ),
  li: (props: ComponentProps<"li">) => <li className="leading-7" {...props} />,
  a: (props: ComponentProps<"a">) => (
    <a className="text-brand underline underline-offset-4 hover:text-muted-foreground" {...props} />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded-card border border-border bg-muted px-1.5 py-0.5 text-foreground text-sm"
      {...props}
    />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
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
