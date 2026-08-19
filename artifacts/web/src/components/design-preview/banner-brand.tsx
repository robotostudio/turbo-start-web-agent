// Direction: Brand — deliberate contrast variant. Full-bleed brand-colored
// strip instead of a neutral one, pushed further than the other two.
export function BannerBrand() {
  return (
    <section className="bg-primary font-sans">
      <div className="page-inset flex flex-col items-center gap-1 py-3 text-center sm:flex-row sm:justify-center sm:gap-3">
        <p className="text-sm text-primary-foreground">Now shipping: the Harbour block system.</p>
        <a
          href="/blocks-gallery"
          className="text-sm font-medium text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/80"
        >
          Explore the blocks
        </a>
      </div>
    </section>
  );
}
