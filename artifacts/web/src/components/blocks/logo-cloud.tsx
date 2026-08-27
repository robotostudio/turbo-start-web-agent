import { type LogoCloudProps, logoCloudSchema, parseBlock } from "@/lib/blocks/schemas";

type Logo = { src: string; alt: string };

// The keyframe translates exactly -50%, so the track must be two identical
// halves, each at least a viewport wide or a gap shows where the second copy
// has not arrived. Four rows a half covers past 3000px.
const REPEATS = 4;
const HALVES = Array.from({ length: REPEATS * 2 }, (_, i) => i);

// Not next/image: these are `unoptimized`, so it contributed only its
// aspect-ratio warning, which compares the rendered box against one
// width/height pair that logos of differing ratios cannot share.
const LogoRow = ({ logos, duplicate = false }: { logos: Logo[]; duplicate?: boolean }) => (
  <div className="flex shrink-0 items-center gap-x-16" aria-hidden={duplicate || undefined}>
    {logos.map((logo) => (
      // biome-ignore lint/performance/noImgElement: unoptimized SVGs of varying aspect ratio.
      <img key={logo.src} src={logo.src} alt={duplicate ? "" : logo.alt} className="h-7 w-auto" />
    ))}
  </div>
);

export function LogoCloud(raw: LogoCloudProps) {
  const { lede, logos } = parseBlock("LogoCloud", logoCloudSchema, raw);

  return (
    <section className="font-sans">
      <div className="section-y">
        <p className="page-inset mx-auto max-w-2xl text-center type-heading text-foreground">
          {lede}
        </p>

        <div className="mt-[34px] hidden overflow-hidden motion-safe:block">
          <div className="flex w-max animate-marquee items-center gap-x-16 [animation-duration:60s]">
            {HALVES.map((half) => (
              <LogoRow key={half} logos={logos} duplicate={half >= REPEATS} />
            ))}
          </div>
        </div>

        <div className="page-inset mt-[34px] hidden grid-cols-3 place-items-center gap-x-16 gap-y-8 motion-reduce:grid lg:grid-cols-6">
          {logos.map((logo) => (
            // biome-ignore lint/performance/noImgElement: unoptimized SVGs of varying aspect ratio.
            <img key={logo.src} src={logo.src} alt={logo.alt} className="h-7 w-auto" />
          ))}
        </div>
      </div>
    </section>
  );
}
