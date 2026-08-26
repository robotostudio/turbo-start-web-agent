import Link from "next/link";
import { type PostGridProps, parseBlock, postGridSchema } from "@/lib/blocks/schemas";
import { getEntries } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
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
  const { title, lede, count, category } = parseBlock("PostGrid", postGridSchema, raw);

  const posts = getEntries("blog")
    .filter((entry) => !category || entry.data.category === category)
    .sort((a, b) => (a.data.pubDate < b.data.pubDate ? 1 : -1))
    .slice(0, count);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <SectionHeader title={title} lede={lede} />
        {posts.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-muted-foreground">
                  <span>{post.data.category}</span>
                  <span aria-hidden="true" className="text-muted-foreground/50">
                    /
                  </span>
                  <time dateTime={post.data.pubDate}>{formatDate(post.data.pubDate)}</time>
                </p>
                <h3 className="mt-3 text-lg font-semibold text-foreground transition-colors group-hover:underline">
                  {post.data.title}
                </h3>
                {post.data.excerpt ? (
                  <p className="mt-2 line-clamp-3 text-pretty text-muted-foreground">
                    {post.data.excerpt}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          // A valid but empty category (or a fresh site with no posts yet) is
          // a legitimate content state, not a build error — parseBlock can't
          // validate live collection data, only the props shape, so this is
          // the render-time fallback rather than a thrown error.
          <p className="mt-14 text-muted-foreground">No posts published yet.</p>
        )}
      </div>
    </section>
  );
}
