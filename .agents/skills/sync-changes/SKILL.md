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
`harness:check`, `content:check`, `catalog:check`, `gallery:check`, `lint`,
`test`, `typecheck`, and `build` on every pull request — that gate only
fires on a PR, so a direct push to any branch that skips the PR step skips
it entirely.

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
4. **Push the branch.** Being asked to make a change is authorization to
   commit and push it — the branch is not the live site, and nothing is
   published by it existing. Do not stop and ask permission to commit work
   you were just asked to do.
5. **Then pause, and ask before opening the pull request.** A PR is
   outward-facing: it creates a review artifact, notifies people, and starts
   CI. Say the branch is pushed, say what is in it, and ask whether to open
   the PR. Opening one is a single step once the answer is yes.
6. **Let CI run and let a human merge it.** This is the review step that
   makes "an agent may edit this site" safe to say at all. Never merge your
   own pull request.

### Opening the PR when `gh` is not installed

`gh pr create` is the obvious route and it is frequently unavailable —
several hosted agent platforms ship no `gh` binary at all, and the
capability report at session start (`scripts/preflight.sh`) says so. Not
having `gh` does not mean the PR cannot be opened. In order of preference:

1. A GitHub MCP tool, if one is connected to the session.
2. The platform's own PR control — Claude Code's **Create PR** action after
   a branch is pushed, or Codex's "open a pull request" step on a finished
   task. These exist precisely because the shell may have no GitHub CLI.
3. Ask the operator to open it from the branch, and give them the branch
   name.

Report which of these you used. "I pushed a branch but could not open a PR"
is only true after all three have failed.

## Commit trailers

Land agent-made commits with these two trailers, and no others:

```
Requested-by: client
Agent: Claude Code
```

`Requested-by:` is whoever asked for the change — `client` when a client
asked through an agent, or a name when you know it. `Agent:` is the platform
you are running on: `Claude Code`, `Codex`, `Cursor`, `Replit`. Both are
plain git trailers, so `git log --grep='^Requested-by: client'` answers
"what did the client change this month" and `git log --grep='^Agent: Codex'`
answers "what came through Codex" — which is the provenance a developer
actually wants when a surprising line turns up in a content file.

**Do not add vendor attribution trailers.** Several platforms append
`Co-Authored-By: <model name>` and a session URL by default. Strip them.
They credit the model vendor rather than recording who wanted the change,
they put a permanent AI-authorship marker in the history of what may be a
public client repo, and the session link is useless to anyone but the
account that created it. If your platform adds them automatically, amend the
commit before pushing.

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
