// Direction: Left Statement — left-aligned, headline dominates the type
// scale, supporting line and actions kept close beneath it rather than
// separated by a lot of whitespace.
export function HeroLeft() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h1 className="max-w-2xl text-6xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
          Ship client sites your team can edit without you.
        </h1>
        <p className="mt-4 max-w-md text-xl text-pretty text-muted-foreground">
          Harbour composes pages from Blocks and reads content straight out of git — no CMS login,
          no staging drift.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/about"
            className="rounded-card bg-brand px-6 py-3 text-brand-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Read the docs
          </a>
          <a
            href="/blocks-gallery"
            className="rounded-card border border-border px-6 py-3 text-foreground"
          >
            View the blocks
          </a>
        </div>
      </div>
    </section>
  );
}
