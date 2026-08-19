# Repository rulesets

`main.json` is this repo's live branch ruleset, exported from GitHub rather
than written by hand — so it says what is actually enforced, not what someone
intended to enforce.

Import it into a client repo through **Settings → Rules → Rulesets → New
ruleset → Import a ruleset**, then confirm it took effect by trying a direct
push and watching it get rejected. A ruleset that has never been tested is a
ruleset you are guessing about.

What it enforces on the default branch:

- Changes must arrive through a pull request (`required_approving_review_count`
  is `0`, so a solo maintainer can still merge their own PR — the rule being
  enforced is "not a direct push", not "someone else must approve")
- The `checks` job in `.github/workflows/ci.yml` must pass
- No force pushes, no branch deletion

**`bypass_actors` is deliberately empty.** An admin bypass would let anything
authenticated as an admin — including an AI agent using an admin's
credentials — push straight to the default branch, which is the exact path
this ruleset exists to close. Leave it empty; if an emergency direct push is
ever genuinely needed, disable the ruleset deliberately and re-enable it
afterwards, so the exception is visible rather than permanent.

**Availability:** repository rules are free on public repositories on any
plan. On a private repository they require GitHub Pro, Team, or Enterprise —
on GitHub Free a private repo cannot enforce this at all, and the branch-and-PR
discipline reverts to being an instruction in `AGENTS.md` that an agent
follows because it is told to. See each runbook's branch-protection section in
`docs/platforms/` for how to be straight with a client about which posture
their plan actually buys them.
