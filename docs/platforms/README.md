# Platform runbooks

Procedures for connecting a client's clone of this template to an agent
platform — one runbook per platform, written for whoever at the agency does
the connecting (not the client, not a developer reading source). Each
covers: scoping the connection to a single repository, using a push
identity with write-only access, keeping the platform's own automatic
behavior off, disabling platform-side rules or skills that would fight this
template's conventions, the branch-protection reality on the client's plan,
and a smoke test.

- [`replit.md`](./replit.md)
- [`claude-code.md`](./claude-code.md)
- [`cursor.md`](./cursor.md)

Every platform-behavior claim in these three files traces to
[`docs/research/agent-platform-surfaces.md`](../research/agent-platform-surfaces.md)
or to a primary source verified while writing them. If a platform's
documented behavior changes, that research file — and these runbooks — need
a re-check, not a guess.

## Supported vs. not

Three platforms have a runbook because all three can import an *existing*
repository and land changes as a reviewable branch — the two properties
this template's review-before-publish premise depends on. Three more were
considered and are deliberately out of scope:

| Platform | Status | Why |
|---|---|---|
| **Lovable** | Not supported, ever | Lovable **cannot import an existing repository at all** — connecting always creates a brand-new GitHub repo from a Lovable project; it only exports, never imports. There is no way to point it at a client's existing clone of this template, so "connect a finished client site" is impossible on Lovable regardless of configuration. |
| **Bolt.new** | Not supported, ever | Bolt *can* import an existing repo, but it then **auto-commits every non-breaking change straight to the connected branch** (polling GitHub every 30s) with **no in-app merge and no documented PR-creation flow** — the opposite of "land as a branch and a PR for review." A safe posture would require a human to pre-create a dedicated branch, manually switch Bolt onto it, and open every PR by hand on GitHub outside Bolt entirely, which is enough process overhead that it stops being a real integration. |
| **v0** | Deferred, not this milestone | v0 has the **strongest git model of the consumer platforms**: it imports existing repos (including selecting a working directory in a monorepo), auto-creates a protected-base `v0/*` working branch per chat, and **opens pull requests directly**. What it lacks is any in-repo instruction surface at all — no `AGENTS.md` support, no repo-committed config; its "Instructions" are account-level saved prompts applied per-chat from the v0 UI. That makes a v0 runbook pure account-configuration instructions with nothing for `harness-gen` to generate — worth doing, but a later milestone, not this one. |

See `docs/research/agent-platform-surfaces.md` §5 for the primary-source
detail behind each of these three.
