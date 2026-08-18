// Direction: Recessed Band — logos and caption sit inside a muted well
// instead of bare background, the one variant in this set that separates the
// block from the page with a surface change rather than whitespace alone.
export function LogoCloudBand() {
  const logos = ["align", "artifact", "axiom", "concise", "looply", "orbital"];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="rounded-card bg-muted px-6 py-12 sm:px-12 sm:py-16">
          <p className="max-w-md text-lg text-pretty text-muted-foreground">
            Powering marketing sites for teams like these.
          </p>
          <div className="mt-10 grid grid-cols-3 items-center gap-x-8 gap-y-10 sm:mt-12 sm:grid-cols-6">
            {logos.map((logo) => (
              <img
                key={logo}
                src={`https://assets.ui.sh/logos/${logo}.svg?color=zinc-400&height=28`}
                alt={logo}
                className="h-7 w-auto justify-self-center"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
