import type { Metadata } from "next";
import { site } from "#velite";
import { PostCard } from "@/components/content/post-card";
import { getEntries } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Blog",
  description: `News, updates, and writing from the ${site.name} team.`,
};

// Newest first — pubDate is an ISO datetime string (Velite's s.isodate()), so
// lexical and chronological order agree without a Date parse.
const sortedPosts = () =>
  [...getEntries("blog")].sort((a, b) => (a.data.pubDate < b.data.pubDate ? 1 : -1));

// The newest post leads, large, with its cover beside its excerpt; everything
// after it sits in the same card grid the home page's blog row uses. Both are
// PostCard (components/content/post-card.tsx), so a post looks the same
// wherever it is listed, and its picture is always its own `cover`.
export default function BlogIndex() {
  const [lead, ...rest] = sortedPosts();

  return (
    // The outer page-inset is what `header + .page-inset` in globals.css
    // matches to clear the sticky header, so it stays the outermost element.
    <div className="page-inset pb-24 font-sans">
      {/* Left-aligned at the page gutter, not centred in it, like every other
          prose route: /privacy and /terms via ProseBlock (mdx-content.tsx), and
          an article via its own two-column grid. */}
      <div className="max-w-3xl">
        {/* The interior-page heading size the Hero's centered and left variants
            use, so /blog opens at the same scale as the pages beside it. */}
        <h1 className="text-5xl text-foreground lg:text-display">Blog</h1>
        <p className="mt-6 max-w-xl text-lede text-pretty text-muted-foreground">
          {site.blogIntro}
        </p>
      </div>

      {lead ? (
        <>
          <div className="mt-14 sm:mt-16">
            <PostCard featured headingLevel="h2" post={lead} />
          </div>

          {/* No rule above the grid: the featured post's own frame already
              closes it off. Every card title is an h2, directly under the
              page's h1 with no section heading between them to make them h3s. */}
          {rest.length > 0 && (
            <ul className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post.slug}>
                  <PostCard headingLevel="h2" post={post} />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="mt-14 text-muted-foreground">No posts published yet.</p>
      )}
    </div>
  );
}
