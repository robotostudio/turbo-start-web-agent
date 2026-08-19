import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { Adapter, GeneratedFile } from "../types.ts";

// Claude Code adapter.
//
// Claude Code does not read AGENTS.md at all — it reads CLAUDE.md. This
// bridge is mandatory: without it, every rule in AGENTS.md is invisible to
// Claude Code, on the CLI or in the cloud. The official bridge mechanism
// (docs/research/agent-platform-surfaces.md §2, "CLAUDE.md / AGENTS.md
// reading order") is a CLAUDE.md containing an `@AGENTS.md` import.
//
// It also mirrors .agents/skills/ into .claude/skills/, because Claude Code
// cloud sessions load `.claude/skills|agents|commands|rules` and `.mcp.json`
// from the repo clone (same source, "What config the cloud session reads")
// — nothing under `~/.claude/` on a contributor's machine carries over, so a
// skill that only exists under .agents/skills/ is invisible to a cloud
// session unless it is also present under .claude/skills/.
//
// Symlink vs. generated copy, decided in favor of a generated copy:
//   - A symlinked `.claude/skills -> ../.agents/skills` does not survive
//     every path a clone can take (e.g. GitHub's "Download ZIP" replaces a
//     symlink with a plain text file containing the target path, not a
//     directory), silently turning the mirror into a broken pointer.
//   - This generator's whole contract is a byte-for-byte --check comparison
//     of generated *content*; a symlink is a different kind of filesystem
//     object; special-casing it here would make this adapter behave
//     differently from the other two for no real benefit.
//   - A generated copy is boring, and boring is what a drift gate wants.
//
// The mirrored SKILL.md files are copied byte-identical, with NO header
// injected into them: the agentskills.io spec requires SKILL.md to open
// with `---` frontmatter as its literal first bytes, and prepending a
// comment would break that parse for both Claude Code and Replit. The
// "generated" declaration for this directory instead lives in the sibling
// README.md (which is plain Markdown, not frontmatter-bound) and in
// CLAUDE.md itself.

const CLAUDE_MD_HEADER = `<!--
  GENERATED FILE — do not edit directly.
  Source: AGENTS.md (edit the rules themselves) and
  scripts/harness-gen/adapters/claude-code.ts (edit the Claude-specific
  lines below). Regenerate with \`pnpm harness\`.
-->

`;

const SKILLS_README_HEADER = `<!--
  GENERATED FILE — do not edit directly.
  Source: .agents/skills/ (edit skills there) and
  scripts/harness-gen/adapters/claude-code.ts (edit this note).
  Regenerate with \`pnpm harness\`.
-->

`;

function listFilesRecursive(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else {
        out.push(abs);
      }
    }
  };
  walk(dir);
  return out;
}

export const generateClaudeCode: Adapter = ({ repoRoot, config }) => {
  const claudeMd = `${CLAUDE_MD_HEADER}# CLAUDE.md — ${config.project.name}

@AGENTS.md

## Claude Code specifics

Everything above this line lives in \`AGENTS.md\`, pulled in verbatim by the
\`@AGENTS.md\` import above — Claude Code does not read \`AGENTS.md\` on its
own, so this file is the only reason those rules are visible to it at all.
The lines below apply only to Claude Code and have no equivalent in the
platform-neutral file.

- **Cloud sessions** clone this repo into an isolated VM and load
  \`.claude/settings.json\` hooks, \`.mcp.json\`, \`.claude/rules/\`,
  \`.claude/skills/\`, \`.claude/agents/\`, and \`.claude/commands/\` from that
  clone — nothing under \`~/.claude/\` on anyone's own machine carries over.
  Commit anything a cloud session needs to see.
- **A \`SessionStart\` hook in \`.claude/settings.json\` runs
  \`scripts/preflight.sh\`**, gated on \`CLAUDE_CODE_REMOTE=true\` so it only
  fires in cloud sessions, and its report (git remote reachability, \`gh\`
  PR ability, \`pnpm\` usability, plus every capability declared in
  \`harness.config.json\`) is added to context before you make any claim
  about what you can push, publish, or open a PR for. Locally, run
  \`sh scripts/preflight.sh\` by hand for the same report.
- **\`.claude/skills/\` is a generated, byte-identical copy of
  \`.agents/skills/\`** (see \`.claude/skills/README.md\`), not a symlink.
  Edit skills under \`.agents/skills/\` and run \`pnpm harness\` to refresh the
  copy — the copy itself is generated output, exactly like this file.
- Session-start git discipline (pull before editing, branch → commit → PR,
  never push to \`main\`, and how to tell whether a push actually reached the
  remote on platforms where the shell has no git credentials) lives in
  \`.agents/skills/sync-changes/SKILL.md\` — read it before your first edit
  in a fresh session.
`;

  const files: GeneratedFile[] = [{ path: "CLAUDE.md", content: claudeMd }];

  const skillsSrcDir = join(repoRoot, ".agents", "skills");
  const skillsDestDir = join(".claude", "skills");
  const mirroredSkillFiles = listFilesRecursive(skillsSrcDir).map((absSrc) => ({
    absSrc,
    relFromSkillsDir: relative(skillsSrcDir, absSrc),
  }));

  // This adapter unconditionally appends its own generated README.md to
  // skillsDestDir below, as the mirror's "this is generated" note. If
  // .agents/skills/ ever contains its own README.md, that mirrors straight
  // to the same output path and two entries would claim one file — --check
  // would then compare that path against two different contents and could
  // never pass, unfixable by regenerating. Fail loudly here instead, so the
  // collision can't reach --check at all.
  if (mirroredSkillFiles.some(({ relFromSkillsDir }) => relFromSkillsDir === "README.md")) {
    throw new Error(
      ".agents/skills/README.md exists, but scripts/harness-gen/adapters/claude-code.ts also generates " +
        ".claude/skills/README.md as the mirror's own generated note — the two would collide at the same " +
        "output path. Rename or remove .agents/skills/README.md (e.g. to .agents/skills/OVERVIEW.md); " +
        '"README.md" is reserved for the generated mirror note.',
    );
  }

  for (const { absSrc, relFromSkillsDir } of mirroredSkillFiles) {
    files.push({
      path: join(skillsDestDir, relFromSkillsDir),
      content: readFileSync(absSrc, "utf8"),
    });
  }

  files.push({
    path: join(skillsDestDir, "README.md"),
    content: `${SKILLS_README_HEADER}# .claude/skills/

This directory is a generated, byte-identical mirror of \`.agents/skills/\`.
Claude Code cloud sessions load \`.claude/skills/\` from the repo clone, but
the canonical skill files live under \`.agents/skills/\` because that same
path also serves Replit's Agent Skills convention (agentskills.io spec) —
one folder, two platforms. Edit skills under \`.agents/skills/\`, never here;
run \`pnpm harness\` to refresh this copy.
`,
  });

  return { files, ownedDirs: [skillsDestDir] };
};
