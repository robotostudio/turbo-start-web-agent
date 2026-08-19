import Image from "next/image";

// Direction: Tight Grid — two columns, near-zero gutter, tiles pressed
// against each other. Deliberate contrast against the airy default gutter
// used everywhere else in the Gallery set.
export function GalleryTight() {
  const tiles = [
    { variant: "arctic-fjord", label: "Arctic fjord wallpaper" },
    { variant: "salt-crust-expanse", label: "Salt crust expanse wallpaper" },
    { variant: "snow", label: "Snowfield wallpaper" },
    { variant: "weathered-badlands", label: "Weathered badlands wallpaper" },
  ];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          Wallpapers, ready for a hero background.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Packed close together for a quick side-by-side comparison.
        </p>
        <div className="mt-14 grid grid-cols-2 gap-1 sm:mt-20">
          {tiles.map((tile) => (
            <div key={tile.variant} className="relative aspect-square w-full overflow-hidden">
              <Image
                src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${tile.variant}`}
                alt={tile.label}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
