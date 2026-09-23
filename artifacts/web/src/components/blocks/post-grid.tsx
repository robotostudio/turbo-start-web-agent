import { PostCard } from "@/components/content/post-card";
import { TextLink } from "@/components/ui/text-link";
import { type PostGridProps, parseBlock, postGridSchema } from "@/lib/blocks/schemas";
import { getEntries } from "@/lib/content/loader";
import { SectionHeader } from "./section-header";

// The one Block whose cards are not authored props (see postGridSchema's
// .describe()) — `title`/`lede`/`count`/`category` come from parseBlock, but
// the posts themselves come straight from the blog collection, sorted newest
// first, same as /blog (src/app/blog/page.tsx). Keeping the query here rather
// than duplicating post copy into MDX props is deliberate: a highlights grid
// with its own stale title/excerpt is exactly the kind of drift the rest of
// this template goes out of its way to avoid (see the `toc` field's comment
// in velite.config.ts for the same reasoning applied to a different field).
export function PostGrid(raw: PostGridProps) {
  const { eyebrow, title, lede, count, category, allPostsLabel } = parseBlock(
    "PostGrid",
    postGridSchema,
    raw,
  );

  const posts = getEntries("blog")
    .filter((entry) => !category || entry.data.category === category)
    .sort((a, b) => (a.data.pubDate < b.data.pubDate ? 1 : -1))
    .slice(0, count);

  return (
    <section className="font-sans">
      <div className="page-inset py-16">
        {/* The heading and the link to /blog share a row, bottom-aligned as the
            comp sets them; on a narrow screen the link wraps under the title. */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <SectionHeader eyebrow={eyebrow} lede={lede} title={title} />
          </div>
          <TextLink className="shrink-0 pb-1.5" href="/blog" label={allPostsLabel} />
        </div>
        {posts.length > 0 ? (
          // Two to a row on a tablet, three from lg. The cards share no rules,
          // unlike the Testimonial ledger, so a third card alone on a tablet's
          // second row is just a card, not a gap in a frame.
          <ul className="mt-13 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          // A valid but empty category (or a fresh site with no posts yet) is
          // a legitimate content state, not a build error — parseBlock can't
          // validate live collection data, only the props shape, so this is
          // the render-time fallback rather than a thrown error.
          <p className="mt-13 text-muted-foreground">No posts published yet.</p>
        )}
      </div>
    </section>
  );
}
