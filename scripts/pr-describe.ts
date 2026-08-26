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

const VENDOR_SESSION_LINK = new RegExp(VENDOR_SESSION_URL, "gi");

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

/** Every vendor session link in a body, in order, deduplicated. */
export const sessionLinks = (body: string): string[] => [
  ...new Set(body.match(VENDOR_SESSION_LINK) ?? []),
];

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
 * The title is the first commit's subject: an agent following this repo's
 * skill writes one commit per requested change, so that subject is the
 * change. The body leads with the first commit's prose because that is where
 * the "why" lives.
 */
export const describeFromCommits = (
  commitMessages: readonly string[],
  changedFiles: readonly string[],
  originalBody: string,
): Description => {
  const commits = commitMessages.map((m) => m.trim()).filter((m) => m.length > 0);
  const first = commits[0] ?? "";
  const title = subjectOf(first) || "Changes from an agent session";

  const sections: string[] = ["## The change"];

  const prose = proseOf(first);
  sections.push(prose.length > 0 ? prose : subjectOf(first));

  if (commits.length > 1) {
    sections.push("## Commits", commits.map((m) => bullet(subjectOf(m))).join("\n"));
  }

  if (changedFiles.length > 0) {
    sections.push("## Files changed", changedFiles.map((f) => bullet(`\`${f}\``)).join("\n"));
  }

  const trailers = trailersOf(first);
  if (trailers.length > 0) {
    sections.push("## Provenance", trailers.map(bullet).join("\n"));
  }

  const links = sessionLinks(originalBody);
  sections.push(
    "---",
    [
      "This description was written from the commits on this branch. The platform that",
      "opened this pull request generated its own title and body, which described work",
      "that is not in the diff — see `scripts/pr-describe.ts`. The diff is unchanged.",
      ...(links.length > 0 ? ["", ...links.map((l) => bullet(l))] : []),
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

  if (!isMachineWritten(body)) {
    process.stdout.write("pr-describe: body is not machine-written — leaving it alone\n");
    process.exit(0);
  }

  const commits = parseCommitMessages(git(["log", "--format=%B%x00", `${baseRef}..HEAD`]));
  if (commits.length === 0) {
    process.stdout.write("pr-describe: no commits since base — nothing to describe from\n");
    process.exit(0);
  }

  const files = parseChangedFiles(git(["diff", "--name-only", "-z", `${baseRef}...HEAD`]));
  const { title, body: rewritten } = describeFromCommits(commits, files, body);

  // Written to files rather than echoed: the workflow passes them to
  // `gh pr edit --body-file`, and a body on a command line is the escaped-
  // newline defect that `pr-hygiene` exists to catch.
  writeFileSync(process.env.TITLE_FILE ?? "/tmp/pr-title.txt", title);
  writeFileSync(process.env.BODY_FILE ?? "/tmp/pr-body.md", rewritten);
  process.stdout.write(`pr-describe: rewriting from ${commits.length} commit(s)\n`);
}
