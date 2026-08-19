// Shared types for harness-gen and its adapters.
//
// harness.config.json is intentionally read as a plain object shape here
// (not derived from a schema library) — the generator has no dependencies,
// per the harness plan's "no new dependencies" constraint, and this shape
// only needs to be wide enough for the fields adapters actually read.

export interface HarnessConfig {
  project: {
    slug: string;
    name: string;
  };
  /** Documentation only — not read by harness-gen or preflight.sh. */
  site: {
    host: string;
  };
  commands: {
    /** Consumed: interpolated into the generated .replit's "run" line. */
    dev: string;
    /** Documentation only — not read by harness-gen or preflight.sh. */
    build: string;
    /** Documentation only — not read by harness-gen or preflight.sh. */
    check: string[];
  };
  /**
   * Consumed: selects which entries of index.ts's ADAPTERS map run. Every
   * entry must be a known adapter id — index.ts validates this and fails
   * generation with a named error otherwise (see validateConfig).
   */
  platforms: string[];
  capabilities: Array<{
    env: string;
    label: string;
    fallback: string;
  }>;
}

export interface HarnessContext {
  /** Absolute path to the repo root. */
  repoRoot: string;
  /** Raw contents of AGENTS.md, the canonical instruction set. */
  agentsMd: string;
  /** Parsed harness.config.json. */
  config: HarnessConfig;
}

export interface GeneratedFile {
  /** Path relative to the repo root, e.g. "CLAUDE.md" or ".claude/skills/README.md". */
  path: string;
  content: string;
}

export interface AdapterResult {
  files: GeneratedFile[];
  /**
   * Directories (relative to the repo root) this adapter fully owns and
   * generates every file under. index.ts sweeps these for files that exist
   * on disk but are no longer in `files` — e.g. a skill removed from
   * .agents/skills/ — and reports/removes them as stale, the same way
   * generate-catalog.ts reports Blocks "no longer registered".
   */
  ownedDirs?: string[];
}

export type Adapter = (ctx: HarnessContext) => AdapterResult;
