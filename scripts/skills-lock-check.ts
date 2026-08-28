import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// skills-lock check: a lockfile nothing reads is a comment.
//
// skills-lock.json pins every skill under .agents/skills/ that was not written
// for this project — where it came from, which ref, and a SHA-256 of the file
// as installed. The reasoning in find-skills is right: a skill is arbitrary
// instructions with a YAML header, and an unpinned remote one is instruction
// injection with a supply chain behind it.
//
// The lockfile shipped on 2026-08-27 and nothing ever read it. Grep found the
// filename in Markdown and nowhere else. The recorded hash happened to still be
// correct, which is the failure mode: an unverified hash looks exactly like a
// verified one right up until it does not.
//
// Two halves, and the second is the one that matters. Verifying a recorded hash
// catches a pinned skill that changed underneath you. Requiring an entry for
// every skill that declares an origin catches a skill installed with no pin at
// all — which is the thing the convention exists to prevent, and the thing a
// hash check alone would sail straight past.
//
// Standard library only, like scripts/pr-hygiene.ts: this must run in CI
// before `pnpm install` has necessarily happened, and adding a YAML parser to
// read one key would be a dependency in the supply chain this file polices.

export interface LockFinding {
  /** Short machine-ish label, used to group output. */
  rule: string;
  /** What is wrong, addressed to whoever has to fix it. */
  message: string;
}

export interface LockEntry {
  name: string;
  installedAt: string;
  source?: { repo?: string; path?: string; ref?: string; commit?: string };
  sha256: string;
}

export const sha256 = (content: string): string =>
  createHash("sha256").update(content, "utf8").digest("hex");

export const entriesFrom = (lockJson: string): LockEntry[] => {
  const parsed = JSON.parse(lockJson) as { skills?: unknown };
  return Array.isArray(parsed.skills) ? (parsed.skills as LockEntry[]) : [];
};

/**
 * The file an entry pins: `installedAt` joined with `source.path`, which is
 * "SKILL.md" for every skill the agentskills.io spec describes.
 */
export const pinnedPath = (entry: LockEntry): string =>
  `${entry.installedAt}/${entry.source?.path ?? "SKILL.md"}`;

/**
 * Rule 1 — every pinned file still hashes to the value recorded for it.
 *
 * `read` returns the file's contents, or null when it does not exist. Passed in
 * rather than read here so the rule is testable without a filesystem.
 */
export const checkHashes = (
  entries: readonly LockEntry[],
  read: (path: string) => string | null,
): LockFinding[] =>
  entries.flatMap((entry) => {
    const path = pinnedPath(entry);
    const content = read(path);
    if (content === null) {
      return [
        {
          rule: "missing-file",
          message:
            `skills-lock.json pins "${entry.name}" at ${path}, and that file does not exist.\n` +
            `  Either the skill was removed without dropping its entry, or "installedAt" is wrong.`,
        },
      ];
    }
    const actual = sha256(content);
    if (actual === entry.sha256) return [];
    return [
      {
        rule: "hash-mismatch",
        message:
          `"${entry.name}" does not match the hash recorded for it.\n` +
          `    recorded: ${entry.sha256}\n` +
          `      actual: ${actual}\n` +
          `  ${path} changed since it was reviewed. Re-read the diff before trusting it — this is a\n` +
          `  third-party instruction file, so a change is a change to what agents are told to do.\n` +
          `  If the new content is intended, record the new hash and update "reviewedBy"/"reviewedAt".`,
      },
    ];
  });

/**
 * Whether a SKILL.md declares an origin, i.e. says it came from somewhere else.
 *
 * The marker is a `source:` key nested under `metadata:` in the frontmatter,
 * which is exactly what find-skills requires of any skill not authored here.
 * Read structurally rather than by substring: several skills in this repo
 * discuss the convention in their prose, and one of them is find-skills itself.
 */
export const declaresSource = (skillMd: string): boolean => {
  const match = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return false;
  const lines = match[1].split(/\r?\n/);
  const start = lines.findIndex((line) => /^metadata:\s*$/.test(line));
  if (start === -1) return false;
  for (const line of lines.slice(start + 1)) {
    // The metadata block ends at the first line that is not indented.
    if (line.trim() !== "" && !/^\s/.test(line)) break;
    if (/^\s+source:\s*\S/.test(line)) return true;
  }
  return false;
};

/**
 * Rule 2 — every skill declaring an origin has an entry.
 *
 * `skills` is one { name, source } pair per directory under .agents/skills/.
 */
export const checkPinned = (
  skills: readonly { name: string; skillMd: string }[],
  entries: readonly LockEntry[],
): LockFinding[] => {
  const locked = new Set(entries.map((entry) => entry.name));
  return skills
    .filter((skill) => declaresSource(skill.skillMd) && !locked.has(skill.name))
    .map((skill) => ({
      rule: "unpinned-skill",
      message:
        `.agents/skills/${skill.name}/SKILL.md declares "metadata.source", so it did not originate ` +
        `here, and skills-lock.json has no entry for it.\n` +
        `  A third-party skill is instructions every agent on this repo will follow. Review it in ` +
        `full, then pin it — see .agents/skills/find-skills/SKILL.md for the procedure.`,
    }));
};

// --- CLI ---------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const LOCK = join(repoRoot, "skills-lock.json");
const SKILLS = join(repoRoot, ".agents", "skills");

const isMain = (): boolean => {
  const entry = process.argv[1];
  return typeof entry === "string" && entry.endsWith("skills-lock-check.ts");
};

if (isMain()) {
  const entries = entriesFrom(readFileSync(LOCK, "utf8"));

  const read = (path: string): string | null => {
    const abs = join(repoRoot, path);
    return existsSync(abs) ? readFileSync(abs, "utf8") : null;
  };

  const skills = readdirSync(SKILLS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, path: join(SKILLS, entry.name, "SKILL.md") }))
    .filter((skill) => existsSync(skill.path))
    .map((skill) => ({ name: skill.name, skillMd: readFileSync(skill.path, "utf8") }));

  const findings = [...checkHashes(entries, read), ...checkPinned(skills, entries)];

  if (findings.length === 0) {
    process.stdout.write(
      `skills-lock: ${entries.length} pinned skill(s) verified, ${skills.length} skill(s) present\n`,
    );
    process.exit(0);
  }

  process.stderr.write(`skills-lock: ${findings.length} problem(s)\n\n`);
  for (const finding of findings) {
    process.stderr.write(`  [${finding.rule}] ${finding.message}\n\n`);
  }
  process.exit(1);
}
