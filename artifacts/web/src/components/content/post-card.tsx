import Image from "next/image";
import Link from "next/link";
import { groundAt } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";
import type { Entry } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
import { cardFrame } from "./card-image";

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

// The vignette over a cover-less card's texture. Only drawn when a post has no
// cover: a cover brings its own picture.
//
// Deliberately the INVERSE of the comp's card vignette (82% at the centre, 0%
// at the rim). The comp darkens the middle to seat the pill or panel each of
// its covers puts there; a cover-less card has nothing in the middle, and
// rendered with the comp's stops it showed as a dark hole ringed by bright
// texture. Clear in the centre and darkening outward, the field reads as a bed
// on its own, the way the footer's and the CTA's do.
const CARD_VIGNETTE = `radial-gradient(ellipse 70% 70% at 50% 50% in oklab, ${groundAt(0)} 0%, ${groundAt(42)} 58%, ${groundAt(82)} 100%)`;

export function PostCard({
  post,
  featured = false,
  headingLevel = "h3",
}: {
  post: Entry<"blog">;
  /** The lead post on the /blog index: the cover beside the text rather than
   * above it, a larger title, and the excerpt. Its cover loads with priority,
   * since it is the largest image on that page. */
  featured?: boolean;
  /** h3 under a section's own h2, as in PostGrid; h2 on the /blog index, where
   * the cards sit directly under the page's h1. */
  headingLevel?: "h2" | "h3";
}) {
  const { title, category, pubDate, cover, excerpt } = post.data;
  const Heading = headingLevel;

  const media = (
    <div
      className={
        // A standalone card sits in the shared card frame (card-image.tsx),
        // hairline and all. The featured card's panel is the frame instead,
        // so its cover takes only the rule that divides it from the text:
        // below it when stacked, beside it from lg.
        featured
          ? "relative aspect-4/3 overflow-hidden border-border border-b lg:col-span-7 lg:border-r lg:border-b-0"
          : cardFrame
      }
    >
      {cover ? (
        // alt="" because the title follows directly: describing the picture
        // would only put a second, vaguer name for the post in front of it.
        <Image
          alt=""
          className="object-cover"
          fill
          priority={featured}
          sizes={
            featured
              ? "(min-width: 1024px) 58vw, 100vw"
              : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          }
          src={cover}
        />
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
  );

  const meta = (
    <p className="flex items-center gap-2.75">
      <span className="font-mono text-eyebrow text-muted-foreground uppercase">{category}</span>
      <span aria-hidden="true" className="size-0.75 shrink-0 rounded-full bg-subtle-foreground" />
      <time className="text-sm text-muted-foreground" dateTime={pubDate}>
        {formatDate(pubDate)}
      </time>
    </p>
  );

  if (featured) {
    // A bordered panel, the way FeaturedQuote frames its one quote: the cover
    // flush in the frame's left, the text in the rest with room round it,
    // vertically centred on the cover. Meta leads here, the way an article's
    // own header sets it, because the excerpt follows the title and the meta
    // line would otherwise sit between two paragraphs of prose.
    return (
      <Link
        className="group grid grid-cols-1 border border-border lg:grid-cols-12"
        href={`/blog/${post.slug}`}
      >
        {media}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:col-span-5 lg:px-12">
          {meta}
          {/* 30px on a phone, the title role from sm: the same step the CTA's
              heading takes, for the same reason. */}
          <Heading className="mt-4 text-3xl text-balance text-foreground group-hover:underline sm:text-title">
            {title}
          </Heading>
          {excerpt && (
            <p className="mt-4 max-w-md text-lede text-pretty text-muted-foreground">{excerpt}</p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link className="group block" href={`/blog/${post.slug}`}>
      {media}
      <Heading className="mt-5 text-subtitle text-foreground group-hover:underline">
        {title}
      </Heading>
      <div className="mt-3">{meta}</div>
    </Link>
  );
}
