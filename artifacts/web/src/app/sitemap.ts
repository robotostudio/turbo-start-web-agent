import type { MetadataRoute } from "next";
import { getIndexableSlugs } from "@/lib/content/loader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getIndexableSlugs("pages").map((slug) => ({
    url: slug === "home" ? SITE_URL : `${SITE_URL}/${slug}`,
  }));
  const posts = getIndexableSlugs("blog").map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
  }));
  return [...pages, ...posts];
}
