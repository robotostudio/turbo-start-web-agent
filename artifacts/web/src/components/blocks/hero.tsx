import Link from "next/link";
import { type HeroProps, heroSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

const ActionLink = ({
  link,
  className,
}: {
  link: { label: string; href: string };
  className?: string;
}) =>
  link.href.startsWith("/") ? (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  );

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
        <h1 className="font-sans text-5xl text-foreground lg:text-6xl">{title}</h1>
        {lede && (
          <p className="max-w-2xl text-pretty text-lg leading-relaxed tracking-tight text-foreground">
            {lede}
          </p>
        )}
        {(primary || secondary) && (
          <div className="flex flex-wrap gap-4">
            {primary && (
              <ActionLink
                link={primary}
                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground"
              />
            )}
            {secondary && (
              <ActionLink
                link={secondary}
                className="rounded-lg border border-border px-6 py-3 text-foreground"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
