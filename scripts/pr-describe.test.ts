import assert from "node:assert/strict";
import { test } from "node:test";
import {
  describeFromCommits,
  isMachineWritten,
  parseChangedFiles,
  proseOf,
  sessionLinks,
  subjectOf,
  trailersOf,
} from "./pr-describe.ts";

// The body v0's Create PR control wrote on PR #30 (2026-08-26), verbatim.
// PR #28's body was the same three bullets with different wording, for a
// completely unrelated change — which is how we know it is boilerplate and
// not a summary of the diff.
const V0_BODY = [
  "- Updated application UI components with the latest design iterations from v0.",
  "- Refined layout and styling to improve visual consistency across the interface.",
  "- Enhanced component responsiveness for better mobile and desktop experiences.",
  "",
  "[v0 Session](https://v0.app/tope-5066/chat/jHxWwN3zchb)",
].join("\n");

// The commit the agent actually wrote on that same branch.
const V0_COMMIT = [
  "Make hidden overscroll copy more playful",
  "",
  "Requested-by: client",
  "Agent: v0",
].join("\n");

test("a v0-generated body is recognised as machine-written", () => {
  assert.equal(isMachineWritten(V0_BODY), true);
});

test("a hand-written body is left alone", () => {
  const body = "## The change\n\nAdds one FAQ entry.\n\n## Verification\n\nAll checks green.\n";
  assert.equal(isMachineWritten(body), false);
});

// The rule that would do real damage if it were loose: this file, and the
// pull request that adds it, both quote a v0 session URL while discussing
// the defect. A body that merely *mentions* a platform must not be rewritten.
test("a body discussing the defect is not treated as machine-written", () => {
  const body = [
    "## The change",
    "",
    "v0 appends a session link to bodies it writes itself, which is how",
    "`pr-describe` recognises them. It looks like this:",
    "",
    "    [v0 Session](https://v0.app/acme/chat/EXAMPLE)",
    "",
    "A body that merely links to https://v0.app/acme/chat/EXAMPLE mid-sentence",
    "is someone explaining the defect, not the defect.",
  ].join("\n");
  assert.equal(
    isMachineWritten(body),
    false,
    "the pull request that adds this file quotes a session link — rewriting it would delete the explanation",
  );
});

test("session links are extracted and deduplicated", () => {
  assert.deepEqual(sessionLinks(V0_BODY), ["https://v0.app/tope-5066/chat/jHxWwN3zchb"]);
  assert.deepEqual(sessionLinks("no links here"), []);
});

test("subject, prose and trailers split a commit message", () => {
  const message = [
    "Fix the thing",
    "",
    "Because it was broken.",
    "",
    "Requested-by: client",
    "Agent: v0",
  ].join("\n");
  assert.equal(subjectOf(message), "Fix the thing");
  assert.equal(proseOf(message), "Because it was broken.");
  assert.deepEqual(trailersOf(message), ["Requested-by: client", "Agent: v0"]);
});

test("a commit with no prose still yields a usable body", () => {
  const { title, body } = describeFromCommits([V0_COMMIT], ["a.yml"], V0_BODY);
  assert.equal(title, "Make hidden overscroll copy more playful");
  assert.match(body, /## The change\n\nMake hidden overscroll copy more playful/);
});

test("the rewritten description names the real change, the file, and the provenance", () => {
  const { title, body } = describeFromCommits(
    [V0_COMMIT],
    ["artifacts/web/content/settings/overscroll.yml"],
    V0_BODY,
  );
  assert.equal(title, "Make hidden overscroll copy more playful");
  assert.match(body, /artifacts\/web\/content\/settings\/overscroll\.yml/);
  assert.match(body, /Requested-by: client/);
  assert.match(body, /Agent: v0/);
  assert.match(
    body,
    /https:\/\/v0\.app\/tope-5066\/chat\/jHxWwN3zchb/,
    "session link is preserved",
  );
  assert.ok(!body.includes("Enhanced component responsiveness"), "invented bullets are gone");
});

test("the rewritten body has real line breaks, so pr-hygiene stays green", () => {
  const { body } = describeFromCommits([V0_COMMIT], ["a.yml"], V0_BODY);
  assert.ok(!body.includes("\\n"), "no literal escapes");
  assert.ok(body.split("\n").length > 5, "real line breaks");
});

test("several commits are all listed", () => {
  const { title, body } = describeFromCommits(
    ["First change\n\nWhy.\n\nRequested-by: client", "Second change"],
    ["a.yml", "b.yml"],
    V0_BODY,
  );
  assert.equal(title, "First change");
  assert.match(body, /## Commits/);
  assert.match(body, /- First change/);
  assert.match(body, /- Second change/);
});

// The first live run titled a pull request "Merge dab007b... into 1486574...".
// On a `pull_request` event the checked-out HEAD is GitHub's synthetic merge
// commit, and `git log` is newest-first, so the title came from a commit
// nobody wrote. Fixed at the git call with --no-merges and --reverse, and
// guarded here so the description survives one arriving anyway.
test("a synthetic merge commit never becomes the title", () => {
  const merge = "Merge dab007b201e261d2d5afb09a436ed68b581bd7f2 into 14865740f746d2a29802ea";
  const real = "Make hidden overscroll copy more playful\n\nRequested-by: client\nAgent: v0";
  const { title } = describeFromCommits([real, merge], ["a.yml"], V0_BODY);
  assert.equal(title, "Make hidden overscroll copy more playful");
});

test("the first commit, not the last, gives the title", () => {
  const { title } = describeFromCommits(["First change", "Second change"], [], V0_BODY);
  assert.equal(title, "First change", "commits arrive oldest-first via git log --reverse");
});

test("parseChangedFiles splits NUL-separated paths", () => {
  assert.deepEqual(parseChangedFiles("a.ts\0b.ts\0"), ["a.ts", "b.ts"]);
  assert.deepEqual(parseChangedFiles(""), []);
});
