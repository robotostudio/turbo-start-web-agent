import Image from "next/image";

// Direction: Framed Split — deliberate contrast against the house "no
// chrome" rule. The visual sits in a bordered frame instead of resting on
// bare whitespace; used sparingly, only here across the FeatureSplit set.
export function FeatureSplitFramed() {
  const points = [
    "Ten CSS variables cover color, radius, and type",
    "Rebrand a client site without touching a component",
    "Every block reads the same tokens, so nothing drifts",
  ];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-x-12 gap-y-10 lg:grid-cols-2">
          <div>
            <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              One token file controls the whole site.
            </h2>
            <ul className="mt-8 flex flex-col gap-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground"
                  />
                  <span className="text-base text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border p-3">
            <Image
              src="https://assets.ui.sh/screenshots/1.webp?top=1200&left=1600&position=bottom-right"
              alt=""
              width={1600}
              height={1200}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-4/3 w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
