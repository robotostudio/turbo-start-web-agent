import { TextLink } from "@/components/ui/text-link";
import { type FeatureRowsProps, featureRowsSchema, parseBlock } from "@/lib/blocks/schemas";
import { FeatureRowArt } from "./feature-row-art";
import { SectionHeader } from "./section-header";

// The comp's three feature rows: copy on the left against a drawing on the
// right, the same way round every time. The comp does not alternate sides, and
// that is the point of the layout rather than an omission -- three rows all
// starting in the same place read as a list, and three that zig-zag read as
// three unrelated sections.
//
// What is authorable is the copy. The drawings are fixed artwork indexed by
// position; see feature-row-art.tsx for why, and schemas.ts for the exactly-three
// rule that follows from it.
//
// Measured off the Paper comp (page Desktop, artboard "feature-cards / 2 --
// Rows"): a 496px text column against the rest of the row, a 56px gutter
// between them, and each row opening on a rule.

export function FeatureRows(raw: FeatureRowsProps) {
  const { eyebrow, title, rows } = parseBlock("FeatureRows", featureRowsSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16 sm:py-20">
        <SectionHeader eyebrow={eyebrow} title={title} />

        {/* Each row carries its own top rule and the list closes itself with a
            bottom one, so no two rules ever stack -- the same arrangement the
            logo ledger and the stats band use for their grids. */}
        <ul className="mt-12 border-border border-b">
          {rows.map((row, index) => (
            <li
              className="flex flex-col gap-6 border-border border-t py-4 lg:flex-row lg:items-center lg:gap-0"
              // Title and body together: the schema constrains neither to be
              // unique, and two rows could legitimately share a title under
              // different copy.
              key={`${row.title}-${row.body}`}
            >
              <div className="flex flex-col gap-3 lg:w-100 lg:shrink-0 lg:pr-14 xl:w-124">
                <div className="flex items-baseline gap-3">
                  {/* Derived from position, never a prop: a number an author
                      could set is a number that can contradict the row's actual
                      place in the list. Same treatment article-toc.tsx gives
                      its entries. */}
                  <span className="shrink-0 font-mono text-xs tracking-widest text-subtle-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-subtitle font-medium text-foreground">{row.title}</h3>
                </div>
                {/* The same max-w-md SectionHeader holds its lede to. It only bites
                    in the stacked layout, where the column is the whole page
                    inset and an uncapped line would run to 700px. */}
                <p className="max-w-md text-base text-pretty text-muted-foreground">{row.body}</p>
                {row.link && (
                  // TextLink, not ButtonLink: the comp draws a text link with a
                  // chevron here, not a button.
                  <TextLink className="mt-1" href={row.link.href} label={row.link.label} />
                )}
              </div>

              <FeatureRowArt index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
