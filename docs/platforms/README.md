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
- [`codex.md`](./codex.md)
- [`v0.md`](./v0.md)
- [`cursor.md`](./cursor.md)

Every platform-behavior claim in these five files traces to
[`docs/research/agent-platform-surfaces.md`](../research/agent-platform-surfaces.md)
or to a primary source verified while writing them. If a platform's
documented behavior changes, that research file — and these runbooks — need
a re-check, not a guess.

## Which platform for which client

The four supported platforms are not interchangeable, and the difference
that matters most to a non-technical client is whether they can *see* their
own change. Verified 2026-08-20 against each platform's docs and by running
a real content change through each:

| Platform | Reads the rulebook | Shows the client the rendered site | Opens the PR |
|---|---|---|---|
| **v0** | `AGENTS.md` + `.agents/skills/` | **Yes** — preview pane in-chat | Itself |
| **Replit** | `replit.md` | **Yes** — preview pane in-workspace | No; on GitHub |
| **Claude Code** | `CLAUDE.md` (imports `AGENTS.md`) | No — diff only | Button in the UI |
| **Codex** | `AGENTS.md` | No — diff only | Button in the UI |

Both preview panes are a property of the *cloud* product. Claude Code and
Codex both have one in their **desktop apps**, which need a local install and
a checkout — the developer setup this template exists to spare the client.

The practical rule: **a client who needs to see the site wants v0 or
Replit.** On Claude Code or Codex their only view of a change is the hosting
preview URL, which makes the section below load-bearing rather than a
nice-to-have. Pick the platform for whoever is actually driving.

## Preview access: the step that is easy to forget

Every runbook here assumes the same review loop — the agent opens a pull
request, and the client looks at the preview deployment before anyone merges.
That loop silently breaks if the client cannot open the preview URL, and by
default they cannot.

Vercel ships **deployment protection on**: with `ssoProtection` set to
`all_except_custom_domains`, every preview URL returns a login redirect that
only members of the Vercel team can pass. The developer sees the preview
fine, the client sees a sign-in wall, and the review step quietly reverts to
"the developer checks it" — which is the bottleneck this whole template
exists to remove.

Decide it deliberately, per project:

| Posture | What it costs | When it fits |
|---|---|---|
| Client gets a seat on the Vercel project | A paid Vercel plan and a seat per client (**Hobby supports no team members at all**) | Real client work, where previews genuinely shouldn't be public |
| Protection-bypass link | Nothing, but the client must use a URL with a token appended | A client who won't complete a Vercel signup |
| Previews public | Nothing; anyone with the link can read them | Demo sites, and any project whose content is already public |

Check it before handover rather than discovering it on the first real
change: open a preview URL in a private browser window. If it redirects to a
login, the client's review step does not work yet.

## Supported vs. not

Five platforms have a runbook because all five can import an *existing*
repository and land changes as a reviewable branch — the two properties
this template's review-before-publish premise depends on. Three more were
considered and are deliberately out of scope:

Codex is the odd one out among the four: it reads `AGENTS.md` natively, so
`harness-gen` emits nothing for it and `"codex"` is deliberately absent from
`harness.config.json`'s `platforms` array (that array drives the generator,
and every entry must match an adapter). Its runbook is entirely about the
environment configuration that lives in the Codex cloud UI rather than in
the repo — including two behaviours that will cost an afternoon each if met
by surprise: agent-phase internet is off by default, and secrets are stripped
before the agent runs, which silently breaks the capability probes.

| Platform | Status | Why |
|---|---|---|
| **Lovable** | Not supported, ever | Lovable **cannot import an existing repository at all** — connecting always creates a brand-new GitHub repo from a Lovable project; it only exports, never imports. There is no way to point it at a client's existing clone of this template, so "connect a finished client site" is impossible on Lovable regardless of configuration. |
| **Bolt.new** | Not supported, ever | Bolt *can* import an existing repo, but it then **auto-commits every non-breaking change straight to the connected branch** (polling GitHub every 30s) with **no in-app merge and no documented PR-creation flow** — the opposite of "land as a branch and a PR for review." A safe posture would require a human to pre-create a dedicated branch, manually switch Bolt onto it, and open every PR by hand on GitHub outside Bolt entirely, which is enough process overhead that it stops being a real integration. |

See `docs/research/agent-platform-surfaces.md` §5 for the primary-source
detail behind both of these.
