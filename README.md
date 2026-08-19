# turbo-start-web-agent

A starter for marketing sites your client can edit through **any AI agent**,
while your developers keep working locally in git.

Content is MDX in the repository — no CMS, no database. Pages are *data*, not
code: an author composes Blocks and passes them literal values, and a build-time
lockdown rejects any MDX carrying executable code. That is what makes "the agent
may only change content" a guarantee rather than a request. Every change lands
as a branch and a pull request, so a human still reviews what ships.

## Quickstart

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000.

## The Block system

Pages are composed from **Blocks** — pre-built, schema-validated sections such
as `Hero`, `FeatureGrid`, `Testimonial`, and `CTA`. The registry currently
ships **14 Blocks**; the full set lives at `src/lib/blocks/schemas.ts` and
renders live, with the exact props each one expects, at
[`/blocks-gallery`](http://localhost:3000/blocks-gallery).

Compose a page by dropping named tags into its MDX body — no imports, no
wiring:

```mdx
<Hero title="…" primary={{ label: "…", href: "/…" }} />
```

Props must be literal values. Arrays and objects are expression attributes
(`primary={{ label: "…", href: "/…" }}`), never quoted strings. Markdown
outside a Block tag (headings, paragraphs, lists) renders too — it's styled
automatically through Tailwind Typography, not through a "Prose Block"; there
is no such Block in the registry.

### Adding a Block

1. Add a Zod schema to `src/lib/blocks/schemas.ts` and register it in
   `blockSchemas`.
2. Add the matching component to `src/components/blocks/` and register it in
   `blockComponents` (`src/components/blocks/index.ts`).
3. Run `pnpm catalog` — this regenerates `src/lib/blocks/catalog.json` (the
   machine-readable prop reference an authoring agent reads) and adds a stub
   section for the new Block to `content/pages/blocks-gallery.mdx`.

`pnpm catalog:check` and `pnpm catalog` diverging is exactly the drift CI
catches: `catalog:check` and `gallery:check` both run in CI, so a Block added
without regenerating fails the build.

## How content works

- Pages live in `artifacts/web/content/pages/*.mdx`; posts live in
  `content/blog/` and are served at `/blog` and `/blog/[slug]`.
- Frontmatter is validated by Velite. `draft: true` keeps an entry out of the
  production build **on Vercel** — the check is `VERCEL_ENV !== "production"`,
  which is unset on Netlify, Cloudflare, Docker, and any self-hosted build, so
  drafts publish there on every build. `noindex: true` publishes an entry but
  keeps it out of the sitemap and asks search engines not to index it.
- Site chrome — the header nav and the footer — is **not** MDX content. It's
  edited as YAML in `content/settings/navigation.yml` and
  `content/settings/footer.yml`, validated by the same Velite/Zod pipeline
  (every `href` is checked against the same safe-URL rule Block links use).

## Environment variables

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your
deployed origin — without it, `sitemap.ts` silently falls back to
`https://example.com` and ships a sitemap of example.com URLs on your first
production deploy.

## The build is the gate

```sh
pnpm content:check    # frontmatter, MDX syntax, and the content lockdown
pnpm catalog:check    # catalog.json is in sync with src/lib/blocks/schemas.ts
pnpm gallery:check    # blocks-gallery.mdx has a section for every registered Block
pnpm test             # lockdown, loader, and Block-prop unit tests
pnpm typecheck
pnpm build            # renders every page; bad Block props fail here
```

If these pass, the content is valid. Fix the content, not the schema. A green
build is necessary but not sufficient — always click through the built site
(nav, footer, and every page it links to) before calling a change done.

## Licence

MIT.
