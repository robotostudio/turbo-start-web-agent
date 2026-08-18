// Direction: Plain — bare page, no recessed box. Even Field carried into the
// closing section: whitespace and type do the work, no container at all.
export function CtaPlain() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance text-foreground">
            Clone Harbour and ship the first page today.
          </h2>
          <p className="max-w-sm text-lg text-pretty text-muted-foreground">
            No account, no setup call. The template is MIT-licensed and ready to edit.
          </p>
          <a
            href="https://github.com"
            className="rounded-card bg-brand px-6 py-3 text-brand-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Clone the repo
          </a>
        </div>
      </div>
    </section>
  );
}
