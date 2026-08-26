import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
// PR description repair: put back the description the platform threw away.
//
// Some agent platforms open the pull request through their own UI control
// rather than through git or `gh`, and that control writes its own title and
// body. v0's does: on PR #28 it described a four-word change to footer.yml as
// "Update UI components and layout design", and on PR #30 it described a
// change to a single line of overscroll copy with the same three bullets
// about responsiveness and design system consistency. The bullets are not a
// summary of the diff — they are boilerplate, identical across two unrelated
// changes — and `.github/PULL_REQUEST_TEMPLATE.md` does not reach that
// control (verified on PR #30, opened after the template was on main).
//
// The agent's own commit messages were correct in both cases. So the real
// description already exists on the branch; it just never reaches the pull
// request. This rewrites the title and body from the commits.
//
// It only fires on a body carrying a vendor session link, which is the
// signature of a machine-written body — a human or an agent writing through
// `gh` never produces one. That keeps it from ever overwriting prose someone
// actually wrote.
//
// Why repair rather than fail the check: the person who pressed the button is
// the client, editing their own site through an agent. Failing their pull
// request on a description they did not write and cannot fix would put the
// work on the one person with no way to do it.

export interface Description {
  title: string;
  body: string;
}

/**
 * The URL shapes a platform links back to its own session with.
 */
const VENDOR_SESSION_URL =
  String.raw`https?:\/\/(?:v0\.app|v0\.dev)\/[^\s)\]]*\/chat\/[^\s)\]]+` +
  String.raw`|https?:\/\/claude\.ai\/code\/session[^\s)\]]*` +
  String.raw`|https?:\/\/chatgpt\.com\/codex\/[^\s)\]]+`;

/**
 * The signature of a machine-written body: a session link alone on a line, at
 * column zero, as the platform emits it — `[v0 Session](https://v0.app/…)`.
 *
 * Deliberately narrower than "contains a session URL". A body that *discusses*
 * this defect necessarily quotes one — the pull request adding this file does,
 * and rewriting that body would destroy the explanation of why the file
 * exists. Prose puts the URL inside a sentence or an indented code block;
 * neither starts a line at column zero with a bare markdown link. Same
 * reasoning as `pr-hygiene`'s escaped-newline rule: match the defect's shape,
 * not a substring that legitimate writing shares.
 */
const MACHINE_SIGNATURE = new RegExp(
  String.raw`^\[[^\]\n]*\]\((?:${VENDOR_SESSION_URL})\)\s*$`,
  "im",
);

/** True when the body looks machine-generated rather than written. */
export const isMachineWritten = (body: string): boolean => MACHINE_SIGNATURE.test(body);

/**
 * GitHub's synthetic merge commit, exactly as it names one: `Merge <head sha>
 * into <base sha>`. It appears when a `pull_request` checkout lands on the
 * merge ref rather than the branch, and it is not a commit anyone wrote.
 *
 * `--no-merges` on the git call already removes it. This is the second gate,
 * because the first one lives in a shell argument no test can reach, and the
 * consequence of it failing is a pull request titled after a pair of SHAs --
 * which is what shipped on the first live run.
 */
const SYNTHETIC_MERGE = /^Merge [0-9a-f]{7,40} into [0-9a-f]{7,40}$/;

/** A trailer line: `Key: value` at the end of a commit message. */
const TRAILER_LINE = /^[A-Za-z][A-Za-z-]*:\s*\S/;

/** The first line of a commit message. */
export const subjectOf = (message: string): string => message.trim().split("\n")[0].trim();

/**
 * A commit message's prose: everything after the subject, minus the trailing
 * `Key: value` block. Trailers are provenance, reported separately, and
 * repeating them inside the prose reads as noise.
 */
export const proseOf = (message: string): string => {
  const lines = message.trim().split("\n").slice(1);
  while (
    lines.length > 0 &&
    (TRAILER_LINE.test(lines.at(-1) ?? "") || (lines.at(-1) ?? "").trim() === "")
  ) {
    lines.pop();
  }
  return lines.join("\n").trim();
};

/** The `Key: value` trailers on a commit message, in order. */
export const trailersOf = (message: string): string[] => {
  const lines = message.trim().split("\n");
  const trailers: string[] = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = (lines[i] ?? "").trim();
    if (line === "") continue;
    if (!TRAILER_LINE.test(line)) break;
    trailers.unshift(line);
  }
  return trailers;
};

const bullet = (text: string): string => `- ${text}`;

/**
 * Build the title and body from what the branch actually contains.
 *
 * The title is the first commit's subject, and the body leads with its prose.
 * One commit per pull request is the norm here, so most of the time there is
 * no choice to make. Where there is, the first commit is the one the branch
 * was opened to make; later ones are follow-ups, fixes, or -- on platforms
 * that auto-commit every message to the chat's working branch -- unrelated
 * work tried mid-chat, which lands on top.
 *
 * This was briefly changed to the last commit on the theory that PR #34's
 * wrong title came from a demo edit sorting oldest. It did not: that edit was
 * the newest commit on the branch, and the wrong title came from a stale copy
 * of this script. Every commit is listed in the body either way.
 */
export const describeFromCommits = (
  commitMessages: readonly string[],
  changedFiles: readonly string[],
): Description | null => {
  const commits = commitMessages
    .map((m) => m.trim())
    .filter((m) => m.length > 0 && !SYNTHETIC_MERGE.test(subjectOf(m)));
  // Commits arrive oldest-first, and the list rendered below keeps that order
  // because a history reads forwards.
  const headline = commits[0] ?? "";
  const title = subjectOf(headline);

  // Nothing usable to build from: leave the pull request exactly as the
  // platform left it. A generated description is at least a description; a
  // title invented here out of an empty branch would be worse than the one it
  // replaced, and the first live run proved this code can be wrong in ways
  // unit tests do not reach.
  if (title.length === 0) return null;

  const sections: string[] = ["## The change"];

  const prose = proseOf(headline);
  sections.push(prose.length > 0 ? prose : subjectOf(headline));

  if (commits.length > 1) {
    sections.push("## Commits", commits.map((m) => bullet(subjectOf(m))).join("\n"));
  }

  if (changedFiles.length > 0) {
    sections.push("## Files changed", changedFiles.map((f) => bullet(`\`${f}\``)).join("\n"));
  }

  const trailers = trailersOf(headline);
  if (trailers.length > 0) {
    sections.push("## Provenance", trailers.map(bullet).join("\n"));
  }

  sections.push(
    "---",
    [
      "Written from the commits on this branch by `pr-describe`, because the platform",
      "that opened this pull request generated a description of work that is not in the",
      "diff. The diff itself is untouched.",
    ].join("\n"),
  );

  return { title, body: `${sections.join("\n\n")}\n` };
};

// --- CLI ---------------------------------------------------------------------

/** Split `git log --format=%B%x00` output into individual messages. */
export const parseCommitMessages = (log: string): string[] =>
  log
    .split("\0")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);

/** Split `git diff --name-only -z` output into paths. */
export const parseChangedFiles = (out: string): string[] =>
  out
    .split("\0")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

const isMain = (): boolean => {
  const entry = process.argv[1];
  return typeof entry === "string" && entry.endsWith("pr-describe.ts");
};

const git = (args: string[]): string => execFileSync("git", args, { encoding: "utf8" });

if (isMain()) {
  // PR_BODY comes through the environment, never interpolated into a shell
  // command: a pull request body is text an outside contributor controls.
  const body = process.env.PR_BODY ?? "";
  const baseRef = process.env.BASE_REF ?? "origin/main";
  // The branch tip, not HEAD: a `pull_request` checkout leaves HEAD on
  // GitHub's synthetic merge commit. Read from the environment rather than
  // checked out, so this script always runs from the base branch's copy.
  const headRef = process.env.HEAD_SHA || "HEAD";

  if (!isMachineWritten(body)) {
    process.stdout.write("pr-describe: body is not machine-written — leaving it alone\n");
    process.exit(0);
  }

  // --reverse so the list reads oldest-first, the order a history is read in
  // and the order the title is taken from; git log is newest-first by default.
  // --no-merges
  // because on a `pull_request` event the checked-out HEAD can be GitHub's
  // synthetic merge commit ("Merge <head> into <base>"), which is not a
  // commit anyone wrote and makes a nonsense title.
  const commits = parseCommitMessages(
    git(["log", "--format=%B%x00", "--reverse", "--no-merges", `${baseRef}..${headRef}`]),
  );
  if (commits.length === 0) {
    process.stdout.write("pr-describe: no commits since base — nothing to describe from\n");
    process.exit(0);
  }

  const files = parseChangedFiles(git(["diff", "--name-only", "-z", `${baseRef}...${headRef}`]));
  const description = describeFromCommits(commits, files);
  if (description === null) {
    process.stdout.write("pr-describe: no usable commit subject — leaving the body as it is\n");
    process.exit(0);
  }
  const { title, body: rewritten } = description;

  // Written to files rather than echoed: the workflow passes them to
  // `gh pr edit --body-file`, and a body on a command line is the escaped-
  // newline defect that `pr-hygiene` exists to catch.
  writeFileSync(process.env.TITLE_FILE ?? "/tmp/pr-title.txt", title);
  writeFileSync(process.env.BODY_FILE ?? "/tmp/pr-body.md", rewritten);
  process.stdout.write(`pr-describe: rewriting from ${commits.length} commit(s)\n`);
}
