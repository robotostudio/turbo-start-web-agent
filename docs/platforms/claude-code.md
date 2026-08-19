# Connecting a client repo to Claude Code

For whoever at the agency is setting up a client's project on Claude Code
(claude.ai/code, the cloud product) — a one-time procedure per project.

## 0. Before you start

Confirm the repo has its Claude Code bridge in place: `CLAUDE.md` at the
root (an `@AGENTS.md` import plus Claude-specific notes) and a mirrored
`.claude/skills/` directory. Run `pnpm run harness:check` from the repo
root — a clean pass confirms both are current. **This bridge is not
optional**: Claude Code does not read `AGENTS.md` on its own at all; without
`CLAUDE.md` importing it, every rule in `AGENTS.md` — the compose-only
content model, the build-is-the-gate rule, branch-and-PR discipline — is
simply invisible to Claude Code, cloud or local.

## 1. Connect the repo, scoped to one repository

Cloud sessions need GitHub access to clone and push. There are two ways to
grant it — the **Claude GitHub App**, authorized during onboarding at
claude.ai/code, or `/web-setup` run in a local `gh`-authenticated terminal,
which syncs that terminal's `gh` token to the connecting Claude account.

The scoping caveat that matters here is one Anthropic's own docs state
directly: with *either* method, **a cloud session can access any repository
the connecting GitHub account can see — not just the repositories the
Claude GitHub App happens to be installed on.** Installing the App on a
specific repository only enables that repo's PR webhooks (for Auto-fix,
§4); it is not a session-level access control. Anthropic's documented
guidance for restricting reach is: *"restrict access on GitHub itself, for
example by limiting team or repository membership for the connected GitHub
accounts."* In other words, picking "only this repository" in the App
installer does not by itself stop a session from reaching a client's other
repos if the connecting account can see them — the identity you connect is
what has to be scoped, exactly as in step 2.

## 2. Use a push identity with write-only access

Don't connect Claude Code using the agency's own everyday GitHub account —
per the caveat above, sessions inherit whatever that account can see, which
for a working agency account is likely every client repo it manages.
Instead:

1. Create (or reuse) a dedicated GitHub identity for this client — a bot/
   service account, or one whose repository membership is limited to just
   this repo.
2. Add it as a **Collaborator with Write access** — not Admin, not
   Maintain. Claude Code's own PR flow needs to push branches and open PRs,
   both of which Write access covers.
3. Authorize the Claude GitHub App, or run `/web-setup`, as *that* identity
   — not the agency's own account. This is what actually bounds sessions to
   this one repo, per step 1.

## 3. Keep auto-fix off (this platform's analogue of "auto-sync")

Claude Code doesn't have a background auto-sync feature — pushes only
happen when Claude pushes a branch it's working on, and PR creation is an
explicit **Create PR** action a human takes after reviewing the diff. The
one feature that *does* act automatically once turned on is **Auto-fix
pull requests**: Claude subscribes to a PR's GitHub activity and pushes
fixes on its own in response to CI failures or review comments.

Auto-fix is **off by default and per-PR** — it requires the Claude GitHub
App installed on the repo, and then an explicit opt-in per PR (the CI
status bar's Auto-fix toggle, the `/autofix-pr` command, or telling Claude
in chat to watch a PR). For this template's review-before-publish premise,
leave it off: don't select it in the CI status bar, don't run
`/autofix-pr`. Anthropic's own docs carry a relevant warning worth
repeating to the client too: if the repo's CI has comment-triggered
automation (Terraform Cloud, Atlantis, custom Actions on `issue_comment`),
Auto-fix's replies to review threads post from *your* GitHub account and
can trigger that automation — reason enough on its own to leave it off
unless someone has deliberately decided otherwise for this project.

## 4. Disable platform-side rules that fight this template's conventions

Two places Claude Code layers instructions on top of a repo's own
`CLAUDE.md`, and both are worth checking before the first real session:

- **Organization-level managed policy `CLAUDE.md`.** Claude Code's load
  order is managed policy → user `~/.claude/CLAUDE.md` → project
  `CLAUDE.md`, all concatenated (nothing overrides; everything applies).
  If the agency's Claude Code organization has a managed policy configured
  in admin settings, it loads for every session regardless of repo and can
  carry generic conventions (a different commit-message style, a different
  default git workflow) that read as contradicting this template's rules
  even though neither file is wrong on its own. Check claude.ai's admin
  settings for a managed policy and reconcile anything that conflicts
  before treating this project as configured.
- **A developer's own `~/.claude/` config, if working locally rather than
  in the cloud.** Cloud sessions never see anything under `~/.claude/` on
  anyone's machine — only what's committed to the repo — so this is a
  local-CLI-only concern, but worth a line to whoever might run Claude Code
  against this repo from their own terminal: personal global skills or
  rules there can still apply and should be checked for conflicts the same
  way.

There's nothing to disable in the repo itself — no `.claude/settings.json`,
`.claude/rules/`, or `.mcp.json` ships with this template, so there's no
project-committed configuration fighting `AGENTS.md`/`CLAUDE.md`; anything
that does conflict is coming from outside the repo, per the two bullets
above.

## 5. Branch protection: what you can actually rely on

GitHub's branch protection / repository rules are **free on public
repositories, on any plan** — but on a **private** repo (the normal case
for a real client project), enforcing them requires the repo's
organization to be on **GitHub Team or GitHub Enterprise** (GitHub's plan
comparison lists "Repository rules" for private repos starting at Team;
GitHub Free's rules apply to public repos only). Two honest postures:

- **Enforced** (private repo on Team/Enterprise, or any public repo): a
  ruleset or branch protection rule requiring `.github/workflows/ci.yml`'s
  checks to pass and a PR before merge. Claude Code's own flow already
  matches this shape — session work lands as a branch, a human clicks
  **Create PR**, CI runs — a protected branch just makes GitHub itself
  refuse anything that skips that path.
- **Advisory-only** (private repo on GitHub Free): nothing on GitHub's side
  blocks a direct push to the live branch. The discipline lives entirely in
  `.agents/skills/sync-changes/SKILL.md` and `AGENTS.md` — instructions
  Claude Code follows because it's told to, not a rule GitHub enforces. Be
  explicit with the client about which posture their plan actually gives
  them.

## 6. Smoke test

Start a fresh session on the connected repo — cloud or local — and ask
*"What are your rules for making changes in this repo, and where do they
come from?"* A correct answer references `AGENTS.md`'s golden rules
(compose-only content, the build is the gate, land changes as a branch and
PR, never push straight to the live branch) and, if asked, can explain that
it's reading them via the `@AGENTS.md` import in `CLAUDE.md` — not from
memory or from generic Claude Code defaults. If it can't name `AGENTS.md`
or `CLAUDE.md` at all, the bridge isn't wired up; re-check step 0.

## Known Claude Code caveats, verified against primary sources

- **Claude Code does not read `AGENTS.md`.** It reads `CLAUDE.md` only; the
  `@AGENTS.md` import in this repo's `CLAUDE.md` is the entire reason the
  rulebook is visible to it at all (step 0).
- **Cloud sessions load `.claude/skills/`, `.claude/agents/`,
  `.claude/commands/`, `.claude/rules/`, `.claude/settings.json` hooks, and
  `.mcp.json` from the repo clone — and nothing from any developer's own
  machine.** Anything a cloud session needs to see has to be committed to
  the repo; this template's `.claude/skills/` mirror (generated from
  `.agents/skills/` by `pnpm run harness`) exists specifically so the
  session-start discipline in `sync-changes/SKILL.md` is visible in the
  cloud, not just locally.
- **Environment prep is a claude.ai setup script plus a repo `SessionStart`
  hook, not a devcontainer.** Cloud environments have no devcontainer
  support; a claude.ai environment (configured in the web UI, not a repo
  file) provisions the VM's toolchains, and a `SessionStart` hook in
  `.claude/settings.json` — typically gated on `CLAUDE_CODE_REMOTE=true` —
  handles project setup like installing dependencies. This repo does not
  currently ship a `SessionStart` hook (there is no `.claude/settings.json`
  yet); running `scripts/preflight.sh` automatically at cloud session
  start, the way Replit's `onBoot` does, would need one added deliberately
  — it doesn't happen on its own today.
