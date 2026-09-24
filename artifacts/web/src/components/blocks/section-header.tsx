// Shared section-heading markup — an optional eyebrow, a title, an optional
// right-hand meta note, and an optional supporting lede. Deliberately NOT
// registered in blockSchemas or blockComponents: it's a layout fragment a
// Block renders internally, not a Block an author composes with. Registering
// it would have it list itself in its own gallery and skew blockCount (see
// block-spec.tsx for the same reasoning).
//
// THE EYEBROW RULE WAS REVERSED. This file used to say that every section
// opens with a STATEMENT and never a label, that there is no eyebrow and no
// coloured rule above the title, and that the pattern had been "explicitly
// rejected as generic". The 2026-09 redesign is built on exactly that
// pattern: six of the nine sections in the comp open with an accent tick and
// a small-caps label. The rule lost to a design, which is the honest reason,
// and it is recorded here rather than deleted so nobody re-argues it from
// scratch. The original objection still holds for a label that only restates
// the title — "OUR FEATURES" above "Our features" is still noise. The comp's
// work because they say something the title does not.
//
// Both new props are optional and both default to absent, so a Block that
// passes neither renders exactly the markup it rendered before.
//
// max-w-2xl (title) and max-w-md (lede) are the measures most Blocks already
// converged on before this file existed — picked as canonical over max-w-xl
// and max-w-md-on-title variants that had drifted in a few Blocks.
export function SectionHeader({
  title,
  lede,
  eyebrow,
  meta,
}: {
  title: string;
  lede?: string;
  eyebrow?: string;
  meta?: string;
}) {
  // font-normal is not decoration: the comp sets every section title at 400,
  // where this was 600. `text-title` carries the -0.48px tracking, so the old
  // `tracking-tight` (-0.025em, about -0.9px here) is gone.
  const heading = (
    <h2 className="max-w-2xl text-title font-normal text-balance text-foreground">{title}</h2>
  );

  return (
    <>
      {eyebrow && (
        <p className="mb-4 flex items-center gap-3.5">
          {/* The 4x10 accent tick from the comp. Decorative: the label beside
              it carries the meaning, so it is hidden from assistive tech. */}
          <span aria-hidden="true" className="h-2.5 w-1 shrink-0 rounded-full bg-primary" />
          <span className="font-mono text-eyebrow uppercase text-muted-foreground">{eyebrow}</span>
        </p>
      )}

      {/* Only wrapped when there is a meta note to place opposite the title.
          Without one the h2 stays a direct child, so every Block that passes
          neither new prop renders the identical tree it did before. */}
      {meta ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          {heading}
          <span className="font-mono text-eyebrow uppercase text-muted-foreground">{meta}</span>
        </div>
      ) : (
        heading
      )}

      {lede && <p className="mt-4 max-w-md text-lede text-pretty text-muted-foreground">{lede}</p>}
    </>
  );
}

/** The header with its lede opposite the title, bottom-aligned, as the
 * redesign's ledger sections set it (FeatureGrid, Comparison, Team, Pricing,
 * Gallery). On a narrow screen the lede wraps under the title instead. */
export function SectionHeaderSplit({
  title,
  lede,
  eyebrow,
}: {
  title: string;
  lede?: string;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-4">
      <div>
        <SectionHeader eyebrow={eyebrow} title={title} />
      </div>
      {lede && (
        <p className="max-w-80 pb-1.5 text-base text-muted-foreground text-pretty leading-6.5">
          {lede}
        </p>
      )}
    </div>
  );
}
