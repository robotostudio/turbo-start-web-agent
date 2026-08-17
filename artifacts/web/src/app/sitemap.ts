import type { MetadataRoute } from "next";
import { getIndexableSlugs } from "@/lib/content/loader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getIndexableSlugs("pages").map((slug) => ({
    url: slug === "home" ? SITE_URL : `${SITE_URL}/${slug}`,
  }));
  // Blog posts are deliberately omitted: there is no /blog route yet, so
  // advertising blog URLs here would 404. Re-add once a blog route exists.
  return [...pages];
}
