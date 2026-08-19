# Connecting a client repo to Replit

For whoever at the agency is setting up a client's project on Replit — a
one-time procedure per project, not per session. Do this once when the
client project is ready to hand to Replit's Agent; it doesn't need
repeating unless the connection is torn down and rebuilt.

## 0. Before you start

The repo should already have the generated harness surfaces in place:
`replit.md`, `.replit`, and `.agents/skills/` at the root. If you're not
sure they're current, run `pnpm run harness:check` from the repo root — a
clean pass means they match `AGENTS.md` and `harness.config.json`. If it
fails, run `pnpm run harness` to regenerate, then commit.

## 1. Connect the repo, scoped to one repository

Import the client's repo through Replit's guided GitHub import (Replit
dashboard → Import from GitHub), picking that one repository. One Repl maps
to one repo — importing creates a single workspace bound to exactly the
repo you selected, so there's no "import the whole org" step to avoid the
way there is on GitHub-App-based platforms.

The scoping caveat is on the *authorization*, not the import screen: the
GitHub connection Replit uses for this (Account → Connected Services) is a
classic OAuth App connection, not a per-repo GitHub App installation —
Replit's own docs describe an OAuth app and don't document any "grant
access to only these repositories" step at connection time. In practice
that means the picker limits which repo *this Repl* is bound to, but not
which repos the underlying connected GitHub identity could technically
reach. The fix is who you connect, not a setting you flip — see the next
step.

If the repo lives in a GitHub organization, the org admin has to approve
the Replit OAuth app before the import will work; ask them to do that for
this specific access request rather than granting a standing organization-
wide approval if your org's GitHub settings let you scope it.

## 2. Use a push identity with write-only access

Don't connect Replit using the agency's own everyday GitHub account — it
almost certainly has access to every other client repo you manage, and
Replit's connection isn't scoped to prevent that (previous step). Instead:

1. Create (or reuse) a dedicated GitHub identity for this client — a bot/
   service account, or a fine-grained personal access token scoped to just
   this repository.
2. Add that identity to the client repo as a **Collaborator with Write
   access** — not Admin, not Maintain. Write is enough to push branches;
   Replit doesn't open pull requests itself (not documented anywhere in
   Replit's git-interface or import docs — merging happens on GitHub), so
   nothing beyond Write is ever exercised.
3. Connect Replit's GitHub integration using *that* identity's
   authorization, not the agency account's.

This is what actually bounds Replit to this one repo: not a setting inside
Replit, but the fact that the identity it's authorized as can't see
anything else.

## 3. Automatic behavior: there's no toggle, know what's actually automatic

Replit doesn't have a background "auto-sync" feature to switch off — its
Git pane docs describe commit/push/pull as one-click, operator-triggered
actions, and the GitHub import docs describe importing as a one-time
action, not an ongoing sync. So there's nothing to find and disable here.

What *is* automatic, and worth knowing instead: Replit's Agent rewrites
`replit.md` on disk as a normal side effect of ordinary use (see the
caveat below) — that's a local file edit, not a git push. It only reaches
the remote once something commits and pushes it. Don't assume "nothing
pushes on its own" means "nothing changes on its own" — check what's
actually staged before trusting a commit message the Agent proposes.

## 4. Disable platform-side rules that fight this template's conventions

Replit Workspace Settings → Customization can hold two things that apply
across *every* project the connected Replit account touches: always-on
custom instructions, and workspace-level skills (availability depends on
plan — Enterprise: admin-managed; Pro: any member; Core: skills only, no
custom instructions). Before the first real session on this project, check
that page for anything that contradicts `AGENTS.md` — a general "always
rewrite the whole file" habit, a workflow that encourages committing
straight to a branch without review — and turn it off for this workspace,
or confirm it's scoped elsewhere.

The project's own skills (`.agents/skills/compose-page`,
`.agents/skills/sync-changes`, `.agents/skills/find-skills`) need no setup;
Replit's Agent discovers anything under `.agents/skills/` automatically
per the agentskills.io spec.

## 5. Branch protection: what you can actually rely on

GitHub's branch protection / repository rules are **free on public
repositories, on any plan** — but on a **private** repo (the normal case
for a real client project), enforcing them requires the repo's
organization to be on **GitHub Team or GitHub Enterprise** (GitHub's own
plan comparison lists "Repository rules" for private repos only from Team
up; GitHub Free's rules apply to public repos only). Two honest postures,
not one:

- **Enforced** (private repo, org on Team/Enterprise, or any public repo):
  set a ruleset or classic branch protection rule requiring the CI checks
  in `.github/workflows/ci.yml` to pass and requiring a PR before merge.
  Direct pushes to the protected branch are rejected by GitHub itself.
- **Advisory-only** (private repo, org on GitHub Free): there is no GitHub-
  enforced backstop. The discipline in `.agents/skills/sync-changes/SKILL.md`
  (branch → PR → review, never a direct push) is a convention the agent
  follows because it's instructed to, not one GitHub will block a violation
  of. Say this plainly to the client rather than implying protection exists
  when it doesn't.

## 6. Smoke test

Open a fresh Agent chat in the connected Repl and ask something like *"What
are your rules for making changes in this repo, and where do they come
from?"* A correct answer names `AGENTS.md` (or `replit.md`, which points
back to it) and mentions the golden rules — compose-only content, the build
as the gate, landing changes as a branch and pull request rather than a
direct push. If the Agent answers with generic Replit boilerplate and never
mentions `AGENTS.md`, `replit.md` is likely stale or missing: check
`pnpm run harness:check` and re-run `pnpm run harness` if it fails.

## Known Replit caveats, verified against primary sources

- **The Agent rewrites `replit.md` as a side effect of normal use.** This
  is documented Replit behavior, not a bug in this repo's generator — the
  Agent both reads *and writes* `replit.md` as a project evolves. Expect
  `pnpm run harness:check` to fail periodically on this file specifically;
  when it does, that's the drift gate doing its job. Reconcile the
  Agent's version against `AGENTS.md` for anything worth keeping, then run
  `pnpm run harness` to regenerate the canonical version and commit.
- **The shell may have no git credentials even though the Git pane does.**
  Replit's git pane is a separate channel from shell `git` — on some
  workspace configurations the shell simply isn't authenticated, so `git
  push` from a shell command can fail (or silently do nothing useful) while
  the Git pane still works. An agent that assumes shell `git` succeeded
  because the command didn't error can report a change as shipped when it
  never left the sandbox. `scripts/preflight.sh` runs on boot (`onBoot` in
  `.replit`) specifically to catch this — read its report before trusting
  any "I pushed that" claim, and prefer the Git pane or `gh pr view` over a
  bare local `git status` as the source of truth for what actually reached
  the remote.
- **A cached `origin/main` can look healthy while being hours stale.** If
  the shell can't reach the remote, `git log`, `git status`, and even a
  stale local `origin/main` ref will still *look* clean — they're reading
  a local cache, not the remote. Don't treat a clean local git state as
  proof anything synced; confirm through the Git pane or `gh pr view`.
- **`[workflows]`, `[postMerge]`, and `.replitignore` are not used by this
  project's generated `.replit`.** The research behind this harness found
  no primary source documenting any of the three against Replit's official
  configuration reference — they're empirically observed in some
  Agent-generated repos, not contractual. Don't add them by hand assuming
  they'll behave a particular way; verify against a live Agent-generated
  repo first if you need them.
