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
order. A second workflow, `.github/workflows/pr-hygiene.yml`, runs on the
pull request itself rather than the code: it fails a body mangled into
literal `\n` escapes, an empty description, or a commit carrying a vendor
attribution trailer. It has no local equivalent because there is no pull
request to inspect until one exists — run
`node --experimental-strip-types scripts/pr-hygiene.ts` with `PR_BODY` set
to try a body by hand. All of it must pass before a change is considered done — but passing
is not the same as correct: always click through the built site afterward.

**Regenerating the platform surfaces.** `pnpm harness` regenerates
`CLAUDE.md`, the `.claude/skills/` mirror, `replit.md`, and `.replit`
from `AGENTS.md`, `harness.config.json`, and
`.agents/skills/` (see `scripts/harness-gen/`) — run it any time you edit
any of those three inputs, including after adding, editing, or removing a
skill under `.agents/skills/`, then include the regenerated files in your
change (§1 rule 7 still applies: land them via a PR, not a direct commit).
`pnpm harness:check` (above) is the read-only version CI runs:
it writes nothing and fails naming exactly which generated file is out of
date or which file under `.claude/skills/` is stale.

## 6. Incidents and quirks

What actually went wrong here, kept short on purpose. Every agent reads this
file, and Codex truncates project docs past 32 KiB **silently** — so this
section holds only lessons that apply whatever platform you are on. Anything
true of one platform lives in that platform's runbook under
`docs/platforms/`, which is where an operator connecting it will look:
Replit's import offering to rewrite the app and its pnpm stall
(`replit.md`), Codex having no git remote (`codex.md`), a public repo hiding
a broken GitHub connection and org settings needing a paid plan
(`claude-code.md`), scoping a v0 import to a subdirectory (`v0.md`), and
SSO-gated preview URLs (`docs/platforms/README.md`).

Add to whichever file fits. Record what happened, not just the rule — a rule
sticks when it carries the story.

**A green build is not a rendered page.** Several defects here passed
`typecheck`, `lint`, and `build` cleanly and were only visible once rendered:
prose with every margin dropped, a Block indented out of line with the text
beside it, literal backticks around inline code, a table-of-contents entry
highlighting the wrong section. Rule 4 asks you to check the rendered page;
these are why.

**Schemas enforce shape, not meaning.** Asked to drop a stat, an agent hit
`statsSchema`'s exactly-four rule, correctly refused to widen the schema, and
substituted `MIT` / "License for client reuse" into a Block titled "The
numbers behind the pitch." Every gate passed; the section read as three
numbers and a licence. No schema change catches that. It is the clearest
argument for why the review step is not ceremony.

**On a pull request, the file list is the truth and the prose is a claim.**
An agent ran the dev server to verify its work — correctly — which rewrote a
generated file. It committed that side effect as its own `refactor:` commit
with a plausible rationale, then titled the whole pull request after it and
never mentioned the change that had been requested. Every check passed,
because none of them read English. `pr-hygiene` now catches *malformed*
descriptions; nothing catches untrue ones. Read the diff.

**A platform's own instructions outrank this file.** Codex reported that its
environment tells it to open a PR immediately after committing, contradicting
rule 7's pause, and correctly followed the platform. Nothing here is
sovereign. Write rules whose failure is tolerable: the pause is a nicety, and
the merge gate — enforced by GitHub, not by instruction — is what actually
protects the live branch.

**A safety check that fails is information.** `git push --force-with-lease`
was refused because a remote-tracking ref was stale. The response was
`git fetch && git push --force-with-lease`, which *defeats* the protection:
fetching refreshes the ref, so the lease compares the remote against itself
and always passes. Pin the SHA you actually looked at
(`--force-with-lease=<branch>:<sha>`) rather than working around the refusal.

**An approval prompt only catches what the approver can recognise.** A PR
body was passed as `--body "…\n…"`; shells do not expand `\n` inside double
quotes, so the description rendered as one run-on line of visible escapes.
The broken command was displayed for approval and approved, because nothing
about it looks wrong unless you already know the quoting rule. Fixed at the
source — write the body to a file and use `--body-file` — and gated by
`pr-hygiene`.

**A rule that assumes a capability fails silently on platforms that lack
it.** Three rules written here turned out to encode one platform's abilities
as if they were universal: "open a PR with `gh pr create`" (Codex ships no
`gh`), "verify write access by pushing a throwaway branch" (Codex cloud has
no git remote at all), and "amend the commit and force-push" (v0 pushes only
through its GitHub integration, which does not expose force-push). Each read
as a neutral instruction and each dead-ended an agent that was otherwise
doing everything right — the failure looks like agent incompetence and is
actually a rule written from one vantage point. When writing a rule, name
the capability it needs and give an alternative for platforms without it, or
write it so the requirement never arises. Getting a commit trailer right at
commit time needs no force-push; fixing it afterwards does.

**A resumed session brings a stale clone with it.** Continuing a chat from a
previous day reuses its container: the checkout is as old as the session, and
the conversation still holds work you believe is unlanded but which merged
hours ago. A branch whose merge base was 17 commits behind produced a pull
request that conflicted by re-adding an FAQ entry already on the live branch,
with `git status` looking healthy throughout. Verify your base before editing
— see `.agents/skills/sync-changes/SKILL.md` step 1.
