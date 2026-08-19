import type { Adapter, GeneratedFile } from "../types.ts";

// Cursor adapter.
//
// Cursor reads AGENTS.md natively — root and nested
// (docs/research/agent-platform-surfaces.md §4, "AGENTS.md: natively
// supported"). That means, unlike Claude Code and Replit, Cursor needs no
// bridge file at all: emitting a `.cursor/rules/*.mdc` here would just
// restate AGENTS.md in a second format that this generator would then have
// to keep in sync forever — the exact duplication-drift problem this whole
// harness exists to avoid. So this adapter deliberately emits ONLY
// `.cursorignore`, and nothing under `.cursor/`.
//
// `.cursorignore` keeps generated/build output and lockfiles out of Agent
// context — not because they're secret, but because they're either huge
// (node_modules, the pnpm lockfile) or hand-editing them directly is a
// mistake this repo already has a generator for (catalog.json — see
// AGENTS.md §4, "run `pnpm catalog` instead of hand-editing"). Note Cursor's
// own documented caveat: .cursorignore blocks Agent/Tab/Inline Edit and `@`
// references, but NOT terminal or MCP tool access — it narrows context, it
// does not sandbox the agent.

const CURSORIGNORE_HEADER = `# GENERATED FILE — do not edit directly.
# Source: scripts/harness-gen/adapters/cursor.ts (edit the list below).
# Regenerate with \`pnpm harness\`.
#
# No .cursor/rules file is generated alongside this one. Cursor reads
# AGENTS.md natively (root and nested) — a .cursor/rules/*.mdc file here
# would just duplicate it in a second format, which is exactly the kind of
# drift this generator exists to prevent. This is a deliberate omission,
# not an oversight.
#
# Reminder from Cursor's own docs: this file narrows what Agent/Tab/Inline
# Edit and @-references can see. It does NOT block terminal or MCP tool
# access — it is not a sandbox.

`;

export const generateCursor: Adapter = () => {
  const cursorignore = `${CURSORIGNORE_HEADER}# Dependency and build output — large, never hand-edited, already in
# .gitignore. No reason to spend Agent context on these.
node_modules/
.next/
.velite/

# Package manager lockfile — large, generated, never hand-edited.
pnpm-lock.yaml

# Generated from src/lib/blocks/schemas.ts by \`pnpm catalog\` (AGENTS.md
# §4). Editing this file directly is silently overwritten the next time
# anyone runs the generator — edit the schema instead.
artifacts/web/src/lib/blocks/catalog.json
`;

  const files: GeneratedFile[] = [{ path: ".cursorignore", content: cursorignore }];

  return { files };
};
