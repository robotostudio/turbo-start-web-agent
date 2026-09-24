import { CardImage } from "@/components/content/card-image";
import { groundAt } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";
import { type FeatureSplitProps, featureSplitSchema, parseBlock } from "@/lib/blocks/schemas";
import { CheckMark } from "./ledger-marks";
import { SectionHeader } from "./section-header";

// The redesign's split, drawn in Paper as "feature-split / redesign": the copy
// and a ruled list of points in a 480px column, beside the image in the shared
// 4:3 card frame (card-image.tsx), floating on a still bed of the site's
// texture the way PreviewStage's stage does.

// The stage's vignette: a light scrim under the image, clearing a ring where
// the texture shows, then back to the page at the rim so the bed has no edge.
const STAGE_VIGNETTE = `radial-gradient(ellipse 60% 60% at 50% 50% in oklab, ${groundAt(70)} 0%, ${groundAt(20)} 60%, ${groundAt(100)} 100%)`;

export function FeatureSplit(raw: FeatureSplitProps) {
  const { eyebrow, title, lede, points, image } = parseBlock(
    "FeatureSplit",
    featureSplitSchema,
    raw,
  );

  return (
    <section className="font-sans">
      <div className="page-inset flex flex-col gap-12 py-16 lg:flex-row lg:items-center lg:gap-14 lg:py-22">
        <div className="lg:w-120 lg:shrink-0">
          <SectionHeader eyebrow={eyebrow} lede={lede} title={title} />
          {points && points.length > 0 && (
            <ul className="mt-10 border-border border-b">
              {points.map((point) => (
                <li className="flex items-start gap-3.5 border-border border-t py-4" key={point}>
                  <CheckMark className="mt-1.25 size-3.5 shrink-0 text-primary" />
                  <span className="text-base text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* The stage. The bed is decorative and still: presets.ts keeps the
            animated register to the Hero and the CTA. */}
        <div className="relative isolate flex min-w-0 flex-1 items-center justify-center px-6 py-10 sm:px-12 lg:py-13">
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            <GridField
              animate={false}
              className="size-full opacity-35"
              preset="dense"
              tile={{ width: "66rem", position: "100% 80%" }}
            />
            <div className="absolute inset-0" style={{ backgroundImage: STAGE_VIGNETTE }} />
          </div>
          <CardImage
            alt={image.alt}
            className="w-full max-w-160 shadow-(--shadow-stage-window)"
            sizes="(min-width: 1024px) 45vw, 100vw"
            src={image.src}
          />
        </div>
      </div>
    </section>
  );
}
