import { type FaqProps, faqSchema, parseBlock } from "@/lib/blocks/schemas";

export function Faq(raw: FaqProps) {
  const { title, faqs } = parseBlock("Faq", faqSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          {title}
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
