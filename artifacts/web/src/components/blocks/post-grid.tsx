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
      <div className="page-inset section-y">
        <SectionHeader title={title} lede={lede} />
        {posts.length > 0 ? (
          <div className="stack-content grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <p className="flex flex-wrap items-center gap-2 type-caption font-mono text-muted-foreground">
                  <span>{post.data.category}</span>
                  <span aria-hidden="true" className="text-muted-foreground/50">
                    /
                  </span>
                  <time dateTime={post.data.pubDate}>{formatDate(post.data.pubDate)}</time>
                </p>
                <h3 className="stack-tight type-subheading text-foreground transition-colors group-hover:underline">
                  {post.data.title}
                </h3>
                {post.data.excerpt ? (
                  <p className="stack-tight line-clamp-3 type-para text-muted-foreground">
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
          <p className="stack-content type-para text-muted-foreground">No posts published yet.</p>
        )}
      </div>
    </section>
  );
}
