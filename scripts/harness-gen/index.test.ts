import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

// Run from the repo root, same as `pnpm harness` / `pnpm harness:check`.
const INDEX = "scripts/harness-gen/index.ts";

// Everything the generator reads (AGENTS.md, harness.config.json,
// .agents/skills) and writes (CLAUDE.md, .claude/skills).
const HARNESS_FILES = ["AGENTS.md", "harness.config.json", "CLAUDE.md", ".agents", ".claude"];

/**
 * A temporary copy of the repo's harness inputs and outputs, for the tests
 * that have to break something to prove the generator notices. They write
 * there, never into this repo: a sandbox that locks .claude/ (the Plant does,
 * so an agent cannot rewrite its own config) would otherwise fail the suite
 * with EACCES before the test could prove anything.
 */
function copyOfHarness(): string {
  const root = mkdtempSync(join(tmpdir(), "harness-gen-"));
  for (const path of HARNESS_FILES) {
    if (existsSync(path)) cpSync(path, join(root, path), { recursive: true });
  }
  // cpSync keeps each file's mode, so a read-only .claude/ would copy as a
  // read-only copy the generator cannot write to. The copy is ours: make it
  // writable.
  makeWritable(root);
  return root;
}

function makeWritable(path: string) {
  chmodSync(path, statSync(path).mode | 0o200);
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path)) makeWritable(join(path, entry));
  }
}

function runGenerator(root?: string, ...args: string[]) {
  const rootArgs = root ? ["--root", root] : [];
  return execFileSync("node", ["--experimental-strip-types", INDEX, ...rootArgs, ...args], {
    stdio: "pipe",
  });
}

const runCheck = (root?: string) => () => runGenerator(root, "--check");

test("generated harness surfaces are in sync with AGENTS.md and harness.config.json", () => {
  // Read-only: checks this repo itself, and writes nothing.
  assert.doesNotThrow(runCheck());
});

test("harness:check names the file that drifted, same as catalog:check", () => {
  const root = copyOfHarness();
  try {
    const claudeMd = join(root, "CLAUDE.md");
    const original = readFileSync(claudeMd, "utf8");
    writeFileSync(
      claudeMd,
      `${original}\n<!-- hand-edited: this line should never survive a regenerate -->\n`,
    );
    assert.throws(runCheck(root), (error: unknown) => {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
      assert.match(stderr, /out of date/);
      assert.match(stderr, /CLAUDE\.md/);
      assert.match(stderr, /pnpm harness/);
      return true;
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("harness:check reports a file left behind in .claude/skills/ as stale, and `pnpm harness` deletes it", () => {
  // .claude/skills/ is an "owned dir" (claude-code.ts's ownedDirs) — index.ts
  // sweeps it for files on disk that are no longer in the generated set and
  // reports/removes them as *stale*, distinct from a file whose *content*
  // drifted (covered by the CLAUDE.md test above). A file with no
  // corresponding source under .agents/skills/ — e.g. a skill that was
  // deleted there but whose mirror was never cleaned up — is exactly that
  // case, so create one directly under the owned dir rather than editing an
  // existing mirrored file's content.
  const root = copyOfHarness();
  try {
    const stalePath = join(root, ".claude/skills/ghost-skill/SKILL.md");
    mkdirSync(dirname(stalePath), { recursive: true });
    writeFileSync(stalePath, "---\nname: ghost-skill\n---\n\nNot a real skill.\n");

    assert.throws(runCheck(root), (error: unknown) => {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
      assert.match(stderr, /stale, no longer generated/);
      assert.match(stderr, /ghost-skill/);
      return true;
    });

    // The non-`--check` path (`pnpm harness`) must actually delete the
    // stale file via rmSync, not just report it in --check's diff.
    runGenerator(root);
    assert.equal(existsSync(stalePath), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
