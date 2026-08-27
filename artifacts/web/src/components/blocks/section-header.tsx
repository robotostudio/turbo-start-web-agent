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
// at the `type-heading` role (no larger bump) since 4xl was already the majority
// and Hero already owns `type-display`, the larger register for the one h1
// per page.
export function SectionHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <>
      <h2 className="max-w-2xl type-heading text-foreground">{title}</h2>
      {lede && <p className="stack-lede max-w-md type-lead text-muted-foreground">{lede}</p>}
    </>
  );
}
