import { relative } from "node:path";
import rehypeSlug from "rehype-slug";
import { defineConfig, s } from "velite";
import { isSafeUrl, remarkContentLockdown } from "./src/lib/content/remark-content-lockdown";

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

// `navigation`, `footer`, and `announcement` are singleton YAML collections
// (site chrome, not content/pages entries) — see content/settings/*.yml. YAML
// has no MDX body, so it never reaches `remarkContentLockdown` above: that
// plugin is a remark plugin wired into the `mdx:` pipeline below, and
// frontmatter/YAML never passes through remark at all. Zod's `.refine()` is
// therefore the ONLY gate standing between a YAML edit and an unsafe URL
// (e.g. `javascript:alert(1)`) reaching production — hence `href` is never a
// bare `s.string()` here.
// `.describe()` is required alongside every `.refine()`: Velite/Zod
// `.refine()` predicates carry no machine-readable rule, so the prose in
// `.describe()` is what documents the constraint for an authoring agent.
const HREF_RULE =
  "Must be an http(s), mailto, or tel URL, or a relative/anchor path (/about, #section, ?query, ./file) — javascript:, data:, and protocol-relative //host URLs are rejected.";

const href = () =>
  s.string().min(1, "must not be blank").refine(isSafeUrl, HREF_RULE).describe(HREF_RULE);

const navLink = s.object({
  label: s.string().min(1),
  href: href(),
});

const navItem = s.object({
  label: s.string().min(1),
  href: href(),
  children: s.array(navLink).optional(),
});

const footerLink = s.object({
  label: s.string().min(1),
  href: href(),
});

const footerColumn = s.object({
  title: s.string().min(1),
  links: s.array(footerLink),
});

// The wordmark shown next to the site name in the footer. `icon` is a
// hardcoded-in-component enum, not markup from content — the actual SVG (see
// XIcon/GitHubIcon in site-footer.tsx) can't safely live in YAML, only which
// one to render and where it links.
const footerSocialLink = s.object({
  label: s.string().min(1),
  href: href(),
  icon: s.enum(["x", "github"]),
});

const footerBrand = s.object({
  name: s.string().min(1),
  href: href(),
});

// The site-wide announcement bar's optional link — same {label, href} shape
// as navLink/footerLink, kept as its own named schema for the same reason
// those two are separate: each chrome surface owns its shape independently
// even where the shapes currently coincide.
const announcementLink = s.object({
  label: s.string().min(1),
  href: href(),
});

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
          // Build-time table of contents for the article side panel
          // (src/components/content/article-toc.tsx). Derived from the body's
          // headings — never authored — so a post's rail can't drift out of
          // step with the post. Depth 2 means top-level `##` sections only:
          // the rail lists sections, not every sub-point, and its slugs match
          // the heading ids stamped by rehype-slug (see `mdx.rehypePlugins`
          // below), so the jump links resolve with no client JS.
          toc: s.toc({ maxDepth: 2 }),
          code: s.mdx(),
        })
        .transform((data, { meta }) => ({
          ...data,
          slug: slugFromPath(meta.path, meta.config.root),
        })),
    },
    navigation: {
      name: "Navigation",
      pattern: "settings/navigation.yml",
      single: true,
      schema: s.object({
        items: s.array(navItem),
      }),
    },
    footer: {
      name: "Footer",
      pattern: "settings/footer.yml",
      single: true,
      schema: s.object({
        brand: footerBrand,
        columns: s.array(footerColumn),
        social: s.array(footerSocialLink),
        legal: s.array(footerLink),
        note: s.string().optional(),
        // Trailing legal text after the auto-generated "© {year} {brand}."
        // (the year and brand name are never content — see site-footer.tsx).
        copyrightNote: s.string().optional(),
        // Who built the site, shown under the note. Content, not a `.tsx`
        // constant, for the same reason the brand name is: an agency forking
        // this template replaces its own name by editing YAML.
        builtBy: footerLink.optional(),
      }),
    },
    // Site identity — the name and description that used to be hardcoded in
    // layout.tsx, site-header.tsx and blog/page.tsx. Moved here so that
    // rebranding a client project is a content edit like every other change
    // this template promises is one. A `.tsx` file that names the brand is a
    // regression: see content/settings/site.yml's own header.
    site: {
      name: "Site",
      pattern: "settings/site.yml",
      single: true,
      schema: s.object({
        name: s.string().min(1).max(80),
        description: s.string().min(1).max(300),
        blogIntro: s.string().min(1).max(400),
      }),
    },
    // Lines for the overscroll easter egg (src/components/site/
    // overscroll-easter-egg.tsx) — a hidden, decorative strip revealed only
    // in the native rubber-band gap when the page bounces past the top. One
    // line is shown at random per reveal, so content-driven like everything
    // else rather than hardcoded in the component.
    overscroll: {
      name: "Overscroll",
      pattern: "settings/overscroll.yml",
      single: true,
      schema: s.object({
        lines: s.array(s.string().min(1)).min(1),
      }),
    },
    // Site-wide announcement bar, rendered above SiteHeader in
    // src/app/layout.tsx (see announcement-bar.tsx) — structurally outside
    // the page content flow, unlike the in-page Banner Block. `enabled` is
    // required (no default): a client's agent must make an explicit choice
    // to turn it on or off rather than inherit a silent default, and turning
    // it off must not require deleting the message/link content underneath.
    announcement: {
      name: "Announcement",
      pattern: "settings/announcement.yml",
      single: true,
      schema: s.object({
        enabled: s.boolean(),
        message: s.string().min(1),
        link: announcementLink.optional(),
      }),
    },
  },
  mdx: {
    remarkPlugins: [remarkContentLockdown],
    rehypePlugins: [rehypeSlug],
  },
});
