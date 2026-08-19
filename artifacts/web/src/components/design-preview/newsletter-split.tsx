// Direction: Split — deliberate contrast variant. Explanatory copy and the
// form sit in separate columns instead of stacked, so the form reads as set
// apart from its text rather than close beneath it.
export function NewsletterSplit() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:items-start lg:gap-16">
          <div className="lg:col-span-3">
            <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground">
              The Harbour newsletter.
            </h2>
            <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
              Release notes for new Blocks and template updates, written for the person who has to
              explain them to a client. Roughly monthly.
            </p>
          </div>
          <form method="post" action="#" className="flex flex-col gap-3 lg:col-span-2">
            <label htmlFor="newsletter-split-email" className="text-sm text-muted-foreground">
              Email address
            </label>
            <div className="flex gap-3">
              <input
                id="newsletter-split-email"
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-primary px-6 py-3 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
