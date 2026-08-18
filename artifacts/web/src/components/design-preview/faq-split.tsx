import { faqs } from "@/components/design-preview/data";

// Direction: Even Field, two-column grid. Question stacked above answer
// within each cell, whitespace alone separates pairs — no dividers. Doubling
// the column count halves the answer width, so answers stay short-lined and
// readable without truncation.
export function FaqSplit() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          Before you clone the repo, read this.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Six answers that used to be a week of onboarding calls.
        </p>
        <dl className="mt-14 grid grid-cols-1 gap-x-12 gap-y-12 sm:mt-20 sm:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-2">
              <dt className="text-lg font-semibold text-foreground">{faq.question}</dt>
              <dd className="max-w-sm text-base text-pretty text-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
