import { type FaqProps, faqSchema, parseBlock } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function Faq(raw: FaqProps) {
  const { title, faqs } = parseBlock("Faq", faqSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset section-y">
        <div className="mx-auto max-w-3xl">
          <SectionHeader title={title} />
          <div className="stack-content">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="group border-t border-foreground/10 last:border-b"
              >
                <summary className="flex cursor-pointer list-none select-none items-start justify-between gap-8 py-6 type-lead font-medium text-balance text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  >
                    <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="max-w-prose pb-6 type-para text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
