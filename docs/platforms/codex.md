# Connecting a client repo to Codex

For whoever at the agency is setting up a client's project on OpenAI Codex
(chatgpt.com/codex, the cloud product) — a one-time procedure per project.

Codex is the one supported platform that needs **nothing generated into the
repo**. It reads `AGENTS.md` natively, so there is no bridge file to emit and
no `harness-gen` adapter — which is why `"codex"` does not appear in
`harness.config.json`'s `platforms` array. That array drives the generator
(`scripts/harness-gen/index.ts`), and every entry must match a key in its
`ADAPTERS` map; adding `"codex"` there would fail generation with a named
error rather than doing anything useful.

What Codex *does* need is environment configuration, and all of it lives in
the Codex cloud UI rather than in any file you can commit. That is the whole
substance of this runbook.

## 0. Before you start

Confirm `AGENTS.md` is present at the repo root and under Codex's size cap.
Codex reads at most **32 KiB** of project docs by default
(`project_doc_max_bytes`), and silently reads only the first 32 KiB of a
larger file rather than failing — a quiet truncation that would drop the
later sections of the rulebook without any error to notice.

```sh
wc -c AGENTS.md    # keep comfortably under 32768
```

At the time of writing this repo's `AGENTS.md` is ~13.5 KB, about 41% of the
cap. If a client project grows it past roughly 26 KB, either move detail into
`.agents/skills/` (which Codex does not read, so the §2 table in `AGENTS.md`
has to carry the summary) or raise `project_doc_max_bytes` in a project
`.codex/config.toml`.

## 1. Connect the repo, scoped to specific repositories

Install the **Codex GitHub app** and, during installation, *choose the
repositories Codex can access*. Unlike Claude Code — where a cloud session
can reach any repository the connecting GitHub account can see, and the App
installation only governs PR webhooks — Codex's repository selection is the
access boundary. Select this one repository and no others.

Tasks can be started from chatgpt.com/codex, from a GitHub PR or issue (by
mentioning `@codex`), from Linear or Slack, or from the Codex CLI. Each task
runs in its own isolated container, and tasks run in parallel.

## 2. The environment, and the two traps in it

Per-repo environment configuration lives in the Codex cloud UI. The default
container is OpenAI's `universal` image
([spec](https://github.com/openai/codex-universal)), runtime versions are
pinnable, and it **auto-installs dependencies for pnpm** — so this repo
usually needs no setup script at all just to get `node_modules` in place.

Two behaviours will cost you an afternoon each if you meet them by surprise.

### Trap 1: the agent phase has no internet

Setup scripts run **with** internet. The agent phase — the part that actually
edits files and runs your commands — has **internet OFF by default**, and is
opened up only via an allowlist
([docs](https://developers.openai.com/codex/cloud/internet-access)).

Anything that needs the network must therefore happen during setup, not
during the task. Dependency installation already does (see above). What this
means for this template specifically:

- `pnpm install` — setup phase, fine.
- `pnpm run build` — **observed green in a Codex container** (2026-08-20):
  the full eight-command check sequence, build included, completed
  successfully during the agent phase. That is strong evidence and not yet
  proof: it only demonstrates the build needs no network if that container
  had agent-phase internet switched off, which was not checked at the time.
  The reasoning still holds independently — fonts come from the `geist` npm
  package rather than a font CDN, and `next/image` optimises remote images on
  request rather than at build time — so a static build should touch no host.
  To close it properly, confirm the environment's internet setting is off and
  re-run. If a task ever fails at the build step with a DNS or fetch error,
  an allowlist entry is the fix.

  The same run also served the site with `pnpm dev` and asserted on the
  returned HTML over `localhost`, so **rendered-output checking does work
  here** even though screenshots do not (`playwright` is not installed). An
  earlier attempt timed out because the dev server was still compiling — give
  it time rather than concluding it cannot be done.

### Trap 2: secrets are gone before the agent runs

Codex distinguishes **environment variables** (persist through the chat) from
**secrets** (encrypted, available *only during setup*, removed before the
agent phase).

That distinction matters here because `scripts/preflight.sh` reports
capabilities by probing environment variables — the `capabilities` array in
`harness.config.json`, currently `SLACK_WEBHOOK_URL` and
`BLOB_READ_WRITE_TOKEN`. If those are configured as Codex **secrets**, they
are already stripped by the time preflight runs, so the report says CANNOT
for capabilities that are in fact configured, and the agent tells the client
a form cannot be wired up when it can.

Also note that in a setup script, `export FOO=bar` does not survive into the
agent phase; values must be written to `~/.bashrc` to persist.

## 3. Delivery: there is no git remote

A Codex cloud container has **no `origin` configured**. A push fails with:

```
fatal: 'origin' does not appear to be a git repository
fatal: Could not read from remote repository.
```

That is the platform working as designed, not a broken connection, and it is
worth knowing before you spend a task's worth of work discovering it. Codex
delivers the **task's diff**: the agent commits locally, and a **Create PR**
control appears on the finished task in the Codex UI. A human clicks it, and
the branch and pull request are created from the diff.

Two consequences:

- **Do not verify write access by asking Codex to push a throwaway branch.**
  That test works on Claude Code and produces a false negative here, because
  it exercises a channel Codex does not have. On Codex the equivalent check
  is simply that the Create PR control appears and works.
- **An agent reporting "I could not push and no PR tool is available" has
  not failed.** It is describing the container accurately. The delivery step
  is yours, in the UI.

If the agent later amends its commit in response to review, the PR does not
update itself — the task's control changes to **Update branch**, and that has
to be clicked too.

## 4. Keeping automatic behaviour off

Codex has no background auto-sync equivalent: a task produces a summary and a
diff, and opening a pull request is an explicit action taken after review. The
default posture is already the one this template wants.

The one thing worth agreeing with the client up front is the `@codex`
mention-on-PR flow. Anyone who can comment on a pull request can start a Codex
task from it. On a public repository — which this template's own repo is —
that is worth understanding before turning it on for a client project.

## 5. Project config, and why this repo ships none

Codex supports a repo-committed `.codex/config.toml` for project overrides
(`project_doc_max_bytes`, MCP servers, and similar). This template does not
ship one, for two reasons: nothing in the default configuration needs
overriding at this size, and project `.codex/` layers are honoured **only for
trusted projects** — an untrusted project skips all of them, including hooks
and rules. A config file that silently does nothing depending on a
trust setting made elsewhere is a poor place to put anything load-bearing.

If a client project does need one, treat it as a per-project addition and
document it in that project's `AGENTS.md` §6, not as a template default.

## 6. Branch protection

Same reality as every other platform, and it is what makes the review
guarantee real rather than advisory. Repository rules are free on **public**
repositories on any plan; on a **private** repo they require GitHub Pro,
Team, or Enterprise.

Require a pull request before merging to the live branch and require
`.github/workflows/ci.yml`'s `checks` job to pass. This repo's own ruleset is
committed at [`.github/rulesets/main.json`](../../.github/rulesets/main.json)
and can be imported into a client repo through GitHub's ruleset import,
rather than reconstructed by hand.

Configure it with **no bypass actors**. An admin bypass would let a task
authenticated as an admin push straight to the live branch, which is exactly
the path the protection exists to close.

## 7. Smoke test

Start a task on the connected repo and ask *"What are your rules for making
changes in this repo, and where do they come from?"*

A correct answer references `AGENTS.md`'s golden rules — compose-only
content, the build is the gate, changes land as a branch and a PR, never a
direct push to the live branch — and names `AGENTS.md` as the source. Codex
reads that file with no bridge, so if it cannot name it, check that the file
is at the git root and under the size cap (§0).

Follow it with a real content change phrased the way a client would phrase
it, and confirm the diff touches only `content/`.

## Known Codex caveats, verified against primary sources

- **`AGENTS.md` is read natively**, locally and in the cloud, with nested
  files concatenated **root-down** — files closer to the working directory
  appear later and so override earlier guidance.
- **`AGENTS.override.md` takes precedence over `AGENTS.md`** in the same
  directory, and `~/.codex/AGENTS.override.md` is consulted before anything
  in the project at all. A developer's own global override can therefore
  change how Codex behaves in this repo with nothing visible in the repo to
  explain it — worth checking first when an agent ignores a rule that is
  plainly written down.
- **32 KiB default cap** on project docs (`project_doc_max_bytes`), applied
  by silent truncation.
- **Agent-phase internet is off by default**; setup scripts have it.
- **Secrets exist only during setup**; environment variables persist.
- **Environment configuration is not a repo file.** It lives in the Codex
  cloud UI per repository, so it cannot be generated, reviewed in a pull
  request, or carried between client projects by cloning — budget for
  configuring it by hand on every new client project.

Every claim above traces to
[`docs/research/agent-platform-surfaces.md`](../research/agent-platform-surfaces.md)
§3, which cites the OpenAI pages it came from. If Codex's documented
behaviour changes, that research file and this runbook both need a re-check
rather than a guess.
