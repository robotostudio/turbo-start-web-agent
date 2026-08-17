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

## How content works

- Pages live in `artifacts/web/content/pages/*.mdx`; posts in `content/blog/`.
  Blog posts are validated and loadable, but there is no `/blog` route yet —
  that lands in a later milestone, so a post has no URL today.
- Frontmatter is validated by Velite. `draft: true` keeps an entry out of the
  production build **on Vercel** — the check is `VERCEL_ENV !== "production"`,
  which is unset on Netlify, Cloudflare, Docker, and any self-hosted build, so
  drafts publish there on every build. `noindex: true` publishes an entry but
  keeps it out of the sitemap.
- Bodies compose Blocks with no imports — the registry is injected:

  ```mdx
  <Hero title="…" primary={{ label: "…", href: "/…" }} />
  ```

- Props must be literal values. Arrays and objects are expression attributes
  (`primary={{ label: "…", href: "/…" }}`), never quoted strings.

## Environment variables

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your
deployed origin — without it, `sitemap.ts` silently falls back to
`https://example.com` and ships a sitemap of example.com URLs on your first
production deploy.

## The build is the gate

```sh
pnpm content:check   # frontmatter, MDX syntax, and the content lockdown
pnpm test            # lockdown, loader, and Block-prop unit tests
pnpm typecheck
pnpm build           # renders every page; bad Block props fail here
```

If these pass, the content is valid. Fix the content, not the schema.

## Status

This template is being built in three stages. Stage 1 (this code) is complete:
the monorepo shell, the content pipeline with the lockdown, the Block contract,
and static rendering. Still to come: the full starter Block set with a generated
catalog and live gallery (stage 2), and the multi-platform agent harness for
Replit, Claude Code and Cursor (stage 3).

## Licence

MIT.
