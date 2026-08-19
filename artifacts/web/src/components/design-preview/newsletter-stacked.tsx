// Direction: Stacked — left-aligned, input and button stacked vertically
// beneath the explanatory copy rather than sharing a row.
export function NewsletterStacked() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          Stay in the loop as Harbour ships new blocks.
        </h2>
        <p className="mt-3 max-w-md text-lg text-pretty text-muted-foreground">
          A short email whenever a new Block, template, or guideline goes live. Unsubscribe any
          time.
        </p>
        <form method="post" action="#" className="mt-8 flex max-w-xs flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            aria-label="Email address"
            className="rounded-lg border border-border px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
