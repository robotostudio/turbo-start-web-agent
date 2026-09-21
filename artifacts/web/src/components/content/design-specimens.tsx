import type { VariantProps } from "class-variance-authority";
import { SectionHeader } from "@/components/blocks/section-header";
import { GridField } from "@/components/texture/grid-field";
import {
  type buttonVariants,
  buttonVariants as variantClasses,
} from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

// Design-system reference for the Block Gallery: the primitives a Block is
// built from, rendered live rather than described.
//
// These exist because the gallery otherwise only shows the handful of
// combinations that happen to appear inside a Block — in practice one filled
// button and one outlined one. The rest of the system is real but invisible,
// and an agent asked to design something new has no way to see what it already
// has. That is how a Block ends up inventing a button.
//
// Like BlockSpec, this is gallery chrome and NOT registered in blockSchemas: a
// Block in the catalog would list itself in its own gallery and shift the
// count. It is injected into MDX from the map in mdx-content.tsx, and emitted
// into content/pages/blocks-gallery.mdx by scripts/generate-gallery.ts, which
// owns that file's structure.

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

// cva keeps its config private at runtime, so these lists are written by hand
// and could fall behind button.tsx. The AssertNever pair below closes that at
// the type level.
const VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
  "inverse",
] as const satisfies readonly ButtonVariant[];

const SIZES = [
  "marketing",
  "default",
  "lg",
  "sm",
  "xs",
  "icon",
  "icon-lg",
  "icon-sm",
  "icon-xs",
] as const satisfies readonly ButtonSize[];

/**
 * Compile-time exhaustiveness guard. `Exclude<...>` is `never` only when every
 * variant and size is listed above, so adding one to button.tsx without
 * showing it here fails `pnpm typecheck` rather than quietly leaving the
 * gallery incomplete. Exported because they *are* the assertion — an unused
 * local would read as dead code and invite deletion.
 */
type AssertNever<T extends never> = T;
export type VariantsAreExhaustive = AssertNever<Exclude<ButtonVariant, (typeof VARIANTS)[number]>>;
export type SizesAreExhaustive = AssertNever<Exclude<ButtonSize, (typeof SIZES)[number]>>;

// The square sizes have no room for a label.
const isIconSize = (size: ButtonSize) => size.startsWith("icon");

const MONO = "font-mono text-xs";

export function ButtonMatrix() {
  return (
    <section className="border-t border-border font-sans">
      <div className="page-inset flex flex-col gap-6 py-12">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-sm uppercase tracking-wide text-foreground">
            Button primitive
          </h2>
          <p className={`${MONO} text-muted-foreground`}>
            src/components/ui/button.tsx · {VARIANTS.length} variants × {SIZES.length} sizes
          </p>
        </div>

        {/* Scrolls inside its own container rather than widening the page. */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={`${MONO} pb-3 pr-4 font-normal uppercase text-muted-foreground`}>
                  variant \ size
                </th>
                {SIZES.map((size) => (
                  <th
                    key={size}
                    scope="col"
                    className={`${MONO} px-3 pb-3 font-normal text-muted-foreground`}
                  >
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map((variant) => (
                <tr key={variant} className="border-t border-border">
                  <th scope="row" className={`${MONO} py-3 pr-4 font-normal text-foreground`}>
                    {variant}
                  </th>
                  {SIZES.map((size) => (
                    <td key={size} className="px-3 py-3">
                      {/* A plain <button>, styled by the same cva config the
                          Blocks use. Rendering Base UI's <Button> here would
                          pull a client boundary into every page on the
                          `[...slug]` route -- see button-variants.ts. */}
                      {/* cn(), not the raw cva output. The base config carries
                          `border-transparent` and the `outline` variant adds
                          `border-input`; both are border-color utilities at equal
                          specificity, so source order decides and transparent
                          wins. Every Block escapes that because ButtonLink wraps
                          the classes in cn(), where tailwind-merge drops the
                          loser. Without it this table renders `outline`
                          identical to `ghost` -- the one place meant to show the
                          variants was the one place showing them wrong. */}
                      <button type="button" className={cn(variantClasses({ variant, size }))}>
                        {isIconSize(size) ? <span aria-hidden="true">→</span> : <span>Button</span>}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// The type scale as the Blocks actually use it, not as Tailwind ships it.
// Every row is a real pairing taken from a Block — Hero's h1, SectionHeader's
// h2 and lede, the mono used for metadata — so an agent designing a new Block
// picks a row rather than inventing a size. Tailwind offers a dozen more
// steps; the point of this table is that this site uses these.
const TYPE_ROLES = [
  {
    role: "Eyebrow",
    where: "SectionHeader — above a title",
    className: "font-mono text-eyebrow uppercase text-muted-foreground",
    sample: "What you get",
  },
  {
    role: "Page title",
    where: "Hero — one per page",
    className: "text-5xl lg:text-display",
    sample: "Your website, editable by any AI agent",
  },
  {
    role: "Section title",
    where: "SectionHeader — every other Block",
    className: "text-title font-normal",
    sample: "Every section opens with a statement",
  },
  {
    role: "Lede",
    where: "Under a title, max-w-md",
    className: "text-lede text-muted-foreground",
    sample: "One supporting sentence, never two paragraphs.",
  },
  {
    role: "Body",
    where: "Prose and card copy",
    className: "text-base text-muted-foreground",
    sample: "The size everything falls back to when nothing else applies.",
  },
  {
    role: "Metadata",
    where: "Dates, categories, labels",
    className: "font-mono text-sm text-muted-foreground",
    sample: "Product · 27 August 2026",
  },
] as const;

export function TypeScale() {
  return (
    <section className="border-t border-border font-sans">
      <div className="page-inset flex flex-col gap-6 py-12">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-sm uppercase tracking-wide text-foreground">Type scale</h2>
          <p className={`${MONO} text-muted-foreground`}>
            Geist Sans (--font-sans) · Geist Mono (--font-mono) · {TYPE_ROLES.length} roles
          </p>
        </div>

        <dl className="flex flex-col gap-8">
          {TYPE_ROLES.map((row) => (
            <div key={row.role} className="flex flex-col gap-2 border-t border-border pt-6">
              <dt className={`${MONO} flex flex-wrap gap-x-3 text-muted-foreground`}>
                <span className="text-foreground">{row.role}</span>
                <span>{row.className}</span>
                <span>· {row.where}</span>
              </dt>
              <dd className={`${row.className} text-balance`}>{row.sample}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// SectionHeader's two optional slots, rendered live. Both were added for the
// 2026-09 redesign and no Block passes them yet -- each section ticket adds
// its own `eyebrow` prop as it lands -- so without this specimen the feature
// would ship with no call site and nothing to look at. Same reasoning as
// ButtonMatrix above: the system is real but otherwise invisible.
export function SectionHeaderSlots() {
  return (
    <section className="border-t border-border font-sans">
      <div className="page-inset flex flex-col gap-6 py-12">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-sm uppercase tracking-wide text-foreground">
            Section header slots
          </h2>
          <p className={`${MONO} text-muted-foreground`}>
            src/components/blocks/section-header.tsx · eyebrow, meta · both optional
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <div className="border-t border-border pt-6">
            <p className={`${MONO} mb-4 text-muted-foreground`}>eyebrow + meta</p>
            <SectionHeader
              eyebrow="By the numbers"
              title="The numbers behind the pitch."
              meta="Measured across 40+ client builds"
              lede="One supporting sentence, never two paragraphs."
            />
          </div>

          <div className="border-t border-border pt-6">
            <p className={`${MONO} mb-4 text-muted-foreground`}>neither — unchanged from before</p>
            <SectionHeader
              title="Every section opens with a statement"
              lede="One supporting sentence, never two paragraphs."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// The procedural grid texture, at both densities. Like the section-header
// specimen above, this exists because no Block composes the texture yet -- each
// section ticket adds it as that section lands -- and a primitive with no call
// site is one nobody can look at.
//
// Worth knowing while looking: what renders first is SVG from the server, and
// the canvas replaces it on mount. With JavaScript disabled the two panels below
// are still filled, just still.
export function TextureField() {
  return (
    <section className="border-t border-border font-sans">
      <div className="page-inset flex flex-col gap-6 py-12">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-sm uppercase tracking-wide text-foreground">
            Grid texture
          </h2>
          <p className={`${MONO} text-muted-foreground`}>
            src/components/texture/grid-field.tsx · server SVG + canvas · 2 presets
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="border-t border-border pt-6">
            <p className={`${MONO} mb-4 text-muted-foreground`}>dense — animated</p>
            <GridField className="h-56 w-full rounded-lg" preset="dense" />
          </div>

          <div className="border-t border-border pt-6">
            <p className={`${MONO} mb-4 text-muted-foreground`}>
              coarse — animate={"{false}"}, ships no client JS
            </p>
            <GridField animate={false} className="h-40 w-full rounded-lg" preset="coarse" />
          </div>
        </div>
      </div>
    </section>
  );
}
