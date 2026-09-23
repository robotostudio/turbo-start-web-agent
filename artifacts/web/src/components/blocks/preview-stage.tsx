import { type PreviewStageProps, parseBlock, previewStageSchema } from "@/lib/blocks/schemas";
import { PreviewStageArt } from "./preview-stage-art";
import { SectionHeader } from "./section-header";

// The comp's preview stage: a heading over a full-bleed picture of this site
// being edited in place, Hero selected, toolbar up, an agent's cursor on it.
// Only the heading is authored. The picture is fixed artwork in
// preview-stage-art.tsx, for the reason feature-row-art.tsx gives for its own:
// it illustrates the copy beside it, and means nothing with other copy.
//
// Measured off the Paper comp: 64px above the heading and 64px under it, then
// the 760px stage, which carries its own space at the foot. The stage sits
// outside page-inset, full bleed, the way the Hero's textured band does.
export function PreviewStage(raw: PreviewStageProps) {
  const { eyebrow, title, lede } = parseBlock("PreviewStage", previewStageSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16">
        <SectionHeader eyebrow={eyebrow} lede={lede} title={title} />
      </div>

      {/* The canvas inside is a fixed 1440x760 composition, scaled in steps:
          36% on a phone, 50% from sm, 70% from md, full size from lg. The
          canvas is transformed, so it takes no layout space of its own: this
          box is given the scaled height at each step (760 x 0.36, 0.50, 0.70,
          1.00) and crops the faded edges either side. 36% is what keeps both
          status pills, which span 238-1210 of the 1440, inside a 375px
          screen; 42% cut the right-hand one off mid-word. */}
      <div className="relative h-68.5 overflow-hidden sm:h-95 md:h-133 lg:h-190">
        <PreviewStageArt />
      </div>
    </section>
  );
}
