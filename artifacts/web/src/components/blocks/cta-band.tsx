import { ButtonLink } from "@/components/ui/button-link";
import { type CtaBandProps, ctaBandSchema, parseBlock } from "@/lib/blocks/schemas";

export function CtaBand(raw: CtaBandProps) {
  const { title, lede, primary } = parseBlock("CTA", ctaBandSchema, raw);

  return (
    <section className="bg-primary font-sans">
      <div className="page-inset flex flex-col items-center gap-5 py-20 text-center sm:py-24">
        {/* Does not use SectionHeader (its title colour is fixed to
            --foreground, and this one sits on the primary band), so it carries
            the title role by hand. Keep the weight at 400 to match every other
            section title; it was 600 before the redesign. */}
        <h2 className="max-w-md text-title font-normal text-balance text-primary-foreground">
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
