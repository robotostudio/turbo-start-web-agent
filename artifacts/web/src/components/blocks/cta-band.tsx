import Link from "next/link";
import { type CtaBandProps, ctaBandSchema, parseBlock } from "@/lib/blocks/schemas";

export function CtaBand(raw: CtaBandProps) {
  const { title, lede, primary } = parseBlock("CTA", ctaBandSchema, raw);

  return (
    <section className="bg-primary font-sans">
      <div className="page-inset flex flex-col items-center gap-5 py-20 text-center sm:py-24">
        <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance text-primary-foreground sm:text-5xl">
          {title}
        </h2>
        {lede && <p className="max-w-sm text-lg text-pretty text-primary-foreground/80">{lede}</p>}
        {primary.href.startsWith("/") ? (
          <Link
            href={primary.href}
            className="rounded-lg bg-background px-6 py-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
          >
            {primary.label}
          </Link>
        ) : (
          <a
            href={primary.href}
            className="rounded-lg bg-background px-6 py-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
          >
            {primary.label}
          </a>
        )}
      </div>
    </section>
  );
}
