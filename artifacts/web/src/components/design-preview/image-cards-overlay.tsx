// Direction: Overlay Cards — title and body sit on top of the image behind a
// bottom scrim instead of underneath it. Each card links out, and the crop is
// a taller portrait ratio to leave room for the scrim.
export function ImageCardsOverlay() {
  const cards = [
    {
      title: "Agency portfolio",
      body: "Five pages, live two days after kickoff.",
      color: "mauve",
      href: "#",
    },
    {
      title: "SaaS marketing site",
      body: "Pricing and docs from three content sources.",
      color: "mist",
      href: "#",
    },
    {
      title: "Client rebrand",
      body: "New tokens, same block tree, one afternoon.",
      color: "stone",
      href: "#",
    },
  ];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          A few of the sites this shipped.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:mt-20">
          {cards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group relative block overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <img
                src={`https://assets.ui.sh/screenshots/1.webp?top=900&left=1200&position=bottom-right&color=${card.color}`}
                alt=""
                width={1200}
                height={900}
                className="aspect-4/5 w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-110 motion-safe:group-focus-visible:scale-110"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/80 via-black/25 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-1 max-w-2xs text-base text-pretty text-white/80 sm:text-sm">
                  {card.body}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
