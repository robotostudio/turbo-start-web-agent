// Faithful port of the current Hero Block (src/components/blocks/hero.tsx),
// centered variant, using the copy it actually renders today on the home
// page. Comparison baseline — not a new direction.
export function HeroCurrent() {
  return (
    <section className="font-sans">
      <div className="page-inset flex flex-col items-center gap-6 py-20 text-center">
        <h1 className="font-sans text-5xl text-foreground lg:text-6xl">
          Your website, editable by any AI agent
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Harbour is a starter marketing site. Your developers keep working in git; your team edits
          through the agent they already use.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="/about" className="rounded-lg bg-primary px-6 py-3 text-primary-foreground">
            Read the docs
          </a>
          <a
            href="/blocks-gallery"
            className="rounded-lg border border-border px-6 py-3 text-foreground"
          >
            View the blocks
          </a>
        </div>
      </div>
    </section>
  );
}
