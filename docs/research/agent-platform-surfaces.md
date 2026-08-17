# Agent platform integration surfaces — primary-source research

Research for `turbo-start-web-agent` / `harness-gen`. Compiled 2026-08-17 from official docs only (vendor doc sites, spec sites). Secondary sources are explicitly labeled where used. Each claim cites its source URL inline. Items that could NOT be verified against a primary source are flagged **UNVERIFIED**.

Note on OpenAI URLs: `developers.openai.com/codex/*` now 308-redirects to `learn.chatgpt.com/docs/*`. Both forms are given where relevant; the `developers.openai.com` paths are the canonical published links.

---

## 1. Replit (Agent 3 / workspace)

### `.replit` file
Source: https://docs.replit.com/features/project-setup/configuration (raw md: `.../configuration.md`)

- TOML format; controls app behavior. Documented top-level keys: `entrypoint`, `modules`, `language`, `hidden`, `audio`, `run`, `build`, `compile`, `onBoot`, `packager.*` (`afterInstall`, `ignoredPaths`, `ignoredPackages`, `[packager.features]` with `guessImports`/`packageSearch`/`enabledForHosting`), `[[ports]]` (`localPort`/`externalPort`), `[nix] channel`, `[unitTest] language`, `[gitHubImport] requiredFiles`, `[deployment]` (`run`, `build`, `deploymentTarget`, `ignorePorts`), `[run]`/`[run.env]`.
- `onBoot`: "Command that executes when the Replit App boots up" — example `onBoot = "npm install"` (verified in the raw doc text).
- **`[workflows]`: NOT documented in the official `.replit` reference.** Workflows are documented as a workspace pane feature (below). Replit-generated apps do store workflow definitions in `.replit` in practice, but I found no official doc specifying that TOML schema — **treat the `[[workflows.workflow]]` TOML shape as UNVERIFIED against official docs** (GitHub code search was rate-limited during this research; verify against a real Agent-generated repo before hard-coding).
- **`[postMerge]`: NO primary source found.** Not in the official configuration reference, not findable in Replit docs search. **UNVERIFIED — do not build on it.**
- `[agent]` section: also not in the official reference. **UNVERIFIED.**

### Workflows (pane)
Source: https://docs.replit.com/features/workspace-tools/workflows

- "A reusable, customizable sequence of steps" run via the Run button dropdown or Workflows pane. Task types: **Execute Shell Command**, **Install Packages** (UPM), **Run Workflow** (composition, with nesting depth limit). Modes: **Sequential** (failure stops the chain) and **Parallel**. "Run Replit App" keeps the `.replit` `run` command.
- The workflows doc does not state where workflow definitions are persisted (no TOML syntax shown).

### `replit.md` (instructions file)
Source: https://docs.replit.com/features/project-setup/replit-dot-md (also served at `/replitai/replit-dot-md`)

- Agent auto-generates `replit.md` for new projects; you can create it manually and "Agent will detect it in future conversations".
- "replit.md must be located in your project's root directory to work properly." Agent won't detect it in subdirectories. Extremely large files may not be fully processed. Agent updates it as the project evolves (i.e., **Agent writes to this file** — harness-gen output here will be mutated by the platform).
- **AGENTS.md is not mentioned anywhere in the replit.md doc.** No official AGENTS.md support in Replit docs. A symlink workaround (`replit.md -> AGENTS.md`) circulates in secondary sources (e.g. sourcetoad.com blog) — **secondary, UNVERIFIED officially**.

### Agent Skills
Sources: https://docs.replit.com/features/agent/skills · https://docs.replit.com/features/agent/skills-directory · https://docs.replit.com/features/agent/agent-customization

- Project-level skills live in **`/.agents/skills`** in the repo (versioned, persist across chats). Each skill is a folder with a `SKILL.md` plus supporting files.
- Skills follow the open **Agent Skills specification** at https://agentskills.io/specification — same convention as Anthropic/Claude skills, so one skill folder can serve multiple platforms.
- Loading: Agent reads every installed skill's name+description each chat; full body loads only when relevant. "Use a skill" picker + Skills directory of Replit/partner-built skills.
- Workspace-level: custom instructions (always-on, injected into every project's context) and workspace skills, managed in Workspace Settings → Customization. Plans: Enterprise (admin-managed), Pro (any member), Core (skills only, no custom instructions). Per-project `custom_instruction/instructions.md` exists for team templates (https://docs.replit.com/teams/custom-templates).

### GitHub integration / Git pane
Sources: https://docs.replit.com/features/workspace-tools/git-interface · https://docs.replit.com/build/import-from-providers

- Import: guided import supports public and private repos; "Replit detects your app stack, installs dependencies, and configures run commands". The import flow uses a **separate GitHub connection (Replit OAuth app)** from Account → Connected Services; org repos require the org admin to grant the Replit OAuth app access. Docs describe an OAuth app, not a per-repo GitHub App install.
- Git pane: init repo or connect existing remote (`git remote add origin ...` also works); create/switch/publish branches; one-click commit/push/pull; Shell git and pane stay in sync. For GitHub.com HTTPS auth the docs say to "use a personal access token instead of your password".
- **PR creation from Replit: not mentioned in the docs** — merging/PRs happen on GitHub. Enterprise plan supports GitHub Enterprise Server, GitLab Self-Managed, Bitbucket Data Center.

### `.replitignore`
- **Not present in current official docs** (site search returns nothing). It appears only in legacy/third-party material. **Treat as UNVERIFIED/legacy — don't rely on it.**

---

## 2. Claude Code on the web (claude.ai/code)

Sources: https://code.claude.com/docs/en/claude-code-on-the-web · https://code.claude.com/docs/en/web-quickstart · https://code.claude.com/docs/en/cloud-environments · https://code.claude.com/docs/en/memory

### Repo connection & PR flow
- Research preview for Pro/Max/Team (+ Enterprise premium seats). Two GitHub auth methods: **Claude GitHub App** (installed during onboarding at claude.ai/code) or **`/web-setup`** in the CLI (syncs your local `gh` token to your Claude account). Either grants sessions access to *any repo the connected account can see*; App installation is only required for **Auto-fix PRs** (webhooks). (claude-code-on-the-web#github-authentication-options)
- Session flow: repo cloned into an isolated Anthropic-managed VM (Ubuntu 24.04 x86_64), Claude works, then **pushes a branch**; user reviews the diff and clicks **Create PR** (full PR, draft, or GitHub compose page). Session stays live after PR creation. (web-quickstart#review-and-iterate)
- Auto-fix: Claude watches a PR for CI failures/review comments and pushes fixes; replies are posted from the *user's* GitHub account, labeled as Claude Code. Requires the GitHub App on the repo. (claude-code-on-the-web#auto-fix-pull-requests)
- Permission modes in cloud: Auto / Accept edits / Plan only (no Manual/Bypass).

### What config the cloud session reads (exact table from cloud-environments#what-carries-over-from-your-setup)
Available (because part of the clone): repo `CLAUDE.md`; `.claude/settings.json` hooks; `.mcp.json` MCP servers; `.claude/rules/`; **`.claude/skills/`, `.claude/agents/`, `.claude/commands/`**; plugins declared in `.claude/settings.json`. NOT available: anything under `~/.claude/` (user CLAUDE.md, user skills), user-scoped plugins, local/user MCP servers, static credentials, interactive SSO. "To make your own configuration available in cloud sessions, commit it to the repo."

### CLAUDE.md / AGENTS.md reading order
Source: https://code.claude.com/docs/en/memory

- Load order: managed policy CLAUDE.md → user `~/.claude/CLAUDE.md` → project `./CLAUDE.md` or `./.claude/CLAUDE.md` (+ `CLAUDE.local.md` appended per directory). Walks up the directory tree; ancestor files load at launch, subdirectory CLAUDE.md files load on demand when Claude reads files there. All files concatenate (root-down order); nothing overrides, later = closer to cwd.
- **"Claude Code reads `CLAUDE.md`, not `AGENTS.md`."** Official bridge: create a `CLAUDE.md` containing `@AGENTS.md` (import syntax, max 4 hops) or symlink `ln -s AGENTS.md CLAUDE.md`. `.claude/rules/*.md` supports `paths:` frontmatter for path-scoped rules.

### Environment setup
Source: https://code.claude.com/docs/en/cloud-environments

- **No devcontainer support.** Environment = named config in the claude.ai UI with: network access level (**Trusted** default = package-registry allowlist; **Custom** domain list; **None**; plus "Also include default list" checkbox), env vars (`.env` format, visible to anyone using the environment — **no secrets store yet**), and a **setup script** (Bash, runs as root, before Claude Code launches, ~5-minute budget). After first run the filesystem is snapshotted (**environment cache**, ~7-day expiry) so later sessions skip setup.
- Recommended split: setup script provisions the VM (toolchains); **`SessionStart` hook in repo `.claude/settings.json`** for project setup like `npm install`, gated on `CLAUDE_CODE_REMOTE=true` for cloud-only behavior. Replacing the base image isn't supported; Docker-in-VM is available.
- Pre-installed: Node 20/21/22 (+npm/yarn/pnpm/bun — **Bun has known proxy issues**), Python, Ruby, etc. GitHub traffic goes through an authenticated proxy (`GH_TOKEN=proxy-injected`).

---

## 3. OpenAI Codex (cloud + IDE)

### AGENTS.md mechanics
Source: https://developers.openai.com/codex/guides/agents-md (→ https://learn.chatgpt.com/docs/agent-configuration/agents-md)

- Discovery: global first — `~/.codex/AGENTS.override.md`, then `~/.codex/AGENTS.md` (first non-empty wins; `CODEX_HOME` relocates). Then project scope: from the **git root down to the cwd**, each directory checked for `AGENTS.override.md`, then `AGENTS.md`, then names in `project_doc_fallback_filenames` (config.toml, e.g. `["TEAM_GUIDE.md", ".agents.md"]`) — at most one file per directory.
- Merge: "Codex concatenates files from the root down, joining them with blank lines. Files closer to your current directory override earlier guidance because they appear later in the combined prompt."
- Size cap: combined docs limited by `project_doc_max_bytes`, **32 KiB default** (raisable in config).
- Cloud: the cloud-environment doc confirms "If your repo includes `AGENTS.md`, the agent references it to locate project-specific lint and test commands" (https://developers.openai.com/codex/cloud/environments). IDE-extension-specific behavior isn't separately documented; same engine assumed but **not explicitly stated** in the pages fetched.

### config.toml
Source: https://developers.openai.com/codex/config-basic (→ learn.chatgpt.com/docs/config-file/config-basic) · reference: https://developers.openai.com/codex/config-reference

- User config `~/.codex/config.toml`; **project-scoped `.codex/config.toml` in the repo** ("you can add project overrides with `.codex/config.toml` files"); profiles `~/.codex/<name>.config.toml` via `--profile`. Precedence: CLI flags/`--config` > project `.codex/config.toml` (closest to cwd wins; **trusted projects only** — untrusted projects skip all project `.codex/` layers incl. hooks and rules) > profiles > user config > system `/etc/codex/config.toml` > defaults.
- Keys relevant here: `model`, `approval_policy`, `sandbox_mode`, `project_doc_max_bytes`, `project_doc_fallback_filenames`, MCP servers.

### Cloud environments & PR flow
Sources: https://developers.openai.com/codex/cloud (→ learn.chatgpt.com/docs/cloud) · https://developers.openai.com/codex/cloud/environments (→ learn.chatgpt.com/docs/environments/cloud-environment)

- Connect: install the Codex **GitHub app**, "choose the repositories that Codex can access". Tasks start from chatgpt.com/codex, GitHub PRs/issues, Linear, Slack, or Codex CLI; tasks run in parallel isolated containers.
- PR flow: task produces summary + diff; "open a pull request when the result is ready" — review-then-merge.
- Environment config (per repo, in the Codex cloud UI — not repo files): default **`universal`** container image (spec: https://github.com/openai/codex-universal), pinnable runtime versions; **auto-installs dependencies for npm/yarn/pnpm/pip/pipenv/poetry**; optional **setup script** (env vars must go to `~/.bashrc`; `export` doesn't persist to agent phase) and **maintenance script** on cache resume; container cache up to 12h. **Env vars** persist through the chat; **secrets** are encrypted and available *only during setup*, removed before the agent phase.
- Internet: setup scripts run **with** internet; **agent phase has internet OFF by default**, configurable with allowlists — https://developers.openai.com/codex/cloud/internet-access.

---

## 4. Cursor

### Rules system
Source: https://cursor.com/docs/context/rules (also under cursor.com/help/customization/rules)

- Project rules: `.cursor/rules/*.mdc`, version-controlled. Frontmatter: `description` (Agent decides relevance), `globs` (auto-attach when matching files are in context, e.g. `src/**/*.tsx`), `alwaysApply` (bool). Behavior matrix: `alwaysApply: true` → always included; `alwaysApply: false` + globs → auto-attached; `alwaysApply: false` + description → agent-requested; neither → manual via `@rule-name`.
- Precedence: **Team Rules → Project Rules → User Rules** (earlier wins on conflict). User Rules apply to Agent chat only, not Inline Edit.
- **`.cursorrules` (root file) is legacy/deprecated** — migrate to `.cursor/rules/` (cursor.com/help/customization/rules; deprecation confirmed in official docs/forum guidance).
- **AGENTS.md: natively supported** as a "simple markdown alternative in project root **or subdirectories**"; "Instructions from nested AGENTS.md files are combined with parent directories, with more specific instructions taking precedence."

### Ignore files
Source: https://cursor.com/docs/context/ignore-files

- `.cursorignore`: blocks code from Agent/Tab/Inline Edit and `@` references. **Caveat: terminal and MCP tool access cannot be blocked by `.cursorignore`.** `.gitignore`-style syntax; `.gitignore` + a default ignore list are honored for indexing; hierarchical lookup is opt-in (Settings → Indexing → Hierarchical Cursor Ignore). Negation can't re-include under an excluded parent (`public/*` + `!public/assets/style.css` fails).
- `.cursorindexingignore`: excludes from the codebase index/search only; files remain accessible to AI features.

### Cloud Agents (formerly background agents)
Sources: https://cursor.com/docs/cloud-agent · https://cursor.com/docs/cloud-agent/setup · https://cursor.com/docs/integrations/github

- Providers: GitHub (Cloud + Enterprise Server), GitLab (Cloud + Self-Hosted), Bitbucket Cloud, Azure DevOps. Agents clone the repo, "work on a separate branch, then push changes to your repo for handoff" and produce merge-ready PRs. Needs read-write repo privileges. Launch from Cursor Web (cursor.com/agents), Desktop, iOS/PWA, Slack (`@cursor`), **GitHub/Bitbucket PR or issue comments (`@cursor`)**, Linear, or the Cloud Agents API (public beta). Auto-fixes CI failures on its PRs (GitHub Actions only). Paid plans only.
- Environment: **`.cursor/environment.json`** (commit for team sharing). Fields: `snapshot` (snapshot ID) or `build: { dockerfile, context }`, `install` (idempotent dependency script, cached in "Builds"), `start`, `terminals`. Resolution: repo `.cursor/environment.json` → personal saved env → team saved env. Secrets via dashboard (env-scoped). Hooks from `.cursor/hooks.json` run in cloud.

---

## 5. Lovable, Bolt.new, v0

### Lovable
Sources: https://docs.lovable.dev/integrations/github · https://docs.lovable.dev/integrations/git-sync-overview · https://docs.lovable.dev/features/knowledge · https://docs.lovable.dev/features/skills

- **Cannot import an existing repo.** Docs list explicitly unsupported: "Importing existing GitHub repositories into Lovable. You can only export from Lovable to GitHub." Connecting always **creates a new GitHub repository** from the Lovable project. **This alone makes Lovable infeasible for connecting a finished client site.**
- Sync (for Lovable-created repos): genuine two-way — Lovable commits/pushes every change; commits pushed to the synced branch flow back. **Only one branch syncs at a time** (branch picker to switch; new branches are created from the currently active branch). Lovable's GitHub App requests permission to "Open and update pull requests", but the docs don't document a Lovable-driven PR workflow; merging happens on GitHub.
- Instruction surfaces are **in-app, not repo files**: Knowledge (workspace-level + project-level, always in context; Settings → Knowledge) and Skills (workspace-level, `SKILL.md` per the Agent Skills convention — "same `SKILL.md` shape as Anthropic's Claude"; importable from GitHub repos/subdirectories or zip; ≤100k chars, ≤200 bundled files). **No AGENTS.md / repo-file instruction support documented.**

### Bolt.new
Sources: https://support.bolt.new/integrations/git · https://support.bolt.new/best-practices/maximizing-token-efficiency · https://support.bolt.new/docs/prompting-effectively

- **Can import an existing GitHub repo** (homepage dropdown or repo URL; also `bolt.new/<github-url>`; private repos after authorization).
- Sync: Bolt **auto-commits every non-breaking change directly to the connected branch** and polls GitHub every 30s to pull external changes. Conflict edge case: "Bolt keeps your changes and overwrites the GitHub version." Collaborator changes sync only when the owner reopens the project.
- Branches: create/switch in Bolt, per-branch memory; **no in-app merging** ("Bolt currently doesn't support merging branches in-app") and **no PR creation documented** — merge on GitHub. So a branch-safe client flow requires the client to switch branches manually in Bolt and someone to open the PR on GitHub.
- Instruction files: **`.bolt/prompt`** — custom AI instructions per project (support.bolt.new/docs/prompting-effectively). **`.bolt/ignore` works only with the legacy v1 agent, which is retired as of 2026-08-03; it does not work with the current Bolt Agent** (support.bolt.new/best-practices/maximizing-token-efficiency). No AGENTS.md support documented.

### v0 (Vercel)
Sources: https://v0.app/docs/git-import · https://v0.app/docs/github · https://v0.app/docs/instructions · https://v0.app/docs/projects

- **Can import any existing GitHub repo you have access to** (Git Import; requires the Vercel GitHub App with access to the repo). Monorepos supported — you select the working directory. Importing creates a v0 chat + working branch in the *same* repo (no duplication); re-importing creates another chat/branch.
- Branch/PR model — the strongest of the three: with write access, v0 "automatically creates a dedicated branch for your work" (e.g. `v0/main-abc123`) off a base branch you choose; "The base branch remains protected; changes merge via pull request", and v0 **can create pull requests directly**. Read-only repos get an automatic fork + fork-based PRs.
- Vercel linkage: can attach to an existing Vercel project (env vars, domains, deployments) or create one. Previews run in Vercel Sandbox (full Node.js runtime).
- Instructions: v0 "Instructions" are **account-level saved prompts applied per-chat from the UI** (v0.app/docs/instructions) — presets "Be Concise" / "Plan Mode" plus custom ones. **No documented repo-file instruction surface (no AGENTS.md support documented).** Project settings hold env vars/integrations/GitHub/domains, not an instructions file.
- **UNVERIFIED/gap**: whether commits pushed to the v0 working branch from outside flow *back into* the v0 chat (true two-way sync) is not clearly documented; community posts mention "bidirectional git sync (beta) for Premium" (community.vercel.com/t/11176) — secondary source, plan-gated.

---

## 6. The AGENTS.md standard

Source: https://agents.md/

- "A simple, open format for guiding coding agents." Plain Markdown, **no required fields, any headings** ("the agent simply parses the text you provide").
- Nesting: for monorepos, place nested AGENTS.md in subproject dirs; "Agents automatically read the nearest file in the directory tree, so the closest one takes precedence." Explicit user chat prompts override all file instructions.
- Listed supporters (20+): **OpenAI Codex**, Google Jules, Gemini CLI, Cursor, GitHub Copilot / VS Code, Zed, Windsurf, Devin, Factory, Aider, goose, opencode, JetBrains Junie, Warp, Amp, RooCode, Kilo Code, Phoenix, Semgrep, Ona, Augment Code, UiPath.
- **Not on the list and confirmed non-readers**: Claude Code (reads CLAUDE.md only — official import/symlink bridge), Replit (replit.md only), Lovable, Bolt, v0.
- Note: Codex layers extra semantics on top of the plain spec (AGENTS.override.md, fallback filenames, 32 KiB cap, root-down concatenation) — see §3.

---

## Contradictions with design assumptions

**(a) "Codex needs no extra files beyond AGENTS.md" — HOLDS, with two caveats.** AGENTS.md is natively read locally and in cloud (nested + root-down concat, 32 KiB default cap — keep the canonical file lean or raise `project_doc_max_bytes`). Caveats: (1) Codex cloud **agent-phase internet is OFF by default** and environment setup (setup/maintenance scripts, secrets, allowlists) lives in the Codex cloud UI, not the repo — a marketing-site build needing network (fonts, image CDNs, Sanity APIs) requires per-client environment config that harness-gen cannot emit as files; (2) an optional repo `.codex/config.toml` surface exists (trusted projects only) that harness-gen *could* emit for `project_doc_max_bytes`/MCP.

**(b) "Claude Code cloud reads CLAUDE.md + .claude/skills" — CONFIRMED**, verbatim in the docs table (repo `CLAUDE.md`, `.claude/skills/`, `.claude/agents/`, `.claude/commands/`, `.claude/rules/`, `.claude/settings.json` hooks, `.mcp.json` all load from the clone). **But Claude Code does NOT read AGENTS.md at all** — harness-gen must emit a `CLAUDE.md` (recommended content: `@AGENTS.md` import plus any Claude-specific lines). Also: no devcontainer support in cloud — environment prep is the claude.ai environment setup script + repo `SessionStart` hooks (`CLAUDE_CODE_REMOTE=true` guard); note Bun's proxy issues if the template uses Bun.

**(c) "Replit reads replit.md" — CONFIRMED** (root only; Agent both reads and *rewrites* it — expect drift from generated output). **AGENTS.md is not supported** by any official Replit doc. Bigger contradiction: **`[postMerge]` in `.replit` has no primary source and the `[workflows]` TOML schema is undocumented** — the design should not depend on either without verifying against a live Agent-generated repo. `.replitignore` is likewise absent from current docs. A genuinely documented repo surface the design gains for free: **`.agents/skills/` (Agent Skills open spec, Claude-compatible SKILL.md)**.

**(d) "Lovable/Bolt/v0 have weak git workflows" — WRONG for v0, right for Lovable, partial for Bolt.**
- **Lovable is worse than assumed**: it cannot import an existing repo at all (export-only) — the "connect a finished client site" story is impossible; drop Lovable or scope it to Lovable-born projects.
- **Bolt is importable but branch-unsafe by default**: auto-commits go straight to the connected branch (main unless switched), no in-app merge/PR, conflict resolution silently favors Bolt. A safe client story needs a pre-created client branch + PRs opened on GitHub. `.bolt/ignore` is dead (v1-only, retired 2026-08-03); `.bolt/prompt` is the only live repo instruction file.
- **v0 contradicts the assumption in the good direction**: Git Import of existing repos (incl. monorepo subdirectory selection), auto-created `v0/*` working branches, protected base branch, direct PR creation. Its weakness is instructions, not git: no repo instruction file — guidance must live in account-level UI Instructions.

---

## Summary table — instruction-file surfaces per platform

| Platform | Native instruction file(s) in repo | AGENTS.md native? | Skills in repo | Env/setup config | Git model for client edits |
|---|---|---|---|---|---|
| **Replit** | `replit.md` (root only; Agent rewrites it) | No (docs silent) | `.agents/skills/` (agentskills.io spec) | `.replit` (`modules`, `run`, `onBoot`, `[deployment]`, `[[ports]]`); workflows via pane (TOML schema undocumented); `[postMerge]`/`.replitignore` unverified | OAuth-app import; Git pane branches + push/pull; no in-app PRs |
| **Claude Code web** | `CLAUDE.md` (+ `.claude/rules/`, `CLAUDE.local.md`); bridge via `@AGENTS.md` import or symlink | **No** | `.claude/skills/` (+ agents, commands, hooks, `.mcp.json`) | claude.ai environment: network level, env vars, setup script; `SessionStart` hooks in repo; no devcontainer | GitHub App or `gh` token; branch push → **Create PR** button; Auto-fix PRs |
| **Codex** | `AGENTS.md` (nested, root-down concat, 32 KiB cap, `AGENTS.override.md`); optional `.codex/config.toml` | **Yes** (native) | n/a | Codex cloud UI per repo: universal image, setup/maintenance scripts, secrets (setup-only), internet off by default | GitHub App; task diff → open PR; `@codex` on PRs/issues |
| **Cursor** | `.cursor/rules/*.mdc` (`description`/`globs`/`alwaysApply`); AGENTS.md root + nested; `.cursorrules` deprecated | **Yes** (incl. nested) | n/a (rules + `.cursor/hooks.json`) | `.cursor/environment.json` (`install`, `start`, `terminals`, snapshot/Dockerfile) for cloud agents; `.cursorignore`/`.cursorindexingignore` | Cloud agents: separate branch + merge-ready PRs; `@cursor` on PRs; paid plans |
| **Lovable** | None in repo (Knowledge + Skills live in app settings; skills = Agent Skills `SKILL.md`, importable from a repo) | No | Import-only (workspace-level) | n/a | **Cannot import existing repos**; two-way sync on one branch of Lovable-created repos only |
| **Bolt.new** | `.bolt/prompt` (custom instructions); `.bolt/ignore` legacy-only (retired) | No | n/a | n/a | Imports existing repos; auto-commit **direct to connected branch**; branch create/switch, no in-app merge/PR |
| **v0** | None (Instructions = account-level UI prompts) | No | n/a | Vercel project link (env vars, domains); Vercel Sandbox previews | Git Import of existing repos; protected base + `v0/*` working branch; **creates PRs**; monorepo dir selection |
