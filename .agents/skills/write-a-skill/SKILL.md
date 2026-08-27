---
name: write-a-skill
description: Use when asked to remember a rule, save a convention, "make a skill" of something, or write down how this project does a thing — and when you notice yourself being corrected the same way twice. Writes the rule into this repository so every agent on every platform inherits it, instead of into the platform's own memory where only one person gets it.
---

# Write it into the repo, not into your memory

Agent platforms offer somewhere private to keep a rule: v0 saves skills to a
personal or team workspace, other tools have memory files or account-level
custom instructions. Those are the wrong place for anything about *this
project*.

A rule kept in one platform's memory belongs to one person on one platform.
The next teammate does not have it. A client editing through their own account
does not have it. Codex and Claude Code never see it. Someone who clones this
template gets none of it. Six months on, the site's copy is consistent only in
the pull requests of whoever happened to save the rule.

A rule kept in `.agents/skills/` ships with the repository. Every agent that
works here reads it, it survives the person who wrote it, and changing it is a
pull request someone can review and argue with.

## Which one is this?

Ask what the rule is *about*, not who asked for it.

**The repo** — anything about this site, its content, its conventions, its
tooling: copy style, tone of voice, naming, which Block to reach for, a
deployment quirk, a mistake worth not repeating. If a different agent doing
the same task should follow it, it goes here.

**Your platform's memory** — how one person likes to be talked to, their
shortcuts, their preferences across every project they touch. If it would make
no sense to someone else working on this repo, it does not belong in it.

When it is genuinely both, write the project half here and keep the personal
half wherever you keep it.

## Writing one

1. **Check it does not exist.** Read the `description` line of every
   `.agents/skills/*/SKILL.md`. Extending an existing skill beats a second one
   that overlaps it — two skills covering the same ground means agents follow
   whichever they happen to load.

2. **Create `.agents/skills/<kebab-case-name>/SKILL.md`.** The directory name
   is kebab-case; the file is `SKILL.md`, capitalised exactly that way. One
   skill per directory.

3. **Open with frontmatter, as the literal first bytes of the file.** No
   comment, no blank line, no generated-file header above it — the
   agentskills.io spec parses the opening `---` and both Claude Code and
   Replit fail on anything before it:

   ```markdown
   ---
   name: <same as the directory name>
   description: Use when <the situations that should trigger this>. Use whenever <the phrasings someone would actually type>.
   ---
   ```

   **The description is the only part always loaded.** Every other line is
   read on demand, after something matches. So write it as trigger conditions
   in the words a person would use, not as a summary of the contents. "Use
   when writing or editing copy for this site" finds the skill; "Copy
   guidelines" does not.

4. **Write the rule, and the reason for it.** A rule with its reasoning
   attached survives contact with a case its author did not foresee; a bare
   instruction gets followed literally into absurdity or dropped as arbitrary.
   Where a real incident produced the rule, name it and date it — the war
   story is what makes it stick.

5. **Run `pnpm harness`.** This is not optional and nothing will remind you.
   `.agents/skills/` is mirrored into `.claude/skills/` by the harness
   generator, because Claude Code cloud sessions read `.claude/` and never
   look at `.agents/`. A new skill that skips this step is invisible to Claude
   Code, and `pnpm run checks` fails on the drift — `harness:check` compares
   byte for byte.

6. **Add a row to the skills table in `AGENTS.md` §2**, and correct the count
   in the sentence above it. Nothing enforces this, and skipping it is the
   quietest way to write a skill nobody reads: Codex, Cursor, Copilot and most
   of the ecosystem load `AGENTS.md` and never look at `.agents/skills/` at
   all, so that row is the only pointer they get. This step was missing from
   this skill until 2026-08-27, when a skill written by following it landed
   invisible to Codex and left the count saying six.

   Describe *when to reach for it*, in the same voice as the rows already
   there — the table is read by someone deciding which file to open.

7. **Run `pnpm run checks`, then deliver it** the way `sync-changes`
   describes: a branch and a pull request, never a push to the live branch.
   The rule lands for everyone when it merges.

## Keep it short

A skill is read by an agent mid-task with a job already in hand. Every
paragraph competes with the work. Cut anything that is background rather than
instruction, and anything the reader could work out from the repo itself.

If a skill grows past a page or two, it is usually two skills, or one skill
with reference material that belongs in a sibling file the skill points to.

## Skills from elsewhere

This is for skills you write. A skill from a URL, a package, or another repo
is a different decision entirely — it is instructions an agent will follow,
which makes installing one a trust call rather than a copy-paste. See
`find-skills` before adding any of those.
