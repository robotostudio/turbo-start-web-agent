import { faqs } from "@/components/design-preview/data";

// Direction: Even Field, ledger rhythm. Single column, question and answer
// share a line at sm+ (stacked on mobile), whitespace alone separates pairs
// — no dividers. Solves length by giving the answer its own wide column
// instead of compressing it.
export function FaqColumns() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          The questions every agency asks first.
        </h2>
        <dl className="mt-14 flex flex-col gap-12 sm:mt-20 sm:gap-10">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-10"
            >
              <dt className="text-lg font-semibold text-foreground sm:w-72 sm:shrink-0">
                {faq.question}
              </dt>
              <dd className="max-w-prose text-base text-pretty text-muted-foreground">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
