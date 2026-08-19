// Direction: Band — deliberate contrast variant. A full-bleed brand-colored
// band rather than an inset box or the bare page, pushed further than the
// other two CTA treatments.
export function CtaBand() {
  return (
    <section className="bg-primary font-sans">
      <div className="page-inset flex flex-col items-center gap-5 py-20 text-center sm:py-24">
        <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance text-primary-foreground sm:text-5xl">
          Your next client site starts from Harbour.
        </h2>
        <p className="max-w-sm text-lg text-pretty text-primary-foreground/80">
          Six Blocks, one token file, zero lock-in. Clone it and start editing this afternoon.
        </p>
        <a
          href="https://github.com"
          className="rounded-lg bg-background px-6 py-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
        >
          Clone the repo
        </a>
      </div>
    </section>
  );
}
