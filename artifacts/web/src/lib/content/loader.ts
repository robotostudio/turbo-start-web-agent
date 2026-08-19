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
// on; which deployment builds the page IS the access control.
//
// NODE_ENV alone can't be the whole rule: Next.js sets NODE_ENV=production for
// every `next build`/`next start`, including a Vercel PREVIEW deployment — so
// a bare `NODE_ENV !== "production"` check would hide drafts on preview too,
// breaking the "review the draft on its preview URL before it ships" workflow.
// VERCEL_ENV disambiguates on Vercel: it's "production" only on the
// production deployment and "preview" elsewhere. Off Vercel (VERCEL_ENV is
// unset — Netlify, Cloudflare, Docker, or any self-hosted build) there is no
// such signal, so NODE_ENV is the only production check available, and it is
// honoured there: this is the fix for drafts otherwise publishing on every
// off-Vercel build, including production.
//
// PREVIEW_DRAFTS=true is the explicit escape hatch: set it to deliberately
// render drafts on an off-Vercel build that is production-mode by necessity
// (e.g. a staging environment that runs `next build`/`next start` same as
// prod), without weakening the default for everyone else.
// A structural subset of process.env, not `Pick<NodeJS.ProcessEnv, ...>`:
// ProcessEnv's properties come from its index signature, so Pick would make
// all three keys REQUIRED (present, even if `undefined`) rather than
// optional — every test call site would have to spell out all three. This
// type says what the predicate actually needs: each var, present or not.
type DraftEnv = {
  VERCEL_ENV?: string;
  NODE_ENV?: string;
  PREVIEW_DRAFTS?: string;
};

export const shouldIncludeDrafts = (env: DraftEnv): boolean => {
  if (env.PREVIEW_DRAFTS === "true") return true;
  const isProduction =
    env.VERCEL_ENV !== undefined ? env.VERCEL_ENV === "production" : env.NODE_ENV === "production";
  return !isProduction;
};

const INCLUDE_DRAFTS = shouldIncludeDrafts(process.env);

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
