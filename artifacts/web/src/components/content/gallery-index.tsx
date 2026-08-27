import { readFileSync } from "node:fs";
import { join } from "node:path";
import { blockAnchor } from "@/components/blocks/block-spec";
import { TocActive } from "@/components/content/toc-active";
import catalog from "@/lib/blocks/catalog.json";

const blockNames = Object.keys(catalog.blocks);

const GALLERY_MDX = join(process.cwd(), "content", "pages", "blocks-gallery.mdx");
const SECTION = /^<BlockSpec name="([A-Za-z][A-Za-z0-9]*)"( status="todo")?/gm;

const readStatuses = (): Map<string, boolean> => {
  const source = readFileSync(GALLERY_MDX, "utf8");
  const statuses = new Map<string, boolean>();
  for (const [, name, todo] of source.matchAll(SECTION)) {
    if (!statuses.has(name)) statuses.set(name, todo !== undefined);
  }
  return statuses;
};

export function GalleryIndex() {
  const statuses = readStatuses();
  const missing = blockNames.filter((name) => statuses.get(name)).length;

  return (
    <nav
      aria-label="Blocks in this gallery"
      className="font-sans lg:sticky lg:top-24 lg:max-h-[calc(100svh-8rem)] lg:self-start lg:overflow-y-auto"
    >
      <p className="type-overline font-mono uppercase text-muted-foreground">
        {catalog.blockCount} blocks
        {missing > 0 ? ` · ${missing} without an example` : ""}
      </p>

      <ol
        data-gallery-index
        className="stack-lede flex gap-x-5 gap-y-1 overflow-x-auto pb-3 lg:flex-col lg:gap-0 lg:overflow-x-visible lg:pb-0"
      >
        {blockNames.map((name, index) => (
          <li key={name}>
            <a
              href={`#${blockAnchor(name)}`}
              data-gallery-link
              className="flex items-baseline gap-2 whitespace-nowrap py-1 type-caption text-muted-foreground transition-colors hover:text-foreground data-active:font-medium data-active:text-foreground"
            >
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              {name}
              {statuses.get(name) && (
                <span className="text-muted-foreground/60" title="No example yet">
                  ·
                </span>
              )}
            </a>
          </li>
        ))}
      </ol>

      <TocActive container="[data-gallery-index]" link="a[data-gallery-link]" />
    </nav>
  );
}
