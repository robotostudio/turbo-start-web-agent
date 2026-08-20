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
- Frontmatter is validated by Velite. `draft: true` keeps an entry out of any
  production build, on Vercel or anywhere else. On Vercel, `VERCEL_ENV`
  disambiguates a production deployment from a preview one (both build with
  `NODE_ENV=production`), so drafts stay visible on preview URLs and are
  excluded only from production. Off Vercel — Netlify, Cloudflare, Docker, any
  self-hosted build — there is no such signal, so `NODE_ENV === "production"`
  is what excludes drafts there. Set `PREVIEW_DRAFTS=true` to deliberately
  render drafts on a production-mode build anyway (e.g. a staging environment
  that runs `next build`/`next start` the same as prod). `noindex: true`
  publishes an entry but keeps it out of the sitemap and asks search engines
  not to index it.
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

## The agent harness

This template is agent-native: **`AGENTS.md`** at the repo root is the
canonical rulebook — the content model, Block composition, the
build-is-the-gate rule, git discipline — read natively by Codex, Cursor,
GitHub Copilot/VS Code, Zed, and most of the rest of the ecosystem.

Claude Code and Replit don't read `AGENTS.md` on their own, so
**`CLAUDE.md`, `replit.md`, and `.replit` bridge that gap — and all three
are generated**, by `pnpm harness`, from `AGENTS.md`,
`harness.config.json`, and `.agents/skills/`. Never hand-edit a generated
file (each one says so at the top); edit the inputs and regenerate.
`pnpm harness:check` is the read-only drift gate CI runs — it fails,
naming exactly which generated file is stale, instead of writing anything.

`docs/platforms/` holds a connection runbook per supported platform
(v0, Replit, Claude Code, Codex): scoping a client repo to one
platform, a write-only push identity, turning off platform-side automation
that would fight this template's review-before-publish model, and a smoke
test.

`scripts/preflight.sh` reports what an agent session can actually do —
git remote reachability, `gh`/`pnpm`/`node` presence, manifest capability
probes — at session start (wired to Replit's `onBoot`; run it by hand on
other platforms).

### Which platform for which client

The platforms are not interchangeable. All four below were exercised in
live sessions on 2026-08-20 — a real client-style content change, taken
through to a merged pull request:

| Platform | Reads the rulebook | Shows the client the site | Opens the PR |
|---|---|---|---|
| **v0** | `AGENTS.md` + `.agents/skills/` | **Yes**, in-chat preview | Itself |
| **Replit** | `replit.md` | **Yes**, workspace preview | No — on GitHub |
| **Claude Code** | `CLAUDE.md` (imports `AGENTS.md`) | No — diff only | Button in the UI |
| **Codex** | `AGENTS.md` | No — diff only | Button in the UI |

The column that decides it for a non-technical client is the middle one.
On v0 and Replit they watch the site change as they ask for it; on Claude
Code and Codex they get a diff, and their only view of the result is the
hosting preview URL — which is behind a login by default on most hosts, so
it needs configuring rather than assuming. Both of those platforms *do*
have a preview, but only in their desktop apps, which need a local install
and a checkout: the developer setup this template exists to spare the
client.

Pick the platform for whoever is actually driving. `docs/platforms/README.md`
covers preview access; each runbook covers that platform's specific traps —
and every one of them has some.

### What live testing changed

Testing moved this from documented to verified, and corrected the docs in
about a dozen places. Two findings are worth knowing before you connect
anything:

- **Replit's guided import may offer to *port* the app** rather than run
  it — a Next.js → Vite conversion, unprompted, which would destroy the
  content pipeline. The generated `replit.md` now carries a standing
  instruction against it. See `docs/platforms/replit.md` §1.
- **On an agent-authored pull request, the file list is the truth and the
  prose is a claim.** One platform committed a dev-server side effect as
  its own commit and titled the PR after it, never mentioning the change
  that had been requested. Every automated check passed, because none of
  them read English.

`AGENTS.md` §6 records these and the rest, with dates.

## Licence

MIT.
