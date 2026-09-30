import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
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

test("harness:check reports a file left behind in .claude/skills/ as stale, and `pnpm harness` deletes it", () => {
  // .claude/skills/ is an "owned dir" (claude-code.ts's ownedDirs) — index.ts
  // sweeps it for files on disk that are no longer in the generated set and
  // reports/removes them as *stale*, distinct from a file whose *content*
  // drifted (covered by the CLAUDE.md test above). A file with no
  // corresponding source under .agents/skills/ — e.g. a skill that was
  // deleted there but whose mirror was never cleaned up — is exactly that
  // case, so create one directly under the owned dir rather than editing an
  // existing mirrored file's content.
  //
  // It runs on a copy of the generator and its inputs in a temp dir, not in
  // the checkout: index.ts resolves the repo root from its own location, and
  // writing into the checkout's .claude/ fails where .claude/ is read-only
  // (the Plant's sandbox, EACCES on mkdir).
  const root = mkdtempSync(join(tmpdir(), "harness-gen-"));
  try {
    for (const path of ["scripts/harness-gen", ".agents", "AGENTS.md", "harness.config.json"]) {
      cpSync(path, join(root, path), { recursive: true });
    }
    const index = join(root, INDEX);
    const run = (...args: string[]) =>
      execFileSync("node", ["--experimental-strip-types", index, ...args], {
        cwd: root,
        stdio: "pipe",
      });
    run(); // generate the copy's surfaces, so the only drift is the stale file below

    const stalePath = join(root, ".claude/skills/ghost-skill/SKILL.md");
    mkdirSync(dirname(stalePath), { recursive: true });
    writeFileSync(stalePath, "---\nname: ghost-skill\n---\n\nNot a real skill.\n");
    assert.throws(
      () => run("--check"),
      (error: unknown) => {
        const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
        assert.match(stderr, /stale, no longer generated/);
        assert.match(stderr, /ghost-skill/);
        return true;
      },
    );

    // The non-`--check` path (`pnpm harness`) must actually delete the
    // stale file via rmSync, not just report it in --check's diff.
    run();
    assert.equal(existsSync(stalePath), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
