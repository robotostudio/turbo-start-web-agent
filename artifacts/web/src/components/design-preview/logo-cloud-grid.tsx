// Direction: Full Grid — all nine partner logos on the bare page background,
// arranged as an even 3x3 rather than a single row. No caption; the block
// speaks for itself.
export function LogoCloudGrid() {
  const logos = [
    "align",
    "artifact",
    "axiom",
    "concise",
    "looply",
    "orbital",
    "pinelabs",
    "quirk",
    "relay",
  ];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="grid grid-cols-3 items-center gap-x-8 gap-y-12 sm:gap-y-16">
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
    </section>
  );
}
