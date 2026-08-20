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
4. **Commit it.** Being asked to make a change is authorization to commit
   it — a commit on a branch is not the live site, and nothing is published
   by it existing. Do not stop and ask permission to commit work you were
   just asked to do.
5. **Deliver it by whatever channel this platform actually has** (see
   below), then let CI run and let a human merge. This is the review step
   that makes "an agent may edit this site" safe to say at all. Never merge
   your own pull request.

### Delivery: find your channel before concluding you have none

`git push` and `gh pr create` are the obvious routes and neither is
universal. Work down this list and say which one you used:

1. **`git push`**, where the shell has a working `origin`.
2. **A GitHub MCP tool**, if one is connected to the session.
3. **The platform's own control.** Claude Code shows a **Create PR** action
   once a branch is pushed; Codex shows one on a finished task, built from
   the task's diff rather than from a pushed branch.
4. **Ask the operator**, and tell them the branch name and what is on it.

Two failures look alarming and are not:

- **No `gh` binary.** Several platforms ship none. It is not a permissions
  problem and it does not block delivery — use route 2 or 3.
- **`fatal: 'origin' does not appear to be a git repository`.** Codex cloud
  containers have **no git remote at all**, by design: the task's diff is
  what gets delivered, through the platform, not through a push. Seeing this
  does not mean the repository connection is broken, and it is not worth
  retrying — go to route 3.

A `403` on push is different from both: that one *is* a credentials problem,
and it means the session has read access only. Say so plainly rather than
retrying.

### Pausing before the pull request

Where you control when the PR opens, pause first: say the change is
committed, say what is in it, and ask. A PR is outward-facing — it creates a
review artifact, notifies people, and starts CI.

Where the platform's own instructions tell you to create the PR immediately,
**follow the platform.** Its system and developer instructions outrank this
file, and there is no safety cost to losing the pause: the PR is not the
gate. Nothing reaches the live branch without a human merging it, and on a
protected branch GitHub itself refuses anything that skips that path.

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
