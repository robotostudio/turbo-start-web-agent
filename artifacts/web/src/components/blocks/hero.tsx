import Image from "next/image";
import { HeroPromptCard } from "@/components/blocks/hero-prompt-card";
import { GridField } from "@/components/texture/grid-field";
import { ButtonLink } from "@/components/ui/button-link";
import { type HeroProps, heroSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

export function Hero(raw: HeroProps) {
  const { variant, title, lede, primary, secondary, prompt, model, agents, agentsLabel } =
    parseBlock("Hero", heroSchema, raw);

  // text-display is the comp's 64/70 at -0.48px. It only applies from lg up;
  // below that the old text-5xl still reads better on a narrow screen than 64px
  // does. Optional in every variant, because the home comp's hero drops the
  // headline and opens on the lede.
  const heading = title ? (
    <h1 className="font-sans text-5xl text-foreground lg:text-display">{title}</h1>
  ) : null;

  const ctas =
    primary || secondary ? (
      <div className="flex flex-wrap items-center gap-4">
        {primary && <ButtonLink href={primary.href} label={primary.label} />}
        {secondary && (
          <ButtonLink href={secondary.href} label={secondary.label} variant="outline" />
        )}
      </div>
    ) : null;

  if (variant === "showcase") {
    return (
      <section className="font-sans">
        {/* The comp holds the opening copy to a 576px column against the left
            edge of the page inset, with the calls to action and the agent marks
            on one line under it. */}
        <div className="page-inset flex flex-col items-start gap-6 py-16 lg:py-20">
          {heading}
          {lede && <p className="max-w-xl text-lede text-balance text-muted-foreground">{lede}</p>}
          <div className="flex flex-wrap items-center gap-4">
            {ctas}
            {agents && agents.length > 0 && (
              <div className="flex items-center gap-2">
                <ul className="flex items-center gap-2">
                  {agents.map((agent) => (
                    <li className="flex" key={agent.src}>
                      <Image alt={agent.alt} height={20} src={agent.src} width={20} />
                    </li>
                  ))}
                </ul>
                <span className="text-base text-muted-foreground">{agentsLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* The textured band, full bleed, so it sits outside page-inset and the
            card inside it brings its own. h-108 is 432px against the comp's 430:
            the nearest step on the spacing scale, which is worth two pixels to
            keep an arbitrary height out of a Block. Below sm it drops to the
            320px the footer's own texture bed uses, both because 432px is most
            of a phone screen and because the texture scales to cover: two beds
            of different heights on a narrow viewport resolve to different cell
            sizes, and the field then looks denser in one section than another.

            `pointer` is on here and nowhere else on purpose — grid-field.tsx
            notes it "suits one large placement and reads as a gimmick on six",
            and this band is that one placement. */}
        <div className="relative h-80 sm:h-108">
          <div className="absolute inset-0 overflow-hidden">
            <GridField className="size-full" pointer band preset="dense" />
          </div>
          {prompt && prompt.length > 0 && (
            <div className="page-inset absolute inset-x-0 top-1/2 -translate-y-1/2">
              <HeroPromptCard model={model} prompt={prompt} />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="font-sans">
      <div
        className={cn(
          "page-inset flex flex-col gap-6 py-20",
          variant === "centered" ? "items-center text-center" : "items-start text-left",
        )}
      >
        {heading}
        {lede && <p className="max-w-2xl text-lede text-muted-foreground">{lede}</p>}
        {ctas}
      </div>
    </section>
  );
}
