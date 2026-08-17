import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/content/mdx-content";
import { getEntry, getSlugs } from "@/lib/content/loader";

type Params = { slug: string[] };

// "home" is served at "/" by src/app/page.tsx. Excluding it here keeps the same
// content from also answering at "/home", which would be duplicate content with
// two URLs competing in search — and the sitemap already emits only the root.
const HOME_SLUG = "home";

const routableSlugs = (): string[] => getSlugs("pages").filter((slug) => slug !== HOME_SLUG);

export const generateStaticParams = (): Params[] =>
  routableSlugs().map((slug) => ({ slug: slug.split("/") }));

const findEntry = (slug: string[]) => {
  const joined = slug.join("/");
  return routableSlugs().includes(joined) ? getEntry("pages", joined) : null;
};

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
