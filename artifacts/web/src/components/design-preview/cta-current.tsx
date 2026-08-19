// Faithful port of the current CTA Block (src/components/blocks/cta.tsx),
// boxed variant, using the copy it actually renders today on the home page.
// Comparison baseline — not a new direction.
export function CtaCurrent() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted px-8 py-16 text-center">
          <h2 className="font-sans text-3xl text-foreground">Start from this template</h2>
          <p className="max-w-xl text-muted-foreground">
            Compose pages from Blocks. The build is the gate.
          </p>
          <a href="/about" className="rounded-lg bg-primary px-6 py-3 text-primary-foreground">
            About Harbour
          </a>
        </div>
      </div>
    </section>
  );
}
