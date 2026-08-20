# AGENTS.md — turbo-start-web-agent

A marketing-site template where a non-technical client edits content through
an AI agent while developers keep working in git. This file is the rulebook
every agent — human-directed or autonomous — follows in this repo. It is read
natively by Codex, Cursor, GitHub Copilot/VS Code, Zed, Jules, Gemini CLI,
Devin, Warp, Amp, and most of the rest of the ecosystem. Claude Code does not
read this file directly; it reads `CLAUDE.md`, which imports this one.

## 1. Golden rules

1. **Static-only rendering.** Content in `content/` is data, not code. It may
   only compose named Blocks (capitalized tags) with literal prop values —
   no `import`/`export`, no function calls, no raw HTML elements, no runtime
   expressions. This is enforced at build time, not by convention — see
   §3.
2. **Compose before extend.** Almost every task is composing existing Blocks
   from `catalog.json` into MDX (§3). Only touch schemas or components (§4)
   when no existing Block can express the content.
3. **Design tokens only.** Blocks and primitives reference the CSS custom
   properties defined in `artifacts/web/src/app/globals.css` — never a raw
   hex code or a px value. Re-theming a client site means editing token
   values there, never renaming or removing a token (every Block references
   them by name).
4. **The build is the gate.** If the commands in §5 pass, the content is
   valid. Fix the content, not the schema. A green build is necessary but
   not sufficient — check the rendered page before calling a change done.
   Where you have a browser, click through it (nav, footer, every linked
   page). Where you do not, serve the build and assert on the returned HTML
   for the strings you changed; that catches wrong-content far better than a
   green build alone, even without a screenshot.
5. **`const` only.** Never `let` or `var`, except where a loop genuinely
   reassigns.
6. **kebab-case filenames.** Exports keep PascalCase (component names,
   types).
7. **Being asked for a change authorizes the commit, not the pull request.**
   Commit the work you were asked to do — a branch publishes nothing. Then
   pause and ask before opening the PR, which is outward-facing. Where a
   platform's own instructions require opening the PR immediately, follow
   the platform: its instructions outrank this file, and the PR was never
   the gate — merging is. Never a direct push to `main`, and never merge
   your own PR. Commit trailers are `Requested-by:` and `Agent:`; never
   `Co-Authored-By:` or a session URL. Delivery channels differ per platform
   (some have no `origin` remote at all) —
   see `.agents/skills/sync-changes/SKILL.md`.

## 2. Where things live

The Next.js app is a workspace package under `artifacts/web/` — nearly
everything below is relative to that directory, not the repo root.

| What | Path |
|---|---|
| Page content (MDX) | `artifacts/web/content/pages/*.mdx` |
| Blog posts (MDX) | `artifacts/web/content/blog/*.mdx` |
| Site navigation (YAML, not MDX) | `artifacts/web/content/settings/navigation.yml` |
| Site footer (YAML, not MDX) | `artifacts/web/content/settings/footer.yml` |
| Site-wide announcement bar, above the header (YAML, not MDX) | `artifacts/web/content/settings/announcement.yml` |
| Overscroll easter-egg lines (YAML, not MDX) | `artifacts/web/content/settings/overscroll.yml` |
| Block schemas (Zod — the source of truth) | `artifacts/web/src/lib/blocks/schemas.ts` |
| Block catalog (generated prop reference) | `artifacts/web/src/lib/blocks/catalog.json` |
| Block components | `artifacts/web/src/components/blocks/*.tsx` |
| Block component registry | `artifacts/web/src/components/blocks/index.ts` |
| Content lockdown (the enforcement mechanism) | `artifacts/web/src/lib/content/remark-content-lockdown.ts` |
| Content pipeline config (Velite) | `artifacts/web/velite.config.ts` |
| Design tokens | `artifacts/web/src/app/globals.css` |
| Allowed image hosts | `artifacts/web/next.config.mjs` (`images.remotePatterns`) |
| Live Block reference/preview | `artifacts/web/content/pages/blocks-gallery.mdx`, served at `/blocks-gallery` |
| Catalog/gallery generators | `artifacts/web/scripts/generate-catalog.ts`, `artifacts/web/scripts/generate-gallery.ts` |
| Verify commands (delegate into `artifacts/web`) | root `package.json` |

Deeper how-to procedures belong in `.agents/skills/`, not in this file. Three
skills ship in this repo today:

| Skill | Use it for |
|---|---|
| `.agents/skills/compose-page/SKILL.md` | The full page-composition workflow: locating the right MDX file, choosing Blocks from `catalog.json`, writing frontmatter (including the blog-only fields §3 doesn't cover), and composing Blocks with literal props. |
| `.agents/skills/sync-changes/SKILL.md` | Session-start git discipline: pull before editing, branch → commit → PR, never push to `main`, and how to confirm a push actually reached the remote on platforms where the shell has no git credentials. |
| `.agents/skills/find-skills/SKILL.md` | How to review and install a third-party skill safely before adding it to `.agents/skills/` and `skills-lock.json`. |

Codex, Cursor, Copilot/VS Code, Zed, and most of the rest of the ecosystem
read only this file and never load `.agents/skills/` — for those platforms
the table above, not the skill files themselves, is the documentation.
Claude Code and Replit also load these by description at the paths shown.
`.claude/skills/` is a generated, byte-identical mirror of `.agents/skills/`
for Claude Code, refreshed by `pnpm harness` (§5) — edit skills under
`.agents/skills/`, never under `.claude/skills/` directly.

## 3. Compose (the common case)

To add or change a page: write MDX under `artifacts/web/content/pages/`,
choose Blocks from `artifacts/web/src/lib/blocks/catalog.json` (the
machine-readable prop reference generated from `schemas.ts`), and drop them
into the MDX body as tags. No imports, no wiring — Blocks are injected into
every content file automatically.

```mdx
<Hero
  variant="centered"
  title="Your website, editable by any AI agent"
  primary={{ label: "Read the docs", href: "/about" }}
/>
```

**Why this works as a guarantee, not a request:** every content file passes
through `remarkContentLockdown` (`artifacts/web/src/lib/content/remark-content-lockdown.ts`),
a remark plugin wired into the Velite MDX pipeline (`artifacts/web/velite.config.ts`).
It walks both the MDX tree and every `{…}` expression and rejects anything
that isn't a pure literal — the build fails, with an error naming exactly
what was rejected and what to do instead. That is what makes "an agent may
only edit content" true regardless of what an agent (or a compromised one)
attempts, instead of a rule an agent could simply choose to break.

**The concrete constraints you will hit:**

- **No `import`/`export` statements.** Blocks are injected into every
  content file; content never wires up its own dependencies.
- **No function calls, member access, identifiers, or operators in `{…}`
  expressions.** Only literal values survive: strings, numbers, booleans,
  arrays, objects, template strings (no interpolation), and nested JSX.
  `{someVariable}` and `{formatDate(x)}` both fail the build.
- **No raw HTML elements and no hyphenated or namespaced tag names.** Only
  capitalized Block names (`<Hero>`, not `<div>` or `<my-widget>`) are
  allowed as JSX tags. If you need a layout raw Markdown can't produce,
  that's a new Block (§4), not raw HTML.
- **No prop names beginning `on`.** Any prop starting with `on` (case
  insensitive) is treated as an event handler and rejected outright — content
  carries copy and structure, never behavior. A prop like `onboardingSteps`
  trips this too; rename it (e.g. `steps`).
- **URL-bearing props must be plain literal strings with a safe scheme.**
  Any prop named `href`, `src`, `action`, `url`, `to`, `cite`, `ping`,
  `srcset`, `formaction`, `poster`, or ending in `url`/`href`/`src` is
  checked. Allowed: `http:`, `https:`, `mailto:`, `tel:`, or a
  relative/anchor/query path (`/about`, `#section`, `?query`, `./file`).
  Rejected: `javascript:`, `data:`, protocol-relative `//host`, and any
  interpolated or computed value — write the URL out literally.
- **Arrays and objects are expression attributes, never quoted strings:**
  `primary={{ label: "…", href: "/…" }}`, not `primary="{...}"`.
- **Image `src` props are stricter than link `href`s** (see `mediaSrc()` in
  `schemas.ts`): a relative path served from `/public`, or an `https` URL on
  `images.unsplash.com`, `assets.ui.sh`, or a `*.public.blob.vercel-storage.com`
  subdomain — the exact hosts `next.config.mjs`'s `images.remotePatterns`
  allows. Anything else passes the schema but throws at render, because
  `next/image` refuses an unconfigured host.
- **Frontmatter** carries `title`, `description`, `draft` (default `false` —
  excludes the entry from a production build and the sitemap; see README.md
  for the `VERCEL_ENV`/`PREVIEW_DRAFTS` preview-vs-production distinction),
  and `noindex` (publishes the page but excludes it from the sitemap).
- **Site chrome (header nav, footer, announcement bar, overscroll easter
  egg) is not MDX** — it's YAML at
  `artifacts/web/content/settings/navigation.yml`, `footer.yml`,
  `announcement.yml`, and `overscroll.yml`. Every `href` among them is
  checked by the same `isSafeUrl` rule via a Zod `.refine()` in
  `velite.config.ts`, because YAML never passes through the MDX lockdown
  remark plugin above.
- **The announcement bar is not the Banner Block.** The announcement bar
  (`announcement.yml`) is site-wide chrome rendered above the header on every
  page — the switch a client's agent flips for a single site-wide notice is
  `enabled: true`/`false` there, never deleting the content. `Banner` (a
  Block, chosen from `catalog.json` like any other) is for an in-page callout
  composed into one page's own content, and can never render above the
  header — see its `.describe()` in `catalog.json` for the same distinction.

After editing, run `pnpm content:check` (§5), then view the page.

## 4. Extend (rarer, governed)

Adding a genuinely new Block — one no composition of existing Blocks can
express — has four touch points, all of which must move together:

1. **Schema** — add a Zod schema to `artifacts/web/src/lib/blocks/schemas.ts`
   and register it in the `blockSchemas` array. Any URL prop must use the
   `safeUrl()` helper; any image prop must use `mediaSrc()`. Both pair a
   `.refine()` (the actual runtime check) with a `.describe()` restating the
   rule in prose — `z.toJSONSchema()` silently drops `.refine()` predicates,
   so without the paired `.describe()` the generated catalog would tell an
   authoring agent the prop is a bare, unchecked string.
2. **Component** — add the matching component to
   `artifacts/web/src/components/blocks/` and register it in `blockComponents`
   (`artifacts/web/src/components/blocks/index.ts`). Every Block component
   calls `parseBlock(name, schema, props)` first; that's the render-time half
   of validation, and its error names the Block and every bad prop path.
3. **Registry regeneration** — run `pnpm catalog` (from `artifacts/web/`, or
   `pnpm --filter @workspace/web run catalog` from the root). This
   regenerates `catalog.json` from `schemas.ts` and adds a stub section to
   `blocks-gallery.mdx` for the new Block.
4. **The registry guard test** — `artifacts/web/src/lib/blocks/schemas.test.ts`
   ("blockSchemas and blockComponents register the exact same Block names")
   fails the build if a schema has no matching component (renders nothing)
   or a component has no matching schema (never validated). It reads
   `index.ts` as source text rather than importing it, because Node's
   `--experimental-strip-types` test runner cannot import a `.tsx` file.

`pnpm catalog:check` and `pnpm gallery:check` both run in CI — a Block added
without running `pnpm catalog` fails the build, which is the drift check
working as intended.

## 5. Verify

From the repo root (each delegates into `artifacts/web`, except the first):

```sh
pnpm run harness:check    # generated per-platform surfaces are in sync with AGENTS.md, harness.config.json, and .agents/skills/
pnpm run content:check    # frontmatter, MDX syntax, and the content lockdown
pnpm run catalog:check    # catalog.json is in sync with src/lib/blocks/schemas.ts
pnpm run gallery:check    # blocks-gallery.mdx has a section for every registered Block
pnpm run lint              # biome check (artifacts/web, plus scripts/ and harness.config.json at the root)
pnpm run test              # lockdown, loader, and Block-prop unit tests, plus the harness generator's own tests
pnpm run typecheck
pnpm run build             # renders every page; bad Block props fail here
```

This is the exact sequence CI runs (`.github/workflows/ci.yml`), in the same
order. All of it must pass before a change is considered done — but passing
is not the same as correct: always click through the built site afterward.

**Regenerating the platform surfaces.** `pnpm harness` regenerates
`CLAUDE.md`, the `.claude/skills/` mirror, `replit.md`, `.replit`, and
`.cursorignore` from `AGENTS.md`, `harness.config.json`, and
`.agents/skills/` (see `scripts/harness-gen/`) — run it any time you edit
any of those three inputs, including after adding, editing, or removing a
skill under `.agents/skills/`, then include the regenerated files in your
change (§1 rule 7 still applies: land them via a PR, not a direct commit).
`pnpm harness:check` (above) is the read-only version CI runs:
it writes nothing and fails naming exactly which generated file is out of
date or which file under `.claude/skills/` is stale.

## 6. Incidents and quirks

Record what actually went wrong here, as it happens, with enough detail that
the next agent (or the next developer) doesn't rediscover it the hard way. A
rule sticks when it carries the story of why it exists.

The entries below came out of connecting this template to real agent
platforms. They are kept in an adopter's copy on purpose: every one of them
is about wiring a client project up, which is the first thing an adopter
does.

**2026-08-19 — A public repo hides a broken GitHub connection until push
time.** A Claude Code cloud session read the repo, found `AGENTS.md`, made a
correct two-line content edit, ran all eight checks, and browser-verified the
result — then failed at `git push` with `403`, because no GitHub App was
installed and it had been cloning the repo *anonymously* the whole time.
Public visibility is what allowed that: on a private repo the session would
have failed at clone, in seconds, with an obvious cause. Verify write access
before the first real task, not after it — `scripts/preflight.sh` reports git
reachability, but reachability is a read.

**2026-08-19 — `gh` is not installed in Claude Code cloud sessions.** This
skill told agents to open PRs with `gh pr create` and offered no alternative,
so a session that had done everything right reported it could not deliver.
The platform's own **Create PR** control and a GitHub MCP tool both work.
`sync-changes` now lists all three routes in order.

**2026-08-19 — Claude Code's org-settings route needs a Team or Enterprise
plan.** On a personal plan that page is simply unreachable, so guidance
pointing an operator there is a dead end. Reconnecting from inside the
product restored write access with no local setup. Prefer routes a client can
complete in a browser: any fix requiring a local terminal with an
authenticated `gh` defeats the premise that the client edits without a
developer.

**2026-08-19 — Agent platforms add vendor commit trailers by default.** A
commit arrived carrying `Co-Authored-By: <model>` and a session URL. The URL
is not a leak (it 403s for anyone not signed into the account that made it),
but it is a permanent AI-authorship marker in a public repo's history and it
records the model vendor instead of who wanted the change. Use
`Requested-by:` and `Agent:` instead; strip the defaults before pushing.

**2026-08-19 — Vercel preview deployments are SSO-gated by default.** With
`ssoProtection` set to `all_except_custom_domains`, every preview URL returns
a login redirect, so the client cannot see their own change before it merges
— which removes the review step the whole workflow is built around. Decide
this deliberately per project: give the client a seat on the Vercel project
(needs a paid plan; Hobby supports no team members at all), issue a
protection-bypass link, or make previews public. Do not assume a preview link
just works.

**2026-08-20 — Codex cloud containers have no git remote.** A push there
fails with `fatal: 'origin' does not appear to be a git repository`, which
reads like a broken connection and is not one: Codex delivers the task's
diff through its own **Create PR** control rather than through a push. Do not
diagnose it as a credentials problem and do not retry. A `403` is the
credentials problem; a missing `origin` is the platform's design.

**2026-08-20 — A platform's own instructions outrank this file.** Codex
reported that its environment tells it to create a PR straight after
committing, which contradicts rule 7's pause, and correctly followed the
platform. Nothing here is sovereign: rules in this repo are one input among
several, below the system and developer instructions of whatever is running.
Write rules whose *failure* is tolerable — the pause is a nicety, and the
merge gate, enforced by GitHub rather than by instruction, is what actually
protects the live branch.

**2026-08-20 — Schemas enforce shape, not meaning.** Asked to drop a stat,
an agent hit `statsSchema`'s exactly-four rule, correctly refused to widen
the schema, and substituted `MIT` / "License for client reuse" into a Block
titled "The numbers behind the pitch." Every gate passed; the section read as
three numbers and a licence. No realistic schema change catches that. It is
the clearest argument for why the PR review step is not ceremony.

**2026-08-20 — Replit's import offered to rewrite the app, not run it.**
Importing this template opened an unprompted task titled "Port imported
Vercel app to Replit" that began converting the Next.js App Router site to
Vite. For this project that is fatal rather than cosmetic — the content
pipeline is the Next.js build — and it burned a day of agent credits in
about a minute before anyone typed a prompt. Nothing reached GitHub. The
generated `replit.md` now opens with an explicit instruction never to
migrate the project, because Agent reads that file as standing instructions
and it is the only lever the repository has over the behaviour. Use
Assistant rather than Agent for edits: Assistant edits files, Agent
restructures projects. Full procedure in `docs/platforms/replit.md` §1.

**2026-08-20 — pnpm self-update hangs every command in a Replit
workspace.** The container ships one pnpm version, `package.json` pins
another, and the self-update stalls rather than failing, so every `pnpm`
command hangs — presenting as a mysteriously slow typecheck when in fact
tsc never starts. Fixed in the generated `.replit` with
`npm_config_manage_package_manager_versions = "false"` under `[env]`.
Nobody running the pinned version on their own machine will ever reproduce
this.

**2026-08-20 — An agent described its own accident as the work.** Asked to
change one line of banner copy, v0 also ran the dev server (correctly, to
verify the change), which rewrote the Next.js-generated `next-env.d.ts`. It
committed that side effect as its own `refactor:` commit with a plausible
rationale, then titled the pull request after it — "Improve Next.js type
safety for development" — never mentioning the banner change anyone had
asked for. Every check passed, because none of them read English. On an
agent-authored PR the **file list is the truth and the prose is a claim**;
read the diff, not the description. Root cause fixed by gitignoring
`next-env.d.ts`, but any generated file that creeps back into version
control will reproduce it.

**2026-08-20 — `git fetch && git push --force-with-lease` is not a safe
force-push.** Fetching refreshes the remote-tracking ref, so the lease
compares the remote against itself and always passes — `--force` with the
safety removed. An agent hit a refused lease and proposed exactly this
rather than pinning the SHA. The correct form is
`--force-with-lease=<branch>:<expected-sha>`, using a SHA you have actually
looked at. A safety check that fails is information; working around it
without understanding it throws that information away.

**A green build is not a rendered page.** Several defects here passed
`typecheck`, `lint`, and `build` cleanly and were only visible in a browser:
prose with every margin dropped, a `Stats` Block indented out of line with
the text beside it, literal backticks around inline code, and a
table-of-contents entry highlighting the wrong section. Rule 4 says click
through the built site; these are why.
