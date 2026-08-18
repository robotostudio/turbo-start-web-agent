// Direction: Utility — left-aligned status strip with the link set apart on
// the right, reading as a system notice rather than a promotion.
export function BannerUtility() {
  return (
    <section className="border-b border-border font-sans">
      <div className="page-inset flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm text-muted-foreground">
          You are viewing a template preview. Content is placeholder.
        </p>
        <a
          href="/about"
          className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground sm:shrink-0"
        >
          Read the docs
        </a>
      </div>
    </section>
  );
}
