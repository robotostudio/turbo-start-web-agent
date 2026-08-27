import Link from "next/link";
import { type HeroProps, heroSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

const actionBase =
  "inline-flex h-12.5 w-full items-center justify-center rounded-full border border-transparent px-5 text-base font-medium sm:w-auto sm:min-w-45";

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

type Action = { label: string; href: string };

const Actions = ({ primary, secondary }: { primary?: Action; secondary?: Action }) => (
  <div className="stack-content flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
    {primary && (
      <ActionLink link={primary} className={cn(actionBase, "bg-primary text-primary-foreground")} />
    )}
    {secondary && (
      <ActionLink link={secondary} className={cn(actionBase, "bg-card text-foreground")} />
    )}
  </div>
);

export function Hero(raw: HeroProps) {
  const { variant, title, lede, primary, secondary } = parseBlock("Hero", heroSchema, raw);

  return (
    <section className="relative z-10 p-3 font-sans sm:p-4">
      <div className="relative flex min-h-(--hero-min-height) w-full flex-col justify-center overflow-hidden rounded-panel">
        <div
          className={cn(
            "relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 py-10 sm:px-8",
            variant === "centered"
              ? "items-center text-center [&>*]:mx-auto"
              : "items-start text-left",
          )}
        >
          <h1 className="w-full max-w-4xl type-display text-foreground">{title}</h1>
          {lede && (
            <p className="stack-near w-full max-w-lede type-lead text-muted-foreground">{lede}</p>
          )}
          {(primary || secondary) && <Actions primary={primary} secondary={secondary} />}
        </div>
      </div>
    </section>
  );
}
