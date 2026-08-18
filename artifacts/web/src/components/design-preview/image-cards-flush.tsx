// Direction: Flush Cards — no boundary at all. The image sits directly on
// the page background with only rounded corners; title and body sit below
// it in the same whitespace rhythm as the rest of the house style.
export function ImageCardsFlush() {
  const cards = [
    {
      title: "Agency portfolio",
      body: "A five-page site for a three-person studio, live two days after the kickoff call.",
      color: "mauve",
    },
    {
      title: "SaaS marketing site",
      body: "Pricing, changelog, and docs pulled from three different content sources.",
      color: "mist",
    },
    {
      title: "Client rebrand",
      body: "Same block tree, new tokens — the whole site retheme took an afternoon.",
      color: "olive",
    },
  ];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          Built on the same six blocks.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3 sm:mt-20">
          {cards.map((card) => (
            <div key={card.title} className="group">
              <div className="aspect-4/3 w-full overflow-hidden rounded-card">
                <img
                  src={`https://assets.ui.sh/screenshots/1.webp?top=900&left=1200&position=bottom-right&color=${card.color}`}
                  alt=""
                  width={1200}
                  height={900}
                  className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-110"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 max-w-xs text-base text-pretty text-muted-foreground">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
