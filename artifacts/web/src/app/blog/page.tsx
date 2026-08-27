import type { Metadata } from "next";
import Link from "next/link";
import { site } from "#velite";
import { getEntries } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description: `News, updates, and writing from the ${site.name} team.`,
};

// Newest first — pubDate is an ISO datetime string (Velite's s.isodate()), so
// lexical and chronological order agree without a Date parse.
const sortedPosts = () =>
  [...getEntries("blog")].sort((a, b) => (a.data.pubDate < b.data.pubDate ? 1 : -1));

export default function BlogIndex() {
  const posts = sortedPosts();
  return (
    <div className="page-inset pb-12 font-sans sm:pb-16">
      {/* Left-aligned at the page gutter, not centred in it. Every other
          prose route lines up there — /privacy and /terms via ProseBlock
          (mdx-content.tsx), and an article via its own two-column grid — so
          an `mx-auto` here would make the index the one page whose text
          jumps sideways when you navigate to or from it. */}
      <h1 className="max-w-2xl type-title text-foreground">Blog</h1>
      <p className="mt-4 max-w-2xl type-lead text-muted-foreground">{site.blogIntro}</p>

      <ul className="stack-content grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => {
          const featured = index === 0;
          return (
            <li key={post.slug} className={featured ? "sm:col-span-2" : undefined}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-6 hover:border-foreground/20"
              >
                <p className="flex items-baseline gap-2">
                  <span className="rounded-full border border-border px-2 py-1 type-caption font-mono text-muted-foreground">
                    {post.data.category}
                  </span>
                </p>
                <h2 className={`text-foreground ${featured ? "type-heading" : "type-subheading"}`}>
                  {post.data.title}
                </h2>
                <p
                  className={`line-clamp-3 text-muted-foreground ${featured ? "type-lead" : "type-para"}`}
                >
                  {post.data.excerpt ?? post.data.description}
                </p>
                <p className="mt-auto pt-2 type-caption font-mono tabular-nums text-muted-foreground">
                  <time dateTime={post.data.pubDate}>{formatDate(post.data.pubDate)}</time>
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
