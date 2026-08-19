import Link from "next/link";
import { formatDate } from "@/lib/format";

// Top of a blog article: where you are, what it is, when it shipped.
//
// Deliberately not the eyebrow-label stack (a small ALL-CAPS category floating
// above the title) this template's design direction rejected: the category
// here is a breadcrumb crumb — it says where the post sits and is a real link
// — and the date is a fact, not a decorative label. Nothing above the title
// exists to fill space.
export function ArticleHeader({
  title,
  description,
  category,
  pubDate,
}: {
  title: string;
  description: string;
  category: string;
  pubDate: string;
}) {
  return (
    <header className="border-b border-border pb-10 font-sans">
      {/* One crumb deep. The category is not its own route in this template —
          there is no /blog/category/[slug] — so it renders as plain text
          beside the one link that does resolve. Adding category routes is a
          per-project decision, not something the starter should presume. */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/blog" className="text-muted-foreground hover:text-foreground">
          Blog
        </Link>
        <span aria-hidden="true" className="text-muted-foreground/50">
          /
        </span>
        <span className="text-muted-foreground">{category}</span>
      </nav>

      <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
        {title}
      </h1>

      {description ? (
        <p className="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>
      ) : null}

      {/* `dateTime` carries the machine-readable instant while the visible
          text stays the formatted day — the same value, in the two forms a
          reader and a crawler each need. */}
      <p className="mt-8 font-mono text-sm text-muted-foreground">
        Published <time dateTime={pubDate}>{formatDate(pubDate)}</time>
      </p>
    </header>
  );
}
