import Image from "next/image";
import { type GalleryProps, gallerySchema, parseBlock } from "@/lib/blocks/schemas";

// Fixed mosaic layout, keyed by tile position (0-indexed) — see
// `galleryImageCount` in schemas.ts for why the shape is not authorable.
// Tiles 0 and 5 are always wide; tiles 6 and 7 are wide on mobile (a single
// column would otherwise leave them half-width) and square from `sm` up.
const TILE_CLASS_NAMES = [
  "relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-lg",
  "relative aspect-square w-full overflow-hidden rounded-lg",
  "relative aspect-square w-full overflow-hidden rounded-lg",
  "relative aspect-square w-full overflow-hidden rounded-lg",
  "relative aspect-square w-full overflow-hidden rounded-lg",
  "relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-lg",
  "relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-lg sm:col-span-1 sm:aspect-square",
  "relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-lg sm:col-span-1 sm:aspect-square",
];

// Matches TILE_CLASS_NAMES' col-span behaviour so the browser doesn't
// download a source sized for the wrong slot at each breakpoint.
const TILE_SIZES = [
  "(min-width: 640px) 50vw, 100vw",
  "(min-width: 640px) 25vw, 50vw",
  "(min-width: 640px) 25vw, 50vw",
  "(min-width: 640px) 25vw, 50vw",
  "(min-width: 640px) 25vw, 50vw",
  "(min-width: 640px) 50vw, 100vw",
  "(min-width: 640px) 25vw, 100vw",
  "(min-width: 640px) 25vw, 100vw",
];

export function Gallery(raw: GalleryProps) {
  const { title, subtitle, images } = parseBlock("Gallery", gallerySchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:mt-20 sm:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.src} className={TILE_CLASS_NAMES[index]}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={TILE_SIZES[index]}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
