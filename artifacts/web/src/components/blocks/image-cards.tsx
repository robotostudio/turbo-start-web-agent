import { CardImage } from "@/components/content/card-image";
import { type ImageCardsProps, imageCardsSchema, parseBlock } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

// The redesign's card, as PostGrid draws it: the shared 4:3 frame on its
// hairline, the title in the subtitle role, then muted body copy. Not links,
// so no hover state: nothing here is clickable.
export function ImageCards(raw: ImageCardsProps) {
  const { eyebrow, title, cards } = parseBlock("ImageCards", imageCardsSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="mt-13 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title}>
              {/* Unlike a post's cover, these pictures carry the content, so
                  they keep the alt text the author wrote. */}
              <CardImage alt={card.image.alt} src={card.image.src} />
              <h3 className="mt-5 text-balance text-foreground text-subtitle">{card.title}</h3>
              <p className="mt-3 max-w-sm text-pretty text-base text-muted-foreground">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
