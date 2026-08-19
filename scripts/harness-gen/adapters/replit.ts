import type { Adapter, GeneratedFile } from "../types.ts";

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

export const generateReplit: Adapter = ({ config }) => {
  const { name } = config.project;

  const replitMd = `${REPLIT_MD_HEADER}# ${name}

This is **${name}**, a marketing website. You — or whoever you hand this
workspace to — can ask the built-in Agent to make content changes in plain
English: "update the homepage headline," "add a new team member to the
about page," "change the newsletter button text." The Agent does the actual
editing; you don't need to read or write any code yourself.

## Where the rules live

The full rulebook for how this site may safely be edited lives in
\`AGENTS.md\` at the root of this project. You don't need to read it
yourself — the Agent does — but if it ever proposes editing code instead of
content, or skipping a check below, point it at that file and ask it to
follow it.

## Before you trust a change

Every change has to pass the checks listed in \`AGENTS.md\` (content
validation, lint, tests, a full build) before it's safe to publish. Ask the
Agent to run them and show you the result. A clean pass is necessary but
not sufficient — always ask the Agent to also open the page it just changed
in preview and confirm it actually looks right, since some mistakes only
show up when you look.

## Shipping a change

Changes should land as a branch and a pull request, never a direct push to
\`main\` — \`main\` is what the live site serves, so a direct push publishes
before anyone has reviewed it. Ask the Agent to open a pull request (or use
the Git pane yourself) rather than merging straight to \`main\`.

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
# project requires Node >=24 (package.json "engines", .nvmrc) — the exact
# module identifier below is a best-effort match against that requirement,
# not verified against Replit's live module registry (this generator's
# research did not have a way to enumerate it). If Replit reports this
# module as unavailable, check the current list in the workspace's
# Nix/Modules UI and update this line by hand until a future harness-gen
# revision can verify it.
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
