// Shared section-heading markup — a title and an optional supporting lede,
// nothing else. Deliberately NOT registered in blockSchemas or
// blockComponents: it's a layout fragment a Block renders internally, not a
// Block an author composes with. Registering it would have it list itself in
// its own gallery and skew blockCount (see block-spec.tsx for the same
// reasoning).
//
// Every section opens with a STATEMENT, never a label — there is no eyebrow
// and no coloured rule above the title. That pattern was explicitly rejected
// as generic; don't reintroduce it here.
//
// max-w-2xl (title) and max-w-md (lede) are the measures most Blocks already
// converged on before this file existed — picked as canonical over max-w-xl
// and max-w-md-on-title variants that had drifted in a few Blocks, and kept
// at text-4xl (no sm:text-5xl bump) since the plain 4xl was already the
// majority and Hero already owns the larger register for the one h1 per
// page.
export function SectionHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <>
      {/* font-normal is not decoration: the comp sets every section title at
          400, where this was 600. It is the single largest visual difference
          between the old type and the new, and changing it here moves every
          section at once. `text-title` carries the -0.48px tracking, so the
          old `tracking-tight` (-0.025em, about -0.9px here) is gone. */}
      <h2 className="max-w-2xl text-title font-normal text-balance text-foreground">{title}</h2>
      {lede && <p className="mt-4 max-w-md text-lede text-pretty text-muted-foreground">{lede}</p>}
    </>
  );
}
