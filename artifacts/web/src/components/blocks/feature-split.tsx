import Image from "next/image";
import { type FeatureSplitProps, featureSplitSchema, parseBlock } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function FeatureSplit(raw: FeatureSplitProps) {
  const { title, lede, points, image } = parseBlock("FeatureSplit", featureSplitSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-x-12 gap-y-10 lg:grid-cols-2">
          <div>
            <SectionHeader title={title} lede={lede} />
            {points && points.length > 0 && (
              <ul className="mt-8 flex flex-col gap-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground"
                    />
                    <span className="text-base text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="overflow-hidden rounded-lg outline-1 -outline-offset-1 outline-black/10">
            <Image
              src={image.src}
              alt={image.alt}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-4/3 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
