<!--
  GENERATED FILE — do not edit directly.
  Source: AGENTS.md and harness.config.json (edit those), or
  scripts/harness-gen/adapters/replit.ts (edit the wording below).
  Regenerate with `pnpm harness`.

  Heads up: Replit's own Agent may rewrite this file as a side effect of
  normal use — that's expected Replit behavior, not a bug in this
  generator (see docs/research/agent-platform-surfaces.md §1). If it
  happens, the next `pnpm harness:check` will fail and name this file as
  drifted, which is the cue to reconcile it against AGENTS.md and
  regenerate rather than to keep hand-editing it.
-->

# Harbour

This is **Harbour**, a marketing website. You — or whoever you hand this
workspace to — can ask the built-in Agent to make content changes in plain
English: "update the homepage headline," "add a new team member to the
about page," "change the newsletter button text." The Agent does the actual
editing; you don't need to read or write any code yourself.

## Where the rules live

The full rulebook for how this site may safely be edited lives in
`AGENTS.md` at the root of this project. You don't need to read it
yourself — the Agent does — but if it ever proposes editing code instead of
content, or skipping a check below, point it at that file and ask it to
follow it.

## Before you trust a change

Every change has to pass the checks listed in `AGENTS.md` (content
validation, lint, tests, a full build) before it's safe to publish. Ask the
Agent to run them and show you the result. A clean pass is necessary but
not sufficient — always ask the Agent to also open the page it just changed
in preview and confirm it actually looks right, since some mistakes only
show up when you look.

## Shipping a change

Changes should land as a branch and a pull request, never a direct push to
`main` — `main` is what the live site serves, so a direct push publishes
before anyone has reviewed it. Ask the Agent to open a pull request (or use
the Git pane yourself) rather than merging straight to `main`.

## On boot

This workspace runs `scripts/preflight.sh` automatically on boot and
prints a report of what it can and cannot do here — for example, whether it
can reach GitHub to open a pull request, or whether an optional feature
like Slack notifications or image uploads is configured. If something
related isn't working, check that report first; it names exactly what's
missing and what to do about it.
