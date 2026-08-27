import Image from "next/image";
import { type GalleryProps, gallerySchema, parseBlock } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

// Tiles 0, 1, 6, 7 span 2 columns; 2-5 are square. 4x2 + 4 = 12 spans divides
// exactly by the 4-column grid, so there is no ragged hole on the last row.
const WIDE = new Set([0, 1, 6, 7]);

export function Gallery(raw: GalleryProps) {
  const { title, lede, images } = parseBlock("Gallery", gallerySchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset section-y">
        <SectionHeader title={title} lede={lede} />
        <div className="stack-content grid grid-cols-2 gap-4 lg:grid-cols-4">
          {images.map((image, index) => {
            const wide = WIDE.has(index);
            return (
              <div
                key={image.src}
                className={
                  wide
                    ? "relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-media"
                    : "relative aspect-square w-full overflow-hidden rounded-media"
                }
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={wide ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
