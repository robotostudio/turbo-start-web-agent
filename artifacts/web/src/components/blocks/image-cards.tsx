import Image from "next/image";
import { type ImageCardsProps, imageCardsSchema, parseBlock } from "@/lib/blocks/schemas";

export function ImageCards(raw: ImageCardsProps) {
  const { title, cards } = parseBlock("ImageCards", imageCardsSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          {title}
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="group">
              <div className="aspect-4/3 w-full overflow-hidden rounded-lg">
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  width={1200}
                  height={900}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-110"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 max-w-xs text-base text-pretty text-muted-foreground">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
