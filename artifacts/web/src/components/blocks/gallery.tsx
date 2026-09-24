import Image from "next/image";
import { type GalleryProps, gallerySchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";
import { LedgerCorners } from "./ledger";
import { SectionHeaderSplit } from "./section-header";

// The redesign's gallery, drawn in Paper as "gallery / redesign": the eight
// images in three even rows, square-cornered on the ledger hairline, with the
// grid's crosshairs set out past the gap. See `galleryImageCount` in
// schemas.ts for why the count, and so the shape, is not authorable.
//
// From md the mosaic is four columns: wide, square, square / square, square,
// wide / wide, wide -- twelve units, three full rows. The old mosaic added up
// to ten, which left its last row half empty. Wide tiles in the first two
// rows take the square tiles' height (no aspect of their own); the last row
// has no square to take it from, so its wide tiles carry 2/1, which lands
// within half a gap of the rows above. Below md, two columns: squares in
// pairs and every wide tile full width at 2/1.
const FRAME = "relative overflow-hidden outline outline-ledger-rule";
const TILES = [
  { className: "col-span-2 aspect-2/1 md:aspect-auto", sizes: "(min-width: 768px) 50vw, 100vw" },
  { className: "aspect-square", sizes: "(min-width: 768px) 25vw, 50vw" },
  { className: "aspect-square", sizes: "(min-width: 768px) 25vw, 50vw" },
  { className: "aspect-square", sizes: "(min-width: 768px) 25vw, 50vw" },
  { className: "aspect-square", sizes: "(min-width: 768px) 25vw, 50vw" },
  { className: "col-span-2 aspect-2/1 md:aspect-auto", sizes: "(min-width: 768px) 50vw, 100vw" },
  { className: "col-span-2 aspect-2/1", sizes: "(min-width: 768px) 50vw, 100vw" },
  { className: "col-span-2 aspect-2/1", sizes: "(min-width: 768px) 50vw, 100vw" },
];

export function Gallery(raw: GalleryProps) {
  const { eyebrow, title, lede, images } = parseBlock("Gallery", gallerySchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16 lg:py-22">
        <SectionHeaderSplit eyebrow={eyebrow} lede={lede} title={title} />
        <div className="relative mt-14">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {images.map((image, index) => (
              <div className={cn(FRAME, TILES[index].className)} key={image.src}>
                <Image
                  alt={image.alt}
                  className="object-cover"
                  fill
                  sizes={TILES[index].sizes}
                  src={image.src}
                />
              </div>
            ))}
          </div>
          <LedgerCorners away />
        </div>
      </div>
    </section>
  );
}
