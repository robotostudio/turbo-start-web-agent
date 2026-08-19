import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { generateClaudeCode } from "./adapters/claude-code.ts";
import { generateCursor } from "./adapters/cursor.ts";
import { generateReplit } from "./adapters/replit.ts";
import type { Adapter, GeneratedFile, HarnessConfig } from "./types.ts";

// harness-gen — the per-platform surface generator.
//
// AGENTS.md is the single canonical instruction set for this repo, read
// natively by Codex, Cursor, Copilot/VS Code, Zed, Jules, Gemini CLI, Devin,
// Warp, Amp, and most of the rest of the ecosystem. Claude Code does not
// read AGENTS.md at all, and Replit only reads replit.md, root only — this
// generator exists so those platform-specific surfaces are derived from
// AGENTS.md and harness.config.json instead of hand-maintained, which is
// exactly how they'd drift out of sync with the canonical rules.
//
// Modeled on artifacts/web/scripts/generate-catalog.ts: same --check argv
// handling, same "run X and commit the result" error phrasing, same exit
// codes. Two generators doing the same job in one repo should be
// indistinguishable in behaviour; divergence between them is a maintenance
// trap for whoever edits one and assumes the other works the same way.
//
// NOTE: no timestamp field anywhere in generated output, same reasoning as
// generate-catalog.ts and generate-gallery.ts — every generated file here
// is a pure function of its declared inputs (AGENTS.md, harness.config.json,
// and/or .agents/skills/, per adapter — see each adapter's own comments for
// which it reads), never of wall-clock time. That's what keeps --check
// honest and every regeneration diff meaningful instead of noise. It also
// means an edit to AGENTS.md must change at least one generated file's
// bytes and trip harness:check — replit.ts quotes AGENTS.md §1 verbatim
// into replit.md specifically so that's true in practice, not just in
// principle (see its own comment for why restating the rules in
// independently hand-written prose would have been the wrong fix).

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");

const agentsMdPath = join(repoRoot, "AGENTS.md");
const configPath = join(repoRoot, "harness.config.json");

const agentsMd = readFileSync(agentsMdPath, "utf8");
const config: HarnessConfig = JSON.parse(readFileSync(configPath, "utf8"));

const adapters: Adapter[] = [generateClaudeCode, generateReplit, generateCursor];

const files: GeneratedFile[] = [];
const ownedDirs: string[] = [];
for (const adapter of adapters) {
  const result = adapter({ repoRoot, agentsMd, config });
  files.push(...result.files);
  if (result.ownedDirs) {
    ownedDirs.push(...result.ownedDirs);
  }
}

const expectedPaths = new Set(files.map((f) => f.path));

function listFilesRecursive(absDir: string): string[] {
  if (!existsSync(absDir)) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else {
        out.push(abs);
      }
    }
  };
  walk(absDir);
  return out;
}

function staleFilesUnder(ownedDir: string): string[] {
  const abs = join(repoRoot, ownedDir);
  return listFilesRecursive(abs)
    .map((absFile) => relative(repoRoot, absFile))
    .filter((rel) => !expectedPaths.has(rel));
}

if (process.argv.includes("--check")) {
  const outOfDate = files
    .filter((file) => {
      const abs = join(repoRoot, file.path);
      const existing = existsSync(abs) ? readFileSync(abs, "utf8") : null;
      return existing !== file.content;
    })
    .map((file) => file.path);

  const stale = ownedDirs.flatMap(staleFilesUnder);

  if (outOfDate.length > 0 || stale.length > 0) {
    const detail = [
      outOfDate.length > 0 ? `out of date: ${outOfDate.join(", ")}` : null,
      stale.length > 0 ? `stale, no longer generated: ${stale.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    process.stderr.write(
      `Agent harness surfaces are out of date (${detail}). Run \`pnpm harness\` and commit the result.\n`,
    );
    process.exit(1);
  }
  process.stdout.write(`Agent harness surfaces up to date (${files.length} files)\n`);
} else {
  for (const file of files) {
    const abs = join(repoRoot, file.path);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, file.content);
  }
  for (const ownedDir of ownedDirs) {
    for (const relPath of staleFilesUnder(ownedDir)) {
      rmSync(join(repoRoot, relPath));
    }
  }
  process.stdout.write(`Agent harness surfaces written (${files.length} files)\n`);
}
