---
name: sync-changes
description: Use at the start of any editing session in this repo, and before delivering any change — pull the latest state before editing, never commit directly to main, and land work as a branch and a pull request. Use whenever asked to make, save, ship, or publish a change, or when starting a new task here.
---

# Sync and deliver changes

This is a template: `main` is *not* guaranteed to be any given adopter's
production branch — that's a per-project decision, not something this repo
declares. On many projects it will be (this repo's own README documents
`VERCEL_ENV` disambiguating a production deploy from a preview one, which
only matters if `main` is what ships to production), but treat that as
unconfirmed until you know otherwise. **Before your first commit in a
session, confirm which branch this project actually deploys from** — ask
the operator, or check the hosting provider's project settings (e.g.
Vercel's Production Branch) — and treat *that* branch, not necessarily
`main`, as the one nothing gets pushed to directly. If you cannot confirm
it, assume the worst case (that the branch you're on ships live) rather
than the permissive one. Committing directly to the live branch publishes
to whoever is looking at the live site, with nobody having reviewed it
first. This repo's own CI (`.github/workflows/ci.yml`) runs
`content:check`, `catalog:check`, `gallery:check`, `lint`, `test`,
`typecheck`, and `build` on every pull request — that gate only fires on a
PR, so a direct push to any branch that skips the PR step skips it
entirely.

## The workflow

1. **Pull before editing.** `git fetch` and `git status` (or your platform's
   equivalent) to confirm you're starting from the current `main`, not a
   stale local copy — someone else's change may already be there.
2. **Never work directly on `main`.** Create or switch to a branch first,
   e.g. `git checkout -b <descriptive-name>` (this repo's own current branch,
   `feat/block-system`, is an example of the naming style — short,
   hyphenated, prefixed by kind of change).
3. **Commit** your change with a message describing *why*, not just what
   changed.
4. **Open a pull request** rather than pushing to `main` — e.g. `gh pr create`.
   Let CI run and let a human merge it. This is the review step that makes
   "an agent may edit this site" safe to say at all.

## Platform caveat — verify the push actually landed

On some hosted agent platforms the shell has no git credentials configured at
all, and the platform's own git panel (not the shell) is the only channel
that actually talks to the remote. In that situation, `git status`, `git log`,
or a cached `origin/main` can all look completely healthy locally — they're
reading a local cache — while being hours stale, because the shell was never
able to fetch or push in the first place. An agent that assumes shell `git`
works will commit locally, report success, and silently lose the work: it
never left the sandbox. Before calling a change "shipped," confirm it through
a channel that actually reflects the remote — the platform's own PR/branch
UI, or `gh pr view`/`git ls-remote` succeeding — not just a clean local
`git status`.
