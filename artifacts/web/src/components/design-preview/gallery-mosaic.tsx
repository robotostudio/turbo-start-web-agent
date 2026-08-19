import Image from "next/image";

// Direction: Mosaic — tiles vary in size instead of sitting on a uniform
// grid. Size comes from each tile's own aspect ratio plus a column span, not
// from row-spanning, so the layout stays simple at every breakpoint.
export function GalleryMosaic() {
  const wide = [
    { variant: "arctic-fjord", label: "Arctic fjord wallpaper" },
    { variant: "pampas-grassland", label: "Pampas grassland wallpaper" },
  ];
  const square = [
    { variant: "basalt-plateau", label: "Basalt plateau wallpaper" },
    { variant: "fossil-cliffs", label: "Fossil cliffs wallpaper" },
    { variant: "highland-moors", label: "Highland moors wallpaper" },
    { variant: "hills", label: "Rolling hills wallpaper" },
    { variant: "limestone-karst", label: "Limestone karst wallpaper" },
    { variant: "misty-marshland", label: "Misty marshland wallpaper" },
  ];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          Wallpapers, ready for a hero background.
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
          A wide crop for full-bleed heroes, square crops for everything smaller.
        </p>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:mt-20 sm:grid-cols-4">
          <div className="relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-lg">
            <Image
              src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${wide[0].variant}`}
              alt={wide[0].label}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${square[0].variant}`}
              alt={square[0].label}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${square[1].variant}`}
              alt={square[1].label}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${square[2].variant}`}
              alt={square[2].label}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${square[3].variant}`}
              alt={square[3].label}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-lg">
            <Image
              src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${wide[1].variant}`}
              alt={wide[1].label}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-lg sm:col-span-1 sm:aspect-square">
            <Image
              src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${square[4].variant}`}
              alt={square[4].label}
              fill
              sizes="(min-width: 640px) 25vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-2 aspect-16/9 w-full overflow-hidden rounded-lg sm:col-span-1 sm:aspect-square">
            <Image
              src={`https://assets.ui.sh/wallpapers/landscapes.webp?variant=${square[5].variant}`}
              alt={square[5].label}
              fill
              sizes="(min-width: 640px) 25vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
