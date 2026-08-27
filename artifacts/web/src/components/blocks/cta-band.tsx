import { ButtonLink } from "@/components/ui/button-link";
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
        {/* `inverse` because this band is primary-filled: the default variant
            is primary-on-background and would vanish into it. */}
        <ButtonLink href={primary.href} label={primary.label} variant="inverse" />
      </div>
    </section>
  );
}
