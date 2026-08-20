import type { Adapter, GeneratedFile } from "../types.ts";

// Pulls the body of a `## N. Heading` section out of AGENTS.md — everything
// between that heading line and the next `##` heading (or end of file).
//
// This is what makes replit.md's client-facing prose about the rules a
// genuine function of AGENTS.md instead of independently hand-written text
// that happens to agree with it today: the golden rules are quoted
// verbatim below rather than re-described, so editing AGENTS.md §1 changes
// this generator's output and trips `harness:check` on the next run — the
// exact drift `index.ts`'s "pure function of AGENTS.md" comment claims for
// every generated file.
function extractSection(agentsMd: string, heading: string): string {
  const lines = agentsMd.split("\n");
  const startIdx = lines.findIndex((line) => line.trim() === heading);
  if (startIdx === -1) {
    throw new Error(
      `replit.ts: could not find "${heading}" in AGENTS.md — has the heading text changed? Update the heading string in adapters/replit.ts to match.`,
    );
  }
  const rest = lines.slice(startIdx + 1);
  const nextHeadingOffset = rest.findIndex((line) => /^##\s/.test(line));
  const body = nextHeadingOffset === -1 ? rest : rest.slice(0, nextHeadingOffset);
  return body.join("\n").trim();
}

// Renders a Markdown section as a blockquote, so it reads as a quotation of
// AGENTS.md rather than replit.md's own prose.
function asBlockquote(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => (line.length > 0 ? `> ${line}` : ">"))
    .join("\n");
}

// Replit adapter.
//
// Replit only reads `replit.md`, and only from the project root
// (docs/research/agent-platform-surfaces.md §1, "replit.md must be located
// in your project's root directory to work properly" — Agent will not find
// it in a subdirectory). It also *rewrites* replit.md as a normal side
// effect of using the Agent, which is exactly what makes this generator's
// --check gate matter here more than anywhere else in the project: drift
// is not hypothetical, it is guaranteed, and --check is the only thing that
// will ever surface it.
//
// `.replit` deliberately carries no [deployment] block: this site deploys
// from its own host (see harness.config.json's site.host), and a Replit
// deployment would stand up a second, duplicate copy of the marketing site
// for search engines to find.
//
// Replit's guided GitHub import may open a task proposing to PORT the app
// to another framework (observed 2026-08-20: a task titled "Port imported
// Vercel app to Replit" that set about converting this Next.js app to
// Vite). The generated replit.md therefore opens with a standing
// instruction against exactly that — Agent reads replit.md as instructions,
// so this is the one lever a repo has over the behaviour. See
// docs/platforms/replit.md §1 for the operator-side procedure.
//
// `.replit` also deliberately omits [workflows], [postMerge], and a
// .replitignore file. The research backing this generator found no primary
// source documenting any of the three — they're empirically observed in
// Replit-generated repos, not contractual — so the harness does not depend
// on any of them working. See the comment block inside the generated file
// itself; it says the same thing, because an operator reading .replit
// directly should see the same caveat without having to find this file.

const REPLIT_MD_HEADER = `<!--
  GENERATED FILE — do not edit directly.
  Source: AGENTS.md and harness.config.json (edit those), or
  scripts/harness-gen/adapters/replit.ts (edit the wording below).
  Regenerate with \`pnpm harness\`.

  Heads up: Replit's own Agent may rewrite this file as a side effect of
  normal use — that's expected Replit behavior, not a bug in this
  generator (see docs/research/agent-platform-surfaces.md §1). If it
  happens, the next \`pnpm harness:check\` will fail and name this file as
  drifted, which is the cue to reconcile it against AGENTS.md and
  regenerate rather than to keep hand-editing it.
-->

`;

export const generateReplit: Adapter = ({ config, agentsMd }) => {
  const { name } = config.project;
  const goldenRules = asBlockquote(extractSection(agentsMd, "## 1. Golden rules"));

  const replitMd = `${REPLIT_MD_HEADER}# ${name}

This is **${name}**, a marketing website. You — or whoever you hand this
workspace to — can ask the built-in Agent to make content changes in plain
English: "update the homepage headline," "add a new team member to the
about page," "change the newsletter button text." The Agent does the actual
editing; you don't need to read or write any code yourself.

## Do not migrate this project

**This is a Next.js App Router project. Do not migrate it to Vite, or to
any other framework or build tool.** Do not "port" it, "adapt" it, or
"convert the rendering layer" — not as a setup step, not as an
optimisation, not to make it fit this platform better. If a task appears
that proposes any of that, stop and say so rather than starting it.

This is not a preference. The entire content pipeline depends on the
Next.js build: MDX is compiled by Velite, validated by a remark plugin that
rejects executable content, and rendered through the App Router as static
pages. A framework migration destroys all of it, and the site's safety
guarantee with it.

Editing content is always the job. Changing how the project is built never
is.

## Where the rules live

The full rulebook for how this site may safely be edited lives in
\`AGENTS.md\` at the root of this project — the Agent reads it, you don't
need to. Its golden rules, quoted directly from that file so this page
can't quietly drift from it:

${goldenRules}

If the Agent ever proposes editing code instead of content, or skipping a
check below, point it at rule 2 or rule 4 above and ask it to follow it.

## Before you trust a change

Rule 4 above is not just a suggestion: every change has to pass the checks
listed in \`AGENTS.md\` §5 before it's safe to publish. Ask the Agent to run
them and show you the result. A clean pass is necessary but not sufficient
— always ask the Agent to also open the page it just changed in preview and
confirm it actually looks right, since some mistakes only show up when you
look.

## Shipping a change

Rule 7 above means changes land as a branch and a pull request, never a
direct push to \`main\` — \`main\` is what the live site serves, so a direct
push publishes before anyone has reviewed it. Ask the Agent to open a pull
request (or use the Git pane yourself) rather than merging straight to
\`main\`.

## On boot

This workspace runs \`scripts/preflight.sh\` automatically on boot and
prints a report of what it can and cannot do here — for example, whether it
can reach GitHub to open a pull request, or whether an optional feature
like Slack notifications or image uploads is configured. If something
related isn't working, check that report first; it names exactly what's
missing and what to do about it.
`;

  const replitToml = `# GENERATED FILE — do not edit directly.
# Source: harness.config.json (edit that), or
# scripts/harness-gen/adapters/replit.ts (edit the shape below).
# Regenerate with \`pnpm harness\`.
#
# Deliberately omitted, on purpose, not by oversight:
#
#   [deployment]   This site deploys from its own host (see
#                  harness.config.json's site.host). A Replit deployment
#                  here would stand up a second, duplicate copy of the
#                  marketing site — bad for SEO, and a second place content
#                  could drift from what's actually live.
#
#   [workflows], [postMerge], and a .replitignore file
#                  The research behind this generator
#                  (docs/research/agent-platform-surfaces.md §1) found no
#                  primary source documenting any of the three against
#                  Replit's official docs. They are empirically observed in
#                  Replit-generated repos, not contractual — this harness
#                  does not depend on any of them working. Verify against a
#                  live Agent-generated repo before adding any of them by
#                  hand.
#
# "modules" pins the Nix module Replit provisions the workspace with. This
# project requires Node >=24 (package.json "engines", .nvmrc).
# "nodejs-24" is VERIFIED: it is the module a live, working Replit
# workspace running this same stack provisions with. If Replit ever reports
# it unavailable, check the current list in the workspace's Nix/Modules UI.
modules = ["nodejs-24"]


# ${config.commands.dev} delegates to artifacts/web's "dev" script, which
# already runs \`next dev\` bound to 0.0.0.0 and reads the PORT env var
# (falling back to 3000) — both required for Replit's preview proxy to
# reach it. See artifacts/web/package.json.
run = "${config.commands.dev}"

# Reports capabilities before an agent starts editing (git reachability, PR
# ability, package-manager usability, plus every probe in
# harness.config.json). Always exits 0 — see scripts/preflight.sh's own
# header for why a capability *report* must never block a boot.
onBoot = "sh scripts/preflight.sh"

# EVERY top-level key must appear ABOVE this line. TOML tables swallow all
# keys that follow them, so a bare \`run\`/\`onBoot\` written after [env]
# silently becomes env.run/env.onBoot — a valid file that parses fine and
# quietly disables the dev server and this boot report. Caught exactly that
# way while adding the block below.
#
# Stops pnpm trying to self-install the version pinned in package.json's
# "packageManager" field. Replit's container ships its own pnpm; this repo
# pins a different one, and the self-update stalls — which hangs EVERY pnpm
# command in the workspace, not just slow ones. The failure is badly
# disguised: what looks like a slow typecheck is pnpm stalling before tsc
# ever starts, so the obvious diagnosis (a big build) is the wrong one. A
# developer on a machine already running the pinned version never sees it.
# Diagnosed the hard way on another project running this same stack.
[env]
npm_config_manage_package_manager_versions = "false"

[[ports]]
localPort = 3000
externalPort = 80
`;

  const files: GeneratedFile[] = [
    { path: "replit.md", content: replitMd },
    { path: ".replit", content: replitToml },
  ];

  return { files };
};
