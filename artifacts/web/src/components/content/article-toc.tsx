import { TocActive } from "./toc-active";

// The article side panel: a sticky rail listing the post's `##` sections.
//
// Server component. The entries come from Velite's build-time `s.toc()` (see
// the blog collection in velite.config.ts) and their slugs match the heading
// ids rehype-slug stamps into the body, so every jump link resolves with no
// client JS at all — the panel is fully usable before (and without) hydration.
// The one client island is `TocActive`, which only marks which entry is
// currently on screen.
//
// Collapsible via native <details>/<summary> rather than React state, for the
// same reason: it opens and closes with JS disabled. It ships `open`, which
// is what a rail should be on a desktop viewport; on a phone, where the panel
// stacks above the article instead of beside it, that is also where a reader
// can fold it away.

export interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

export function ArticleToc({ toc }: { toc: TocEntry[] }) {
  if (toc.length === 0) return null;

  return (
    // `self-start` is what makes `sticky` work inside the article grid: a grid
    // item stretches to the row's full height by default, which leaves the
    // sticky box no room to travel within its own containing block and so
    // silently does nothing. `top-24` clears the header, which is itself
    // sticky at `top-4` (site-header.tsx) plus its own height.
    <aside className="order-1 font-sans lg:sticky lg:top-24 lg:order-2 lg:self-start">
      <details open className="group/toc rounded-lg border border-border p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground select-none [&::-webkit-details-marker]:hidden">
          On this page
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-open/toc:rotate-180"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>

        {/* `data-toc` is TocActive's entry point, and `data-toc-link` marks
            the links it toggles `data-active` on — the attributes are the
            contract between this server-rendered markup and that island, so
            neither has to know anything else about the other. */}
        <ol data-toc className="mt-4 flex flex-col gap-3">
          {toc.map((entry, index) => (
            <li key={entry.url}>
              <a
                href={entry.url}
                data-toc-link
                className="flex items-baseline gap-3 text-sm leading-snug text-muted-foreground transition-colors hover:text-foreground data-[active]:font-medium data-[active]:text-foreground"
              >
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {entry.title}
              </a>
            </li>
          ))}
        </ol>
      </details>
      <TocActive />
    </aside>
  );
}
