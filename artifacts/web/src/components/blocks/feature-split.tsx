import Image from "next/image";
import { type FeatureSplitProps, featureSplitSchema, parseBlock } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function FeatureSplit(raw: FeatureSplitProps) {
  const { title, lede, points, image } = parseBlock("FeatureSplit", featureSplitSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset section-y">
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          <div className="flex flex-col card p-8 sm:p-12">
            <SectionHeader title={title} lede={lede} />
            {points && points.length > 0 && (
              <ul className="stack-near flex flex-col gap-2">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground"
                    />
                    <span className="type-para text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="h-full overflow-hidden rounded-card">
            <Image
              src={image.src}
              alt={image.alt}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="size-full min-h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
