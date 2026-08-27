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
`pnpm run checks` on every pull request — the same command you run locally,
covering `harness:check`, `content:check`, `catalog:check`, `gallery:check`,
`lint`, `test`, `typecheck`, and `build`. That gate only fires on a PR, so a
direct push to any branch that skips the PR step skips it entirely. Run
`pnpm run checks` before you deliver: CI runs the identical script, so a
failure there is one you could have seen first.

## The workflow

1. **Pull before editing, and say what base you are on.** `git fetch`, then
   check that your branch point actually matches the live branch:

   ```sh
   git fetch origin
   git log --oneline -1 origin/main
   git merge-base --is-ancestor origin/main HEAD && echo "up to date" || echo "STALE"
   ```

   State the result before your first edit — "starting from `abc1234`, which
   is current `origin/main`". One line, and it makes a whole class of failure
   visible immediately instead of at merge time.

   **This matters most in a resumed session.** Continuing yesterday's chat
   reuses yesterday's container: the clone is as old as the session, and the
   conversation still contains work you believe is unlanded but which was
   merged hours ago. You then commit on top of a base that no longer exists
   and re-apply changes already on the live branch. That happened here on
   2026-08-21 — a branch whose merge base was 17 commits behind produced a
   pull request that conflicted by re-adding an FAQ entry already merged.
   `git status` looked perfectly healthy throughout, because it was reading a
   stale cache.

   If you are stale, rebase onto the live branch or start a fresh branch from
   it. Do not build on the old base and leave the conflict for a human.
2. **Never work directly on `main`.** Create or switch to a branch first,
   e.g. `git checkout -b <descriptive-name>` (this repo's own current branch,
   `feat/block-system`, is an example of the naming style — short,
   hyphenated, prefixed by kind of change).
3. **Commit** your change with a message describing *why*, not just what
   changed. Being asked to make a change is authorization to commit it — a
   commit on a branch is not the live site, and nothing is published by it
   existing. Do not stop and ask permission to commit work you were just
   asked to do.
4. **Deliver it by whatever channel this platform actually has** (see
   below), then let CI run and let a human merge. This is the review step
   that makes "an agent may edit this site" safe to say at all. Never merge
   your own pull request.

### Delivery: name your channel before you run anything

Getting the branch up and opening the pull request are two separate steps,
and the route for each differs by platform. Work out which route you have
*before* typing a command, and say which one you used.

**Getting the branch up:**

1. **`git push`**, where the shell has a working `origin`.
2. **The platform's own git integration**, where the shell has no `origin`.
   Codex cloud containers have none by design — the task's diff is what gets
   delivered, not a pushed branch.

**Opening the pull request:**

1. **The platform's own Create PR control, wherever one exists — this
   outranks the shell.** v0, Claude Code cloud, and Codex all show one.
   Where there is a control, use it and do not reach for `gh` at all.
2. **A GitHub MCP tool**, if one is connected to the session.
3. **`gh pr create`**, only once you have confirmed that `gh` exists *and*
   is authenticated here.
4. **Ask the operator**, and tell them the branch name and what is on it.

Looking before you run costs one turn. On 2026-08-26 an agent on v0 pushed
its branch successfully, then ran `gh pr create`, and reported that it
"couldn't create the PR because GitHub CLI authentication isn't configured
in this environment" — while v0's own **Create PR** button sat in the
toolbar directly above that message. The branch was already on the remote.
Nothing was broken except the choice of route.

Two failures look alarming and are not:

- **No `gh` binary, or a `gh` that is not authenticated.** Several platforms
  ship none, and some ship one with no credentials. Neither is a permissions
  problem and neither blocks delivery — use the platform's own control.
- **`fatal: 'origin' does not appear to be a git repository`.** Codex cloud
  containers have **no git remote at all**, by design: the task's diff is
  what gets delivered, through the platform, not through a push. Seeing this
  does not mean the repository connection is broken, and it is not worth
  retrying — use the platform's own control.

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

## Writing the pull request body

**This section is about `gh` in a shell — route 3 above.** If you are opening
the pull request through a platform control or an MCP tool, type the body
into that and skip to the trailers section: there is no shell in the path,
so no escaping rule to get wrong.

**Never pass a multi-line body as a `--body "…"` argument.** Write it to a
file and use `--body-file`:

```sh
cat > /tmp/pr-body.md <<'EOF'
## The change

What changed, and why.
EOF
gh pr create --title "…" --body-file /tmp/pr-body.md
```

This is a mechanical rule, not advice about being careful, because the
failure it prevents is invisible until after the fact. A shell does **not**
expand `\n` inside double quotes — it passes a backslash and the letter `n`.
GitHub stores them, Markdown has no meaning for them, and the entire
description renders as one run-on line with the escapes showing. It happened
here on 2026-08-20 (`AGENTS.md` §6), and the broken command sat visible in an
approval prompt without anyone spotting it, because nothing about it looks
wrong unless you know the quoting rule.

`--body-file` has no shell escaping at all, so the defect cannot occur. If
your platform has a PR tool or UI control instead of a shell, use that and
this does not apply.

CI enforces it: the `pr-hygiene` workflow fails a pull request whose body
carries literal `\n` escapes, and re-runs when the body is edited, so fixing
it turns the check green without a new commit.

Two things the check cannot judge, which are yours:

- **The body must describe the change that was requested.** Not the setup you
  did along the way, not a side effect you swept up. An agent once titled a
  pull request after a generated file the dev server had rewritten, never
  mentioning the change the client asked for. Every automated check passed.
- **Say what you actually verified.** "Ran the checks" when you ran three of
  eight is worse than saying nothing.

## Commit trailers

Land agent-made commits with these two trailers, and no others:

```
Requested-by: client
Agent: Claude Code
```

**Each trailer goes on its own line**, and the same shell rule that mangles a
pull request body mangles a commit message: `-m "Requested-by: client\nAgent:
v0"` puts a literal backslash and `n` between them, git reads one trailer whose
value happens to contain two odd characters, and `Agent:` stops existing. That
shipped on PR #47 on 2026-08-27. Use a second `-m`, a heredoc, or `--file`. CI
fails it now (`pr-hygiene`), but the fix afterwards is an amend and a
force-push, so it is much cheaper to get right the first time.

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
account that created it.

**Get this right at commit time.** A trailer is part of the commit message,
so correcting it means `git commit --amend` and a force-push — a bigger
operation than getting it right once, and one that not every path can carry.
A hosted platform's shell frequently has no git credentials at all, so an
amend typed into a terminal never leaves the container: on 2026-08-21 an
agent read the failing check, diagnosed it correctly, amended the commit, and
could not deliver the fix, and the pull request had to be closed and the work
redone. The platform's *own* integration may well be able to rewrite the
branch even where its shell cannot — v0 does — so treat a failed force-push
as a fact about the path you took, not about the platform.

So: check the message *before* you commit. If your platform adds a trailer
automatically, remove it in the same step rather than planning to fix it
afterwards. And if you find yourself unable to force-push a correction from
the shell, do not retry it there — try the platform's own delivery path, and
if that is not available say so plainly, quote the corrected message, and ask
the operator to push it.

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
