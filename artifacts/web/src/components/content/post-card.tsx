import Image from "next/image";
import Link from "next/link";
import { groundAt } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";
import type { Entry } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";

// One post as a card: its cover, its title, and a category-and-date line.
// Everything comes from the post's own frontmatter, never from the page that
// shows the card, so a card cannot disagree with the article it links to.
//
// Shared rather than private to PostGrid, because the /blog index is meant to
// adopt it too: one card, whichever page the list of posts is on.
//
// Measured off the Paper comp ("content-cards / A — Editorial 3-up"): a 4:3
// media frame (432x324) on a 7% white hairline, a 20px gap, then the title at
// 21/29 (the subtitle role, 22/30) and a meta line 12px under it.

// The comp's vignette over a card's texture. Only drawn when a post has no
// cover: a cover brings its own picture, and the comp's covers already carry
// this same treatment baked in.
const CARD_VIGNETTE = `radial-gradient(ellipse 70% 70% at 50% 50% in oklab, ${groundAt(82)} 0%, ${groundAt(42)} 58%, ${groundAt(0)} 100%)`;

export function PostCard({
  post,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
}: {
  post: Entry<"blog">;
  /** The `sizes` hint for the cover, for a layout other than PostGrid's. */
  sizes?: string;
}) {
  const { title, category, pubDate, cover } = post.data;

  return (
    <Link className="group block" href={`/blog/${post.slug}`}>
      <div className="relative aspect-4/3 overflow-hidden outline outline-ledger-rule">
        {cover ? (
          // alt="" because the title follows directly: describing the picture
          // would only put a second, vaguer name for the post in front of it.
          <Image alt="" className="object-cover" fill sizes={sizes} src={cover} />
        ) : (
          // A post with no cover still gets a designed card rather than an
          // empty box: the site's texture, still, under the comp's vignette.
          <>
            <div className="absolute inset-0">
              <GridField animate={false} className="size-full opacity-60" preset="dense" />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ backgroundImage: CARD_VIGNETTE }}
            />
          </>
        )}
      </div>

      <h3 className="mt-5 text-subtitle text-foreground group-hover:underline">{title}</h3>
      <p className="mt-3 flex items-center gap-2.75">
        <span className="font-mono text-eyebrow text-muted-foreground uppercase">{category}</span>
        <span aria-hidden="true" className="size-0.75 shrink-0 rounded-full bg-subtle-foreground" />
        <time className="text-sm text-muted-foreground" dateTime={pubDate}>
          {formatDate(pubDate)}
        </time>
      </p>
    </Link>
  );
}
