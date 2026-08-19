import Image from "next/image";

// Direction: Even Row — a single row of logos on the bare page background,
// wrapping into a balanced 3+3 on narrow screens instead of an uneven split.
export function LogoCloudRow() {
  const logos = ["align", "artifact", "axiom", "concise", "looply", "orbital"];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <p className="max-w-md text-lg text-pretty text-muted-foreground">
          Powering marketing sites for teams like these.
        </p>
        <div className="mt-10 grid grid-cols-3 items-center gap-x-8 gap-y-10 sm:mt-14 sm:grid-cols-6">
          {logos.map((logo) => (
            <Image
              key={logo}
              src={`https://assets.ui.sh/logos/${logo}.svg?color=zinc-400&height=28`}
              alt={logo}
              width={120}
              height={28}
              unoptimized
              className="h-7 w-auto justify-self-center"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
