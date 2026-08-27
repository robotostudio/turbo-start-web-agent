<!--
  GENERATED FILE — do not edit directly.
  Source: AGENTS.md and harness.config.json (edit those), or
  scripts/harness-gen/adapters/replit.ts (edit the wording below).
  Regenerate with `pnpm harness`.

  Heads up: Replit's own Agent may rewrite this file as a side effect of
  normal use — that's expected Replit behavior, not a bug in this
  generator (see docs/research/agent-platform-surfaces.md §1). If it
  happens, the next `pnpm harness:check` will fail and name this file as
  drifted, which is the cue to reconcile it against AGENTS.md and
  regenerate rather than to keep hand-editing it.
-->

# Harbour

This is **Harbour**, a marketing website. You — or whoever you hand this
workspace to — can ask the built-in Agent to make content changes in plain
English: "update the homepage headline," "add a new team member to the
about page," "change the newsletter button text." The Agent does the actual
editing; you don't need to read or write any code yourself.

## Do not migrate this project

**This is a Next.js App Router project. Do not migrate it to Vite, or to
any other framework or build tool.** Do not "port" it, "adapt" it, or
"convert the rendering layer" — not as a setup step, not as an
optimisation, not to make it fit this platform better. If a task appears
that proposes any of that, stop and say so rather than starting it.

This is not a preference. The entire content pipeline depends on the
Next.js build: MDX is compiled by Velite, validated by a remark plugin that
rejects executable content, and rendered through the App Router as static
pages. A framework migration destroys all of it, and the site's safety
guarantee with it.

Editing content is always the job. Changing how the project is built never
is.

## Where the rules live

The full rulebook for how this site may safely be edited lives in
`AGENTS.md` at the root of this project — the Agent reads it, you don't
need to. Its golden rules, quoted directly from that file so this page
can't quietly drift from it:

> 1. **Static-only rendering.** Content in `content/` is data, not code. It may
>    only compose named Blocks (capitalized tags) with literal prop values —
>    no `import`/`export`, no function calls, no raw HTML elements, no runtime
>    expressions. This is enforced at build time, not by convention — see
>    §3.
> 2. **Compose before extend.** Almost every task is composing existing Blocks
>    from `catalog.json` into MDX (§3). Only touch schemas or components (§4)
>    when no existing Block can express the content.
> 3. **Design tokens and type roles only.** Blocks and primitives reference
>    the CSS custom properties and `type-*` roles defined in
>    `artifacts/web/src/app/globals.css` — never a raw hex code, a px value, or
>    a bare `text-2xl font-semibold` stack. Re-theming a client site means
>    editing values there, never renaming or removing a token (every Block
>    references them by name). The full vocabulary is §3a.
> 4. **The build is the gate — run `pnpm run checks` before delivering.** That
>    one command is the whole gate (§5), and it is what CI runs, so green
>    locally means green there. Fix the content, not the schema. A green build
>    is necessary but not sufficient — check the rendered page before calling a
>    change done.
>    Where you have a browser, click through it (nav, footer, every linked
>    page). Where you do not, serve the build and assert on the returned HTML
>    for the strings you changed; that catches wrong-content far better than a
>    green build alone, even without a screenshot.
> 5. **`const` only.** Never `let` or `var`, except where a loop genuinely
>    reassigns.
> 6. **kebab-case filenames.** Exports keep PascalCase (component names,
>    types).
> 7. **Being asked for a change authorizes the commit, not the pull request.**
>    Commit the work you were asked to do — a branch publishes nothing. Then
>    pause and ask before opening the PR, which is outward-facing. Where a
>    platform's own instructions require opening the PR immediately, follow
>    the platform: its instructions outrank this file, and the PR was never
>    the gate — merging is. Never a direct push to `main`, and never merge
>    your own PR. Commit trailers are `Requested-by:` and `Agent:`; never
>    `Co-Authored-By:` or a session URL. Delivery channels differ per platform
>    (some have no `origin` remote at all) —
>    see `.agents/skills/sync-changes/SKILL.md`.

If the Agent ever proposes editing code instead of content, or skipping a
check below, point it at rule 2 or rule 4 above and ask it to follow it.

## Before you trust a change

Rule 4 above is not just a suggestion: every change has to pass the checks
listed in `AGENTS.md` §5 before it's safe to publish. Ask the Agent to run
them and show you the result. A clean pass is necessary but not sufficient
— always ask the Agent to also open the page it just changed in preview and
confirm it actually looks right, since some mistakes only show up when you
look.

## Shipping a change

Rule 7 above means changes land as a branch and a pull request, never a
direct push to `main` — `main` is what the live site serves, so a direct
push publishes before anyone has reviewed it. Ask the Agent to open a pull
request (or use the Git pane yourself) rather than merging straight to
`main`.

## On boot

This workspace runs `scripts/preflight.sh` automatically on boot and
prints a report of what it can and cannot do here — for example, whether it
can reach GitHub to open a pull request, or whether an optional feature
like Slack notifications or image uploads is configured. If something
related isn't working, check that report first; it names exactly what's
missing and what to do about it.
