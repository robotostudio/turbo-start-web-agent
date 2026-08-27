import { type ComparisonProps, comparisonSchema, parseBlock } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function Comparison(raw: ComparisonProps) {
  const { title, lede, rows } = parseBlock("Comparison", comparisonSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <SectionHeader title={title} lede={lede} />
        <div className="mt-16 overflow-x-auto sm:mt-20">
          <table className="w-full min-w-xl border-collapse text-left text-base">
            <caption className="sr-only">
              Comparison of this approach and the traditional approach
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th className="w-1/3 pb-4 pr-6 font-semibold text-muted-foreground" scope="col">
                  Criteria
                </th>
                <th className="w-1/3 pb-4 px-6 font-semibold text-foreground" scope="col">
                  Us
                </th>
                <th className="w-1/3 pb-4 pl-6 font-semibold text-muted-foreground" scope="col">
                  The old way
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.criteria} className="border-b border-border last:border-b-0">
                  <th className="py-5 pr-6 font-semibold text-foreground" scope="row">
                    {row.criteria}
                  </th>
                  <td className="px-6 py-5 text-pretty text-foreground">{row.us}</td>
                  <td className="py-5 pl-6 text-pretty text-muted-foreground">{row.traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

Comparison.displayName = "Comparison";
