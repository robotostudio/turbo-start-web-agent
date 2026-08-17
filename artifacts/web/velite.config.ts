import { relative } from "node:path";
import rehypeSlug from "rehype-slug";
import { defineConfig, s } from "velite";
import { remarkContentLockdown } from "./src/lib/content/remark-content-lockdown";

// The Collection Registry, expressed as velite collections. Velite watches
// content/, validates frontmatter, compiles MDX bodies (s.mdx() -> code), and
// regenerates .velite/ — which the routes import, so editing content triggers
// Fast Refresh in dev and fails the build on bad frontmatter. Block-prop
// validation still happens at render via parseBlock.

// slug = file path minus the collection dir, e.g. "pages/about" -> "about".
// `meta.path` is the absolute filesystem path of the source file (this Velite
// version does not hand transforms a root-relative path), so it must be made
// relative to `meta.config.root` and have its extension stripped before the
// collection-dir prefix can be dropped — mirroring Velite's own built-in
// `s.path()` helper (relative(root, path).replace(/\.[^.]+$/, "")).
const slugFromPath = (path: string, root: string) =>
  relative(root, path)
    .replace(/\.[^/.]+$/, "")
    .replace(/\\/g, "/")
    .split("/")
    .slice(1)
    .join("/");

// The Asset Store origin. Must stay in step with the remotePatterns entry in
// next.config.mjs — an image from any other host passes a bare URL check here
// and then fails at render as an unconfigured host.
const ASSET_STORE = /^https:\/\/[a-zA-Z0-9-]+\.public\.blob\.vercel-storage\.com\//;

// Fields every content entry carries. `draft` excludes an entry from the build
// and the sitemap; `noindex` keeps it published but emits robots: noindex.
const base = {
  title: s.string().max(200),
  description: s.string().max(300),
  draft: s.boolean().default(false),
  noindex: s.boolean().default(false),
};

export default defineConfig({
  root: "content",
  strict: true,
  collections: {
    pages: {
      name: "Page",
      pattern: "pages/**/*.mdx",
      schema: s
        .object({
          ...base,
          code: s.mdx(),
        })
        .transform((data, { meta }) => ({
          ...data,
          slug: slugFromPath(meta.path, meta.config.root),
        })),
    },
    blog: {
      name: "BlogPost",
      pattern: "blog/**/*.mdx",
      schema: s
        .object({
          ...base,
          pubDate: s.isodate(),
          category: s.string(),
          excerpt: s.string().max(300).optional(),
          cover: s.string().regex(ASSET_STORE, "cover must be a full Asset Store URL").optional(),
          code: s.mdx(),
        })
        .transform((data, { meta }) => ({
          ...data,
          slug: slugFromPath(meta.path, meta.config.root),
        })),
    },
  },
  mdx: {
    remarkPlugins: [remarkContentLockdown],
    rehypePlugins: [rehypeSlug],
  },
});
