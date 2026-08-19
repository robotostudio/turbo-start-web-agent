import type { Metadata } from "next";
import Link from "next/link";
import { getEntries } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, updates, and writing from the Harbour team.",
};

// Newest first — pubDate is an ISO datetime string (Velite's s.isodate()), so
// lexical and chronological order agree without a Date parse.
const sortedPosts = () =>
  [...getEntries("blog")].sort((a, b) => (a.data.pubDate < b.data.pubDate ? 1 : -1));

// pubDate serializes as a full ISO datetime ("2026-08-17T00:00:00.000Z"); the
// frontmatter is date-only, so only the date portion is meaningful to show.
const formatDate = (pubDate: string) => pubDate.slice(0, 10);

export default function BlogIndex() {
  const posts = sortedPosts();
  return (
    <div className="page-inset font-sans">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground">Blog</h1>
        {posts.map((post) => (
          <article key={post.slug} className="border-t border-border py-6 first:border-t-0">
            <h2 className="text-xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.data.title}
              </Link>
            </h2>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {formatDate(post.data.pubDate)}
            </p>
            {post.data.excerpt ? (
              <p className="mt-3 text-muted-foreground">{post.data.excerpt}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
