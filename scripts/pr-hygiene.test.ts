import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkEscapedNewlines,
  checkNonEmptyBody,
  checkPullRequest,
  checkVendorTrailers,
  parseCommitMessages,
} from "./pr-hygiene.ts";

// The exact body that shipped on PR #12 (2026-08-20), reproduced verbatim.
// An agent composed it as a JS string and passed it through `--body "…"`, so
// bash handed GitHub literal backslash-n and the whole thing rendered as one
// line. This is the regression this gate exists for.
const BROKEN_BODY =
  "## Summary\\n- Add a homepage FAQ question about rebrand timing\\n- Explain that most rebrands take an afternoon\\n\\n## Verification\\n- pnpm content:check\\n- Verified the homepage FAQ in the browser";

test("catches the escaped-newline body that shipped on PR #12", () => {
  const findings = checkEscapedNewlines(BROKEN_BODY);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, "escaped-newlines");
  assert.match(findings[0].message, /--body-file/);
});

test("a normal multi-line body passes", () => {
  const body = "## The change\n\nAdds one FAQ entry.\n\n## Verification\n\nAll checks green.\n";
  assert.deepEqual(checkEscapedNewlines(body), []);
});

// The rule that a naive substring match would get wrong: the pull request
// introducing this check necessarily talks about `\n`, and failing that PR
// would be worse than the bug it prevents. Real prose has real line breaks.
test("a body that DISCUSSES literal escapes still passes", () => {
  const body = [
    "## Why the body was broken",
    "",
    'Bash does not expand `\\n` inside double quotes, so `--body "a\\nb"` sends',
    "the literal characters. Use `--body-file` instead, which has no escaping.",
    "",
    "Before: `## Summary\\n- one\\n- two`",
    "After: real line breaks.",
  ].join("\n");
  assert.ok(body.includes("\\n"), "fixture must contain literal escapes to be meaningful");
  assert.deepEqual(checkEscapedNewlines(body), [], "prose about \\n must not be flagged");
});

test("one stray escape is not enough to flag", () => {
  assert.deepEqual(
    checkEscapedNewlines("A line mentioning \\n once.\nAnd another.\nAnd more.\n"),
    [],
  );
});

test("empty and whitespace-only bodies are flagged", () => {
  assert.equal(checkNonEmptyBody("").length, 1);
  assert.equal(checkNonEmptyBody("   \n  \n").length, 1);
  assert.deepEqual(checkNonEmptyBody("Real description."), []);
});

test("vendor attribution trailers are flagged", () => {
  const commit = [
    "Point announcement banner to formatting guide",
    "",
    "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>",
    "Claude-Session: https://claude.ai/code/session_01GQ",
  ].join("\n");
  const findings = checkVendorTrailers([commit]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].message, /Requested-by/);
});

test("this repo's own trailer convention passes", () => {
  const commit = [
    "Add rebrand timing to homepage FAQ",
    "",
    "Requested-by: client",
    "Agent: v0",
  ].join("\n");
  assert.deepEqual(checkVendorTrailers([commit]), []);
});

test("a clean pull request produces no findings", () => {
  const body = "## The change\n\nOne FAQ entry added.\n\n## Verification\n\nAll gates green.\n";
  const commits = ["content: add an FAQ entry\n\nRequested-by: client\nAgent: Codex"];
  assert.deepEqual(checkPullRequest(body, commits), []);
});

test("findings from different rules accumulate", () => {
  const findings = checkPullRequest("", ["x\n\nCo-Authored-By: Someone <a@b.c>"]);
  assert.deepEqual(findings.map((f) => f.rule).sort(), ["empty-body", "vendor-trailer"]);
});

test("parseCommitMessages splits on NUL and drops blanks", () => {
  assert.deepEqual(parseCommitMessages("first message\0second message\0"), [
    "first message",
    "second message",
  ]);
  assert.deepEqual(parseCommitMessages(""), []);
});
