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

// Known platform ids -> the adapter that generates their surface. Also the
// source of truth harness.config.json's "platforms" array is validated
// against below: an adopter adding a fourth platform name there without
// adding a matching adapter here gets a named error instead of the entry
// silently doing nothing (see F8/harness follow-ups).
const ADAPTERS: Record<string, Adapter> = {
  "claude-code": generateClaudeCode,
  replit: generateReplit,
  cursor: generateCursor,
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

// Minimal structural validation of the parsed manifest. Not a schema
// library (per types.ts's "no new dependencies" constraint) — just enough
// to turn a typo'd or incomplete harness.config.json into one friendly
// message naming the exact field that's wrong, matching the phrasing
// generate-catalog.ts/generate-gallery.ts use for their own drift errors,
// instead of a raw Node stack trace pointing at whichever adapter first
// dereferences the missing field.
function validateConfig(raw: unknown): HarnessConfig {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("must be a JSON object");
  }
  const cfg = raw as Record<string, unknown>;

  const project = cfg.project;
  if (typeof project !== "object" || project === null) {
    throw new Error('"project" must be an object with "slug" and "name" strings');
  }
  const { slug, name } = project as Record<string, unknown>;
  if (typeof slug !== "string" || slug.length === 0) {
    throw new Error('"project.slug" must be a non-empty string');
  }
  if (typeof name !== "string" || name.length === 0) {
    throw new Error('"project.name" must be a non-empty string');
  }

  const site = cfg.site;
  if (typeof site !== "object" || site === null) {
    throw new Error('"site" must be an object with a "host" string');
  }
  const { host } = site as Record<string, unknown>;
  if (typeof host !== "string") {
    throw new Error('"site.host" must be a string');
  }

  const commands = cfg.commands;
  if (typeof commands !== "object" || commands === null) {
    throw new Error(
      '"commands" must be an object with "dev"/"build" strings and a "check" array of strings',
    );
  }
  const { dev, build, check } = commands as Record<string, unknown>;
  if (typeof dev !== "string" || dev.length === 0) {
    throw new Error('"commands.dev" must be a non-empty string');
  }
  if (typeof build !== "string" || build.length === 0) {
    throw new Error('"commands.build" must be a non-empty string');
  }
  if (!Array.isArray(check) || check.some((c) => typeof c !== "string")) {
    throw new Error('"commands.check" must be an array of strings');
  }

  const platforms = cfg.platforms;
  if (!Array.isArray(platforms) || platforms.some((p) => typeof p !== "string")) {
    throw new Error('"platforms" must be an array of strings');
  }
  const unknownPlatforms = (platforms as string[]).filter((p) => !(p in ADAPTERS));
  if (unknownPlatforms.length > 0) {
    throw new Error(
      `"platforms" lists ${unknownPlatforms.map((p) => `"${p}"`).join(", ")}, but no adapter is registered for ` +
        `${unknownPlatforms.length > 1 ? "them" : "it"} in scripts/harness-gen/index.ts. Known platforms: ` +
        `${Object.keys(ADAPTERS).join(", ")}.`,
    );
  }

  const capabilitiesRaw = cfg.capabilities ?? [];
  if (!Array.isArray(capabilitiesRaw)) {
    throw new Error('"capabilities" must be an array');
  }
  capabilitiesRaw.forEach((c, i) => {
    if (typeof c !== "object" || c === null) {
      throw new Error(
        `"capabilities[${i}]" must be an object with "env", "label", and "fallback" strings`,
      );
    }
    const { env, label, fallback } = c as Record<string, unknown>;
    if (typeof env !== "string" || env.length === 0) {
      throw new Error(`"capabilities[${i}].env" must be a non-empty string`);
    }
    if (typeof label !== "string" || label.length === 0) {
      throw new Error(`"capabilities[${i}].label" must be a non-empty string`);
    }
    if (typeof fallback !== "string") {
      throw new Error(`"capabilities[${i}].fallback" must be a string`);
    }
  });

  return {
    project: { slug, name },
    site: { host },
    commands: { dev, build, check: check as string[] },
    platforms: platforms as string[],
    capabilities: capabilitiesRaw as HarnessConfig["capabilities"],
  };
}

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");

const agentsMdPath = join(repoRoot, "AGENTS.md");
const configPath = join(repoRoot, "harness.config.json");

let agentsMd: string;
try {
  agentsMd = readFileSync(agentsMdPath, "utf8");
} catch (err) {
  fail(`Cannot read AGENTS.md at ${agentsMdPath}: ${errorMessage(err)}`);
}

let config: HarnessConfig;
try {
  const rawText = readFileSync(configPath, "utf8");
  let raw: unknown;
  try {
    raw = JSON.parse(rawText);
  } catch (err) {
    throw new Error(`not valid JSON (${errorMessage(err)})`);
  }
  config = validateConfig(raw);
} catch (err) {
  fail(
    `harness.config.json is invalid: ${errorMessage(err)}. Fix the manifest (see its own "//" comments and ` +
      `AGENTS.md §5), then re-run \`pnpm harness\`.`,
  );
}

const adapters: Adapter[] = config.platforms.map((platformId) => ADAPTERS[platformId]);

const files: GeneratedFile[] = [];
const ownedDirs: string[] = [];
for (const adapter of adapters) {
  let result: ReturnType<Adapter>;
  try {
    result = adapter({ repoRoot, agentsMd, config });
  } catch (err) {
    fail(`Cannot generate harness surfaces: ${errorMessage(err)}`);
  }
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
