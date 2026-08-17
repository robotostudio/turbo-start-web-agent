import { blog, pages } from "#velite";

// Content access backed by Velite's generated, typed collections (.velite).
// Velite validates frontmatter and compiles MDX bodies at build/watch; this
// module filters drafts and exposes the getEntry/getEntries/getSlugs the
// routes use, so no route imports #velite directly.

const collections = {
  pages,
  blog,
} as const;

export type CollectionName = keyof typeof collections;

type Item<N extends CollectionName> = (typeof collections)[N][number];

export interface Entry<N extends CollectionName> {
  slug: string;
  data: Item<N>;
  // Velite's compiled MDX (`code`).
  body: string;
}

// Every collection's schema shares these fields (see `base` in
// velite.config.ts), so Item<N> for any N is assignable to this shape without
// an `unknown` cast — renaming/removing one of these fields in the schema is
// a type error here, not a silent runtime miss.
type WithFlags = { slug: string; draft: boolean; noindex: boolean; code: string };

const isDraft = (item: WithFlags): boolean => item.draft === true;
const isNoindex = (item: WithFlags): boolean => item.noindex === true;

// A draft is unfinished, not secret — the team should read it in place before
// it ships. The site is static, so there is no request-time check to hang that
// on; which deployment builds the page IS the access control. VERCEL_ENV is
// "production" only on the production deployment and is undefined locally, so
// local dev and every preview render drafts. This check is Vercel-specific:
// VERCEL_ENV is never set on Netlify, Cloudflare, Docker, or any self-hosted
// build, so drafts publish there on every build, including production.
const INCLUDE_DRAFTS = process.env.VERCEL_ENV !== "production";

const published = <T extends WithFlags>(items: T[]): T[] => items.filter((i) => !isDraft(i));

const publishedEntries = <N extends CollectionName>(entries: Entry<N>[]): Entry<N>[] =>
  entries.filter((entry) => !isDraft(entry.data));

const toEntry = <N extends CollectionName>(item: Item<N>): Entry<N> => {
  const rec: WithFlags = item;
  return { slug: rec.slug, data: item, body: rec.code };
};

export const getEntries = <N extends CollectionName>(name: N): Entry<N>[] => {
  const items = collections[name] as Item<N>[];
  return (INCLUDE_DRAFTS ? items : published(items)).map(toEntry);
};

// Resolves against the same draft-filtered set `getEntries` returns, so draft
// filtering lives in exactly one place. Consequence: calling this for a
// drafted slug throws — including during a production build, e.g. a route
// that calls getEntry("pages", "home") with a literal slug. That is
// intentional: a drafted homepage should be a loud build failure, not a
// silently published draft. Do not "fix" this by falling back to the raw
// collection.
export const getEntry = <N extends CollectionName>(name: N, slug: string): Entry<N> => {
  const entry = getEntries(name).find((e) => e.slug === slug);
  if (!entry) {
    throw new Error(`No "${slug}" entry in collection "${name}"`);
  }
  return entry;
};

export const getSlugs = <N extends CollectionName>(name: N): string[] =>
  getEntries(name).map((e) => e.slug);

// Slugs eligible for the sitemap: published AND not noindex. `noindex` keeps a
// page published and directly reachable, so it must stay in getSlugs (which
// feeds generateStaticParams); dropping it there would 404 the page. But an
// unlisted page serves robots: noindex, so listing its URL in the sitemap
// would be a contradictory crawl signal.
export const getIndexableSlugs = <N extends CollectionName>(name: N): string[] =>
  publishedEntries(getEntries(name))
    .filter((e) => !isNoindex(e.data))
    .map((e) => e.slug);
