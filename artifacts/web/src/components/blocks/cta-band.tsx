import Link from "next/link";
import { type CtaBandProps, ctaBandSchema, parseBlock } from "@/lib/blocks/schemas";

const actionClass =
  "inline-flex h-13 items-center justify-center rounded-full bg-background px-6 text-base font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background";

export function CtaBand(raw: CtaBandProps) {
  const { title, lede, primary } = parseBlock("CTA", ctaBandSchema, raw);

  return (
    <section className="px-3 font-sans section-y sm:px-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center rounded-panel bg-cta px-6 py-20 text-center sm:px-12 sm:py-28">
        <h2 className="max-w-3xl type-title text-cta-foreground">{title}</h2>
        {lede && <p className="stack-lede max-w-sm type-para text-cta-foreground/70">{lede}</p>}
        <div className="stack-near">
          {primary.href.startsWith("/") ? (
            <Link href={primary.href} className={actionClass}>
              {primary.label}
            </Link>
          ) : (
            <a href={primary.href} className={actionClass}>
              {primary.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
