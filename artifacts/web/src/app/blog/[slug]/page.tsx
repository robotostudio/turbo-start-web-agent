import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleHeader } from "@/components/content/article-header";
import { ArticleToc } from "@/components/content/article-toc";
import { MdxContent } from "@/components/content/mdx-content";
import { getEntry, getSlugs } from "@/lib/content/loader";
import { cn } from "@/lib/utils";

type Params = { slug: string };

export const generateStaticParams = (): Params[] => getSlugs("blog").map((slug) => ({ slug }));

const findEntry = (slug: string) =>
  getSlugs("blog").includes(slug) ? getEntry("blog", slug) : null;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const entry = findEntry(slug);
  if (!entry) return {};
  return {
    title: entry.data.title,
    description: entry.data.description,
    robots: entry.data.noindex ? { index: false, follow: false } : undefined,
  };
};

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = findEntry(slug);
  if (!entry) notFound();

  const { title, description, category, pubDate, toc } = entry.data;
  const hasToc = toc.length > 0;

  return (
    // No top padding of its own: `header + .page-inset` in globals.css already
    // supplies the gap under the sticky site header for any route whose
    // outermost element is a `.page-inset` (see the rule's comment) — adding
    // `pt-*` here would put two utilities in the same layer competing over one
    // property.
    <article className="page-inset pb-24 font-sans">
      <ArticleHeader
        title={title}
        description={description}
        category={category}
        pubDate={pubDate}
      />

      {/* The two-column split only exists when there is a rail to put in it: a
          post with no `##` headings renders one full-width column rather than
          reserving 16rem beside the body for an empty panel. Below `lg` it is
          always one column with the panel first (`order-1` on the aside), so
          the reader can see the shape of the piece before committing to it. */}
      <div
        className={cn(
          "mt-12 grid grid-cols-1 gap-10",
          hasToc && "lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16",
        )}
      >
        {/* `article-body` is the hook for the one CSS correction a Block
            needs in this context: it already carries `page-inset`, which
            would indent it inside a column that is itself already inset. See
            globals.css. */}
        <div className="article-body order-2 min-w-0 lg:order-1">
          {/* `variant="article"` drops the per-element page gutter: this
              column IS the measure, so the body must not re-inset itself
              inside it. See mdx-content.tsx. */}
          <MdxContent source={entry.body} variant="article" />
        </div>
        {hasToc ? <ArticleToc toc={toc} /> : null}
      </div>
    </article>
  );
}
