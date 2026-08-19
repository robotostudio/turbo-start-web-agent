import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { test } from "node:test";

// Run from the repo root, same as `pnpm harness` / `pnpm harness:check`.
const INDEX = "scripts/harness-gen/index.ts";
const CLAUDE_MD = "CLAUDE.md";

function runCheck() {
  return execFileSync("node", ["--experimental-strip-types", INDEX, "--check"], {
    stdio: "pipe",
  });
}

test("generated harness surfaces are in sync with AGENTS.md and harness.config.json", () => {
  assert.doesNotThrow(runCheck);
});

test("harness:check names the file that drifted, same as catalog:check", () => {
  const original = readFileSync(CLAUDE_MD, "utf8");
  const corrupted = `${original}\n<!-- hand-edited: this line should never survive a regenerate -->\n`;
  writeFileSync(CLAUDE_MD, corrupted);
  try {
    assert.throws(runCheck, (error: unknown) => {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
      assert.match(stderr, /out of date/);
      assert.match(stderr, /CLAUDE\.md/);
      assert.match(stderr, /pnpm harness/);
      return true;
    });
  } finally {
    writeFileSync(CLAUDE_MD, original);
  }
});

test("harness:check reports a skill removed from .agents/skills/ as stale, not just missing", () => {
  // find-skills is one of the three project-authored skills mirrored into
  // .claude/skills/ (see .agents/skills/find-skills/SKILL.md). Deleting only
  // its mirror (not the source) simulates the drift a stale .claude/skills/
  // file would show: present on disk, no longer expected.
  const mirrorPath = ".claude/skills/find-skills/SKILL.md";
  const original = readFileSync(mirrorPath, "utf8");
  writeFileSync(mirrorPath, `${original}\ntampered\n`);
  try {
    assert.throws(runCheck, (error: unknown) => {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
      assert.match(stderr, /find-skills/);
      return true;
    });
  } finally {
    writeFileSync(mirrorPath, original);
  }
});
