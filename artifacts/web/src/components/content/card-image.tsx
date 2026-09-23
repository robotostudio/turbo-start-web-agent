import Image from "next/image";
import { cn } from "@/lib/utils";

// The redesign's card frame: 4:3, clipped, on the ledger's hairline. Drawn
// once here so every card on the site sits in the same box, whether it holds a
// post's cover (PostCard) or a showcase image (ImageCards).

/** The frame alone, for a card that fills it with something other than one
 * image: PostCard draws its textured fallback inside it. */
export const cardFrame = "relative aspect-4/3 overflow-hidden outline outline-ledger-rule";

/** An image in the card frame, cropped to fill it. */
export function CardImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  className,
}: {
  src: string;
  alt: string;
  /** The default is the three-column card grid PostGrid and ImageCards share. */
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={cn(cardFrame, className)}>
      <Image alt={alt} className="object-cover" fill sizes={sizes} src={src} />
    </div>
  );
}
