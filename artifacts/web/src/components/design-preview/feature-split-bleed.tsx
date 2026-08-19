import Image from "next/image";

// Direction: Bleed Split — visual sits left and runs flush to the viewport
// edge, past the shared page-inset gutter, instead of stopping at the
// container. Text is a single running paragraph, not a list.
export function FeatureSplitBleed() {
  return (
    <section className="font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
        <div className="relative order-2 aspect-3/2 h-full w-full overflow-hidden lg:order-1 lg:aspect-auto">
          <Image
            src="https://assets.ui.sh/screenshots/1.webp?color=mist"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 flex flex-col justify-center px-6 py-16 sm:px-8 sm:py-20 lg:order-2 lg:px-16 lg:py-24 xl:px-24">
          <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Swap the CMS without rewriting a single block.
          </h2>
          <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
            Blocks render from one shape — title, body, media, links. Point that shape at Markdown,
            Sanity, or a flat JSON file and the component never has to know which one is behind it.
            Moving off a CMS later means changing one adapter, not six hundred lines of JSX.
          </p>
        </div>
      </div>
    </section>
  );
}
