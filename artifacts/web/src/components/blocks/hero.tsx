import { ButtonLink } from "@/components/ui/button-link";
import { type HeroProps, heroSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

export function Hero(raw: HeroProps) {
  const { variant, title, lede, primary, secondary } = parseBlock("Hero", heroSchema, raw);

  return (
    <section className="font-sans">
      <div
        className={cn(
          "page-inset flex flex-col gap-6 py-20",
          variant === "centered" ? "items-center text-center" : "items-start text-left",
        )}
      >
        {/* text-display is the comp's 64/70 at -0.48px. It only applies from
            lg up; below that the old text-5xl still reads better on a narrow
            screen than 64px does. */}
        <h1 className="font-sans text-5xl text-foreground lg:text-display">{title}</h1>
        {lede && <p className="max-w-2xl text-lede text-muted-foreground">{lede}</p>}
        {(primary || secondary) && (
          <div className="flex flex-wrap gap-4">
            {primary && <ButtonLink href={primary.href} label={primary.label} />}
            {secondary && (
              <ButtonLink href={secondary.href} label={secondary.label} variant="outline" />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
