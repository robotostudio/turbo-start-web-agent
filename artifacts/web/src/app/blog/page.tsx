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
    <div className="page-inset pb-24 font-sans">
      {/* Left-aligned at the page gutter, not centred in it. Every other
          prose route lines up there — /privacy and /terms via ProseBlock
          (mdx-content.tsx), and an article via its own two-column grid — so
          an `mx-auto` here would make the index the one page whose text
          jumps sideways when you navigate to or from it. */}
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Blog</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{site.blogIntro}</p>
        <div className="mt-12">
          {posts.map((post) => (
            <article key={post.slug} className="border-t border-border py-8 first:border-t-0">
              {/* Category and date read as one meta line rather than a
                  free-floating label above the title — same reasoning as the
                  article header's breadcrumb (article-header.tsx). */}
              <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-muted-foreground">
                <span>{post.data.category}</span>
                <span aria-hidden="true" className="text-muted-foreground/50">
                  /
                </span>
                <time dateTime={post.data.pubDate}>{formatDate(post.data.pubDate)}</time>
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.data.title}
                </Link>
              </h2>
              {post.data.excerpt ? (
                <p className="mt-3 text-pretty text-muted-foreground">{post.data.excerpt}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
