import Image from "next/image";
import { type ImageCardsProps, imageCardsSchema, parseBlock } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function ImageCards(raw: ImageCardsProps) {
  const { title, cards } = parseBlock("ImageCards", imageCardsSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset section-y">
        <SectionHeader title={title} />
        <div className="stack-content grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="group flex flex-col card p-2">
              <div className="aspect-4/3 w-full overflow-hidden rounded-media">
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  width={1200}
                  height={900}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-110"
                />
              </div>
              <div className="p-3">
                <h3 className="type-subheading text-foreground">{card.title}</h3>
                <p className="stack-tight type-para text-muted-foreground">{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
