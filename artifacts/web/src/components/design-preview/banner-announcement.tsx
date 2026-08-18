// Direction: Announcement — centered, reads as a product update rather than
// a utility notice.
export function BannerAnnouncement() {
  return (
    <section className="border-b border-border font-sans">
      <div className="page-inset flex flex-col items-center gap-1 py-3 text-center sm:flex-row sm:justify-center sm:gap-3">
        <p className="text-sm text-foreground">
          Harbour 2.0 is here — a block system built for agencies.
        </p>
        <a
          href="/about"
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
        >
          See what shipped
        </a>
      </div>
    </section>
  );
}
