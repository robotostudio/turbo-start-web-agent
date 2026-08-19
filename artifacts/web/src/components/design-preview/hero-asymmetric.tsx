// Direction: Asymmetric Split — deliberate contrast variant, pushed further
// than the other two. Headline and supporting content sit in separate
// columns instead of one stacked block, so the headline reads as the
// dominant element and the supporting text/actions feel set apart from it.
export function HeroAsymmetric() {
  return (
    <section className="font-sans">
      <div className="page-inset py-24 sm:py-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <h1 className="max-w-lg text-6xl font-semibold tracking-tight text-balance text-foreground sm:max-w-2xl sm:text-7xl lg:col-span-7 lg:max-w-4xl lg:text-8xl">
            A website your client&apos;s marketing team can actually run.
          </h1>
          <div className="flex flex-col items-start gap-6 lg:col-span-5 lg:pb-2">
            <p className="max-w-sm text-lg text-pretty text-muted-foreground">
              Harbour hands off editing to whatever AI agent the team already uses, while your
              codebase stays exactly where you left it.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/about"
                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
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
        </div>
      </div>
    </section>
  );
}
