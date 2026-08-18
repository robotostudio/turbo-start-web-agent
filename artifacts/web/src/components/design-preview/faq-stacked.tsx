import { faqs } from "@/components/design-preview/data";

// Direction: Even Field, static list. Single column, question stacked above
// answer, divider-separated rows. No accordion — length is solved by giving
// every answer room to breathe instead of hiding it behind interaction.
export function FaqStacked() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          Answers to what you&apos;d ask before cloning it.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Everything the sales call would cover, written down instead.
        </p>
        <dl className="mt-14 divide-y divide-foreground/10 border-t border-foreground/10 sm:mt-20">
          {faqs.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-3 py-8 first:pt-0 last:pb-0">
              <dt className="text-lg font-semibold text-foreground">{faq.question}</dt>
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
