import { site } from "#velite";
import { type ComparisonProps, comparisonSchema, parseBlock } from "@/lib/blocks/schemas";
import { CheckMark, DashMark } from "./ledger-marks";
import { SectionHeader } from "./section-header";

// The redesign's comparison, drawn in Paper as "comparison / redesign" (and a
// 375px frame beside it): a ruled table whose recommended column sits on a
// faint raised panel under a pink rule, each answer led by a pink check, with
// the alternative muted behind a dash.
//
// Two renderings of the same rows, switched in CSS rather than script: a real
// <table> from md, and below that a stacked list, because three columns of
// prose do not fit a phone and the old table scrolled sideways. display: none
// takes the hidden one out of the accessibility tree too, so a screen reader
// only ever meets one of them.
//
// The recommended column is headed by the site's name from site.yml unless
// the content says otherwise, so no component names the brand.

const LABEL = "font-mono text-eyebrow uppercase";

export function Comparison(raw: ComparisonProps) {
  const { eyebrow, title, lede, usLabel, traditionalLabel, rows } = parseBlock(
    "Comparison",
    comparisonSchema,
    raw,
  );
  const us = usLabel ?? site.name;

  return (
    <section className="font-sans">
      <div className="page-inset py-16 lg:py-22">
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-4">
          <div>
            <SectionHeader eyebrow={eyebrow} title={title} />
          </div>
          {lede && (
            <p className="max-w-80 pb-1.5 text-base text-muted-foreground text-pretty leading-6.5">
              {lede}
            </p>
          )}
        </div>

        <table className="mt-14 hidden w-full table-fixed border-collapse border-border border-b text-left text-base md:table">
          <caption className="sr-only">
            Comparison of {us} and {traditionalLabel}
          </caption>
          <thead>
            <tr>
              <th
                className={`w-2/7 pt-6 pr-8 pb-4.5 align-bottom font-normal text-subtle-foreground ${LABEL}`}
                scope="col"
              >
                Criteria
              </th>
              <th
                className={`border-primary border-t-2 bg-foreground/3 px-8 pt-6 pb-4.5 align-bottom font-normal text-foreground ${LABEL}`}
                scope="col"
              >
                {us}
              </th>
              <th
                className={`px-8 pt-6 pb-4.5 align-bottom font-normal text-subtle-foreground ${LABEL}`}
                scope="col"
              >
                {traditionalLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-border border-t" key={row.criteria}>
                <th
                  className="py-5.5 pr-8 align-top font-normal text-foreground leading-6.5"
                  scope="row"
                >
                  {row.criteria}
                </th>
                <td className="bg-foreground/3 px-8 py-5.5 align-top">
                  <div className="flex gap-3">
                    <CheckMark className="mt-1.5 size-3.5 shrink-0 text-primary" />
                    <span className="text-pretty text-foreground leading-6.5">{row.us}</span>
                  </div>
                </td>
                <td className="px-8 py-5.5 align-top">
                  <div className="flex gap-3">
                    <DashMark className="mt-1.5 size-3.5 shrink-0 text-subtle-foreground" />
                    <span className="text-muted-foreground text-pretty leading-6.5">
                      {row.traditional}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* The phone rendering: each row stacked, the recommended answer on
            its panel with the pink rule down its edge instead of across the
            top. */}
        <ul className="mt-10 border-border border-b md:hidden">
          {rows.map((row) => (
            <li className="border-border border-t pt-5.5 pb-6" key={row.criteria}>
              <h3 className="text-foreground text-lg">{row.criteria}</h3>
              <dl className="mt-3.5 flex flex-col gap-3.5">
                <div className="border-primary border-l-2 bg-foreground/3 px-4 py-3.5">
                  <dt className={`text-foreground ${LABEL}`}>{us}</dt>
                  <dd className="mt-1.5 text-base text-foreground">{row.us}</dd>
                </div>
                <div className="px-4.5">
                  <dt className={`text-subtle-foreground ${LABEL}`}>{traditionalLabel}</dt>
                  <dd className="mt-1.5 text-base text-muted-foreground">{row.traditional}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

Comparison.displayName = "Comparison";
