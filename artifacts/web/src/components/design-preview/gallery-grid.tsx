import Image from "next/image";

// Direction: Even Grid — uniform 3-column tiles, generous gutter, no size
// variation. The airy baseline reading of the Gallery block.
export function GalleryGrid() {
  const tiles = [
    { variant: "valley", label: "Mountain valley wallpaper" },
    { variant: "coast", label: "Coastal beach wallpaper" },
    { variant: "meadow", label: "Alpine meadow wallpaper" },
    { variant: "forest", label: "Pine forest wallpaper" },
    { variant: "lake", label: "Twilight lake wallpaper" },
    { variant: "dunes", label: "Desert dunes wallpaper" },
  ];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          Wallpapers, ready for a hero background.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          Every wallpaper in the set, at the same crop, so any of them can swap in without
          reshuffling the layout.
        </p>
        <div className="mt-14 grid grid-cols-2 gap-6 sm:mt-20 lg:grid-cols-3">
          {tiles.map((tile) => (
            <div
              key={tile.variant}
              className="relative aspect-4/3 w-full overflow-hidden rounded-lg"
            >
              <Image
                src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${tile.variant}`}
                alt={tile.label}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
