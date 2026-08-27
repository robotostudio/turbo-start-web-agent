import { execFileSync } from "node:child_process";
// PR hygiene gate: the first check in this repo that reads English.
//
// Every other gate — the content lockdown, the Block schemas, the drift
// checks, the build — inspects code. None of them can see the pull request's
// own prose, and that is precisely the layer where agent-authored changes
// have gone wrong here: one PR body arrived as a single unreadable line of
// literal `\n` escapes, and a separate one described a change nobody had
// requested (AGENTS.md §6, 2026-08-20).
//
// This catches the malformed case. It cannot catch the untrue case — a body
// can be beautifully formatted and completely wrong about what the diff
// does — which is why "read the diff, not the description" stays a rule for
// humans rather than a check.
//
// Exported as pure functions over strings so the rules are unit-testable
// without a GitHub event; `main()` at the bottom is the thin CLI wrapper.

export interface Finding {
  /** Short machine-ish label, used to group output. */
  rule: string;
  /** What is wrong, addressed to whoever has to fix it. */
  message: string;
}

/** Occurrences of the two-character sequence backslash-n. */
const countLiteralEscapes = (text: string): number => (text.match(/\\n/g) ?? []).length;

/** Occurrences of an actual line break. */
const countRealNewlines = (text: string): number => (text.match(/\n/g) ?? []).length;

/**
 * The escaped-newline defect: a body composed as a JavaScript/JSON string and
 * then passed through a shell, where `\n` inside double quotes is a backslash
 * followed by `n` rather than a line break. GitHub stores it verbatim and
 * Markdown has no meaning for it, so the whole body renders as one run-on
 * line with the escapes visible.
 *
 * Deliberately NOT a plain substring match. A legitimate body may discuss
 * `\n` — the pull request introducing this very check does — and failing that
 * would be worse than the bug. The discriminator is the ratio: the defect
 * produces many escapes and almost no real line breaks, because every break
 * that should exist got swallowed. Genuine prose is full of real breaks
 * whether or not it mentions escapes.
 */
export const checkEscapedNewlines = (body: string): Finding[] => {
  const escapes = countLiteralEscapes(body);
  const newlines = countRealNewlines(body);
  if (escapes >= 2 && newlines < 3) {
    return [
      {
        rule: "escaped-newlines",
        message:
          `The body contains ${escapes} literal "\\n" sequences but only ${newlines} real line ` +
          `break(s), so GitHub renders it as one run-on line with the escapes showing.\n` +
          `  Cause: a multi-line body passed as \`--body "…\\n…"\`. Shells do not expand \\n ` +
          `inside double quotes.\n` +
          `  Fix: write the body to a file and use \`gh pr create --body-file <path>\`, which has ` +
          `no shell escaping at all. See .agents/skills/sync-changes/SKILL.md.`,
      },
    ];
  }
  return [];
};

/** A body of only whitespace tells a reviewer nothing. */
export const checkNonEmptyBody = (body: string): Finding[] =>
  body.trim().length === 0
    ? [
        {
          rule: "empty-body",
          message:
            "The pull request has no description. Say what changed and why — the diff shows " +
            "what, not why.",
        },
      ]
    : [];

/**
 * Vendor attribution trailers. Several agent platforms append these by
 * default: a model credit, and a link to the session that produced the
 * commit. This repo uses `Requested-by:` and `Agent:` instead — they record
 * who wanted the change and what carried it out, which is the provenance a
 * developer reading `git log` actually needs. See sync-changes.
 *
 * The session URL is not a secret (it 403s for anyone but the account that
 * made it), so this is about the permanent record in a public repository,
 * not about disclosure.
 */
const VENDOR_TRAILER = /^\s*(co-authored-by|claude-session|generated-(?:by|with)|x-session)\s*:/im;

export const checkVendorTrailers = (commitMessages: readonly string[]): Finding[] =>
  commitMessages
    .filter((message) => VENDOR_TRAILER.test(message))
    .map((message) => ({
      rule: "vendor-trailer",
      message:
        `Commit "${message.split("\n")[0]}" carries a vendor attribution trailer ` +
        `(Co-Authored-By, a session URL, or similar).\n` +
        `  Use \`Requested-by:\` and \`Agent:\` instead — see .agents/skills/sync-changes/SKILL.md.\n` +
        `  A trailer is part of the commit message, so this cannot be fixed by editing the pull ` +
        `request. It needs \`git commit --amend\` and a force-push.\n` +
        `  If your platform cannot force-push — several push only through their own GitHub ` +
        `integration, which does not expose it — do not keep retrying. Say so, quote the ` +
        `corrected message, and ask the operator to push it. Get the trailers right at commit ` +
        `time and this never arises.`,
    }));

/**
 * A trailer line: `Key: value` at the start of a line, which is the only shape
 * git recognises as a trailer.
 */
const TRAILER_LINE = /^[A-Za-z][A-Za-z-]*:.*$/gm;

/**
 * The escaped-newline defect again, one layer down: a commit message whose
 * trailers were composed as a single string and joined with a literal `\n`
 * rather than a line break.
 *
 * Observed on 2026-08-27, PR #47:
 *
 *     Requested-by: client\nAgent: v0
 *
 * Git sees one trailer whose value happens to contain two characters that look
 * like an escape. `Agent:` is not a trailer at all, so the provenance the
 * convention exists to record is silently gone — and `pr-hygiene` passed the
 * pull request, because the body rule never looked at commit messages.
 *
 * Scoped to trailer lines rather than the whole message, for the same reason
 * `checkEscapedNewlines` is a ratio and not a substring match: commit messages
 * in this repository discuss `\n` — several were written while building this
 * very check — and failing those would be worse than the defect. A trailer is
 * structured, so a literal escape inside one is unambiguous; prose about
 * escapes lives in paragraphs, which this rule never reads.
 */
export const checkEscapedTrailers = (commitMessages: readonly string[]): Finding[] =>
  commitMessages.flatMap((message) => {
    const broken = (message.match(TRAILER_LINE) ?? []).filter((line) => line.includes("\\n"));
    if (broken.length === 0) return [];
    return [
      {
        rule: "escaped-trailer",
        message:
          `Commit "${message.split("\n")[0]}" has a literal \\n inside a trailer:\n` +
          broken.map((line) => `    ${line}`).join("\n") +
          `\n  Git reads that as ONE trailer whose value contains a backslash and an "n", so ` +
          `every trailer after the first is lost along with the provenance it recorded.\n` +
          `  Write each trailer on its own line. A shell does not expand \\n inside double ` +
          `quotes, so \`-m "Requested-by: client\\nAgent: v0"\` produces exactly this; use a ` +
          `second \`-m\`, a heredoc, or \`--file\`.\n` +
          `  Get it right at commit time: fixing it afterwards needs an amend and a force-push.`,
      },
    ];
  });

/** Every rule, run over one pull request. */
export const checkPullRequest = (body: string, commitMessages: readonly string[]): Finding[] => [
  ...checkNonEmptyBody(body),
  ...checkEscapedNewlines(body),
  ...checkVendorTrailers(commitMessages),
  ...checkEscapedTrailers(commitMessages),
];

// --- CLI ---------------------------------------------------------------------

/** Split `git log --format=%B%x00` output into individual messages. */
export const parseCommitMessages = (log: string): string[] =>
  log
    .split("\0")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);

const isMain = (): boolean => {
  const entry = process.argv[1];
  return typeof entry === "string" && entry.endsWith("pr-hygiene.ts");
};

/**
 * Commit messages on the pull request's branch but not on the base,
 * NUL-separated. `--no-merges` because a `pull_request` checkout can put a
 * synthetic "Merge <sha> into <sha>" commit in the range, which nobody wrote
 * and no rule here should judge.
 */
const commitMessagesSince = (baseRef: string, headRef: string): string[] => {
  try {
    const log = execFileSync(
      "git",
      ["log", "--format=%B%x00", "--no-merges", `${baseRef}..${headRef}`],
      {
        encoding: "utf8",
      },
    );
    return parseCommitMessages(log);
  } catch {
    // A shallow clone, a missing base ref, or a detached checkout: report the
    // body findings rather than failing the run on a git problem the author
    // cannot act on. The body rules are the ones this gate exists for.
    process.stderr.write(
      `PR hygiene: could not read commits since "${baseRef}" — skipping commit checks.\n`,
    );
    return [];
  }
};

if (isMain()) {
  // PR_BODY is passed through the environment rather than interpolated into a
  // shell command by the workflow: a pull request body is attacker-controlled
  // text, and `run: echo "${{ github.event.pull_request.body }}"` is a script
  // injection. Reading commits here rather than in YAML keeps the workflow to
  // one step and the parsing under test.
  const body = process.env.PR_BODY ?? "";
  const baseRef = process.env.BASE_REF ?? "origin/main";
  // The pull request's branch tip, read from the environment rather than
  // checked out: the workflow checks out the BASE branch so that this script is
  // always the current one, which leaves HEAD pointing at the base. Without
  // this the range below is empty and every commit rule passes on nothing.
  const headRef = process.env.HEAD_SHA || "HEAD";
  const findings = checkPullRequest(body, commitMessagesSince(baseRef, headRef));

  if (findings.length === 0) {
    process.stdout.write("PR hygiene: clean\n");
    process.exit(0);
  }

  process.stderr.write(`PR hygiene: ${findings.length} problem(s)\n\n`);
  for (const finding of findings) {
    process.stderr.write(`  [${finding.rule}] ${finding.message}\n\n`);
  }
  process.exit(1);
}
