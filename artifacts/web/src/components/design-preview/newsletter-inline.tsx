// Direction: Inline — centered heading group with the input and submit
// button sitting on one row, close beneath the copy.
export function NewsletterInline() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <h2 className="mx-auto max-w-lg text-3xl font-semibold tracking-tight text-balance text-foreground">
              Get notified when new blocks ship.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-lg text-pretty text-muted-foreground">
              One email a month. New Blocks, template updates, no noise.
            </p>
          </div>
          <form
            method="post"
            action="#"
            className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-primary px-6 py-3 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
