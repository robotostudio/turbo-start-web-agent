<!--
  GENERATED FILE — do not edit directly.
  Source: AGENTS.md (edit the rules themselves) and
  scripts/harness-gen/adapters/claude-code.ts (edit the Claude-specific
  lines below). Regenerate with `pnpm harness`.
-->

# CLAUDE.md — Harbour

@AGENTS.md

## Claude Code specifics

Everything above this line lives in `AGENTS.md`, pulled in verbatim by the
`@AGENTS.md` import above — Claude Code does not read `AGENTS.md` on its
own, so this file is the only reason those rules are visible to it at all.
The lines below apply only to Claude Code and have no equivalent in the
platform-neutral file.

- **Cloud sessions** clone this repo into an isolated VM and load
  `.claude/settings.json` hooks, `.mcp.json`, `.claude/rules/`,
  `.claude/skills/`, `.claude/agents/`, and `.claude/commands/` from that
  clone — nothing under `~/.claude/` on anyone's own machine carries over.
  Commit anything a cloud session needs to see.
- **`.claude/skills/` is a generated, byte-identical copy of
  `.agents/skills/`** (see `.claude/skills/README.md`), not a symlink.
  Edit skills under `.agents/skills/` and run `pnpm harness` to refresh the
  copy — the copy itself is generated output, exactly like this file.
- Session-start git discipline (pull before editing, branch → commit → PR,
  never push to `main`, and how to tell whether a push actually reached the
  remote on platforms where the shell has no git credentials) lives in
  `.agents/skills/sync-changes/SKILL.md` — read it before your first edit
  in a fresh session.
