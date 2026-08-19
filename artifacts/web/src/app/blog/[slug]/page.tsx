import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/content/mdx-content";
import { getEntry, getSlugs } from "@/lib/content/loader";

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
  return <MdxContent source={entry.body} />;
}
