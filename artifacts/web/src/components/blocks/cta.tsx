import Link from "next/link";
import { type CtaProps, ctaSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

export function CTA(raw: CtaProps) {
  const { variant, title, body, primary } = parseBlock("CTA", ctaSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20">
        <div
          className={cn(
            "flex flex-col items-center gap-4 text-center",
            variant === "boxed" && "rounded-card border border-border bg-muted px-8 py-16",
          )}
        >
          <h2 className="font-heading text-3xl text-foreground">{title}</h2>
          {body && <p className="max-w-xl text-muted-foreground">{body}</p>}
          {primary &&
            (primary.href.startsWith("/") ? (
              <Link
                href={primary.href}
                className="rounded-card bg-brand px-6 py-3 text-brand-foreground"
              >
                {primary.label}
              </Link>
            ) : (
              <a
                href={primary.href}
                className="rounded-card bg-brand px-6 py-3 text-brand-foreground"
              >
                {primary.label}
              </a>
            ))}
        </div>
      </div>
    </section>
  );
}
