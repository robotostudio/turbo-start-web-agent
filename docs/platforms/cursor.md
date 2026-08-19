# Connecting a client repo to Cursor

For whoever at the agency is setting up a client's project on Cursor
(Cloud Agents, formerly background agents) — a one-time procedure per
project.

## 0. Before you start

Confirm the repo has its Cursor surface in place: `.cursorignore` at the
root. Run `pnpm run harness:check` from the repo root to confirm it's
current with `AGENTS.md`/`harness.config.json`; regenerate with
`pnpm run harness` if it isn't. There is **no `.cursor/rules/` directory in
this template, and that's deliberate** — see step 4.

## 1. Connect the repo, scoped to one repository

Cursor's Cloud Agents connect through a GitHub App. During setup, the
GitHub.com integration flow presents a real choice at authorization time:
**"Choose All repositories or Selected repositories."** Pick **Selected
repositories** and choose only this client's repo — unlike Replit's OAuth
connection (see the Replit runbook), Cursor's GitHub App install genuinely
does support installation-level repo scoping, so this step does what it
looks like it does.

Still connect using a dedicated identity (next step) rather than the
agency's own account, for the same defense-in-depth reason as the other
two platforms: an installation scoped to one repo is the platform doing its
part, but the account authorizing it should independently have no broader
reach either, in case that scope is ever changed or a different install
path is used later.

## 2. Use a push identity with write-only access

1. Create (or reuse) a dedicated GitHub identity for this client.
2. Add it as a **Collaborator with Write access** — not Admin, not
   Maintain. Cursor's own docs describe Cloud Agents as needing
   "read-write repo privileges" to push a branch and open a PR; nothing
   beyond Write is exercised.
3. Authorize the GitHub App as that identity when connecting this repo.

## 3. Automatic behavior: nothing to switch off, and that's the point

Cursor Cloud Agents don't have a background "auto-sync" feature either —
agents work on a separate branch and push for handoff as **merge-ready
PRs**, which is exactly the reviewable shape this template depends on.
There's no toggle to find and disable here.

Two things worth being deliberate about instead, since both *do* let an
agent act without someone first asking in a chat:

- **`@cursor` on a PR or issue comment** launches a Cloud Agent from that
  comment. If the client repo has other bots or CI posting comments
  automatically, decide who's allowed to trigger `@cursor` before treating
  this as configured, so an agent doesn't end up responding to its own or
  another bot's comment.
- **CI auto-fix on Cursor's own PRs** (GitHub Actions only) reacts to a
  failing check on a PR *the agent itself opened*, the same shape as Claude
  Code's Auto-fix. It doesn't touch PRs it didn't open, so it doesn't
  extend the agent's reach beyond what step 1 already scoped — but know
  it's there before you're surprised by a second commit on an agent PR you
  didn't ask for.

## 4. Disable platform-side rules that fight this template's conventions — don't "fix" the missing ones

Cursor reads `AGENTS.md` natively, at the root and in nested directories,
which is exactly why this template ships **no `.cursor/rules/*.mdc`
files** — adding one would just restate `AGENTS.md` in a second format
that drifts the moment one of the two is edited without the other. **If
you're the next person touching this project and notice `.cursor/rules/`
is empty, that is not an oversight to fix — leave it empty.**

What genuinely can conflict, and is worth checking, is Cursor's own rule
precedence: **Team Rules → Project Rules → User Rules, earlier wins on
conflict.** This template has nothing at the Project Rules layer to
out-rank a Team Rule, so if the agency's Cursor workspace has Team Rules
configured (workspace-wide conventions set in the Cursor dashboard), they
apply here unopposed. Before the first real session, check the workspace's
Team Rules for anything that contradicts `AGENTS.md` — a different
commit-message convention, a general instruction that encourages editing
components directly instead of composing content — and either scope it out
for this project or accept the conflict knowingly, rather than being
surprised by it later.

## 5. Branch protection: what you can actually rely on

GitHub's branch protection / repository rules are **free on public
repositories, on any plan** — but on a **private** repo (the normal case
for a real client project), enforcing them requires the repo's
organization to be on **GitHub Team or GitHub Enterprise** (GitHub's plan
comparison lists "Repository rules" for private repos starting at Team;
GitHub Free's rules apply to public repos only). Two honest postures:

- **Enforced** (private repo on Team/Enterprise, or any public repo): a
  ruleset or branch protection rule requiring `.github/workflows/ci.yml`'s
  checks and a PR before merge — GitHub itself will refuse a Cloud Agent
  PR that doesn't clear both, on top of Cursor already opening it as a PR
  rather than a direct commit.
- **Advisory-only** (private repo on GitHub Free): nothing on GitHub's side
  stops a direct push to the live branch by anyone with Write access,
  including the push identity from step 2. The discipline is entirely in
  `AGENTS.md` and `.agents/skills/sync-changes/SKILL.md`. Say this
  plainly to the client rather than implying protection exists on a plan
  that doesn't have it.

## 6. Smoke test

Launch a Cloud Agent on the connected repo (Cursor Web, Desktop, or a
`@cursor` PR comment) and ask *"What are your rules for making changes in
this repo, and where do they come from?"* A correct answer cites
`AGENTS.md` directly by name and its golden rules — compose-only content,
the build is the gate, land changes as a branch and PR. Because Cursor
reads `AGENTS.md` natively with no bridge file involved, there's no
intermediate file to go stale the way `CLAUDE.md` or `replit.md` can — if
the answer doesn't mention `AGENTS.md`, check that the file is actually at
the repo root and that nothing in `.cursorignore` is hiding it (it isn't,
by default; this repo's `.cursorignore` only excludes build output, the
lockfile, and the generated catalog).

## Known Cursor caveats, verified against primary sources

- **`AGENTS.md` is read natively, root and nested** — "Instructions from
  nested `AGENTS.md` files are combined with parent directories, with more
  specific instructions taking precedence." This template only has a root
  file today, but a future nested `AGENTS.md` (e.g. inside
  `artifacts/web/`) would layer on top of it automatically, no generator
  change required.
- **`.cursorignore` narrows Agent/Tab/Inline Edit and `@`-reference
  context — it is not a sandbox.** Cursor's own docs are explicit that
  terminal and MCP tool access cannot be blocked by `.cursorignore`; don't
  rely on it to keep an agent from *acting* on something, only from
  including it in context by default.
- **`.cursorrules` (the old root-file format) is deprecated.** If a client
  repo has one left over from before this template was adopted, migrate
  whatever it says into `AGENTS.md` and delete it — don't let it coexist
  with `AGENTS.md` as a second, drifting instruction surface.
