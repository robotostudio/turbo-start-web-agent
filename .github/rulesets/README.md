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

**`pr-hygiene` is deliberately not required.** It runs on every pull request
and reports, but a finding does not block the merge. That is a real gap —
a body mangled into literal `\n` escapes, or a commit whose trailers were
joined with one so every trailer after the first was lost, can merge with a
red mark beside an active merge button — and it is a gap accepted on purpose.
Its commit-trailer findings live in the commit message, so clearing one needs
`git commit --amend` and a force-push, which not every platform's agent can
do from inside a session. Requiring it would stall a client's pull request on
a defect the client cannot clear. Read the check, act on it, and get the
trailers right at commit time; do not let GitHub hold the merge hostage to it.

**Keeping this file and GitHub in step.** `main.json` is the source; GitHub is
where it takes effect, and the two are separate lists that can drift. Applying
an edit needs **admin** on the repository (`maintain` is not enough — the API
answers `404`, not `403`, so a permission problem reads as a missing ruleset):

```sh
gh api repos/<owner>/<repo>/rulesets                       # find the id
gh api --method PUT repos/<owner>/<repo>/rulesets/<id> \
  --input .github/rulesets/main.json                        # apply it
```

Or **Settings → Rules → Rulesets → main-protection** in the UI. After
applying, re-export and diff against this file so the export stays the
record of what is enforced.

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
