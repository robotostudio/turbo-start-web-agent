---
name: compose-page
description: Use when authoring or editing a marketing page or blog post in this repo — locating the right MDX file under artifacts/web/content/, choosing Blocks from the catalog, writing frontmatter, composing Blocks with literal props, and validating before viewing. Use whenever asked to add a page, edit copy, add or rearrange a section, or change what a page contains.
---

# Compose a page

Content in this repo is MDX that compiles to a static React tree — never
executable code. You are composing pre-built **Blocks**, not writing
components. Every rule below is enforced at build time by a remark plugin
(`artifacts/web/src/lib/content/remark-content-lockdown.ts`); breaking one
fails `pnpm content:check` with a message naming the exact rule and the file
position. That failing build is your feedback channel — read the message, it
tells you what to do instead.

## 1. Locate the file

- Site pages: `artifacts/web/content/pages/*.mdx` (e.g. `home.mdx`,
  `about.mdx`, `privacy.mdx`, `terms.mdx`, `style-guide.mdx`,
  `blocks-gallery.mdx`). A new page is a new file here.
- Blog posts: `artifacts/web/content/blog/*.mdx` (e.g.
  `introducing-harbour.mdx`, `composing-pages.mdx`).
- The header nav and footer are **not** a page — they're YAML at
  `artifacts/web/content/settings/navigation.yml` and
  `artifacts/web/content/settings/footer.yml`, not covered by this skill.
- The URL slug is derived automatically from the file path (`pages/about.mdx`
  → `/about`) — there is no `slug` frontmatter field to set.

## 2. Choose Blocks

Read `artifacts/web/src/lib/blocks/catalog.json` — a generated, machine-readable
reference (`pnpm catalog` regenerates it; do not hand-edit it). Its shape:

```json
{
  "blockCount": 14,
  "blocks": {
    "Hero": { "schema": { "properties": { "...": "..." }, "required": ["title"], "description": "..." } }
  }
}
```

Each key is a Block's exact tag name (PascalCase) and its JSON Schema —
`properties` are the props you may pass, `required` are the ones you must,
and nested `description` fields on URL-shaped props spell out the allowed
scheme. Today's 14 Blocks: `Banner`, `Hero`, `CTA`, `FeatureGrid`,
`FeatureSplit`, `ImageCards`, `Gallery`, `Faq`, `Testimonial`, `LogoCloud`,
`Team`, `Stats`, `Newsletter`, `Pricing`. For a worked example of every Block
with real props, read `artifacts/web/content/pages/blocks-gallery.mdx` or
`home.mdx` — both are live composed pages, not documentation. If the Block you
need doesn't exist, that's a code change (new schema + component), not a
content edit — see the README's "Adding a Block" section — and is out of
scope for this skill.

## 3. Write frontmatter

Every page needs:

```yaml
---
title: My Page Title       # string, max 200 chars
description: One line.     # string, max 300 chars
draft: true                # new pages start true; omit for existing pages you're editing
---
```

`draft` defaults to `false` and excludes an entry from production builds and
the sitemap (still visible on preview deployments) — always start a **new**
page with `draft: true` and flip it once the client approves. `noindex: true`
(default `false`) publishes a page but keeps it out of the sitemap and asks
search engines not to index it — used on `blocks-gallery.mdx` today. Blog
posts additionally require `pubDate` (ISO date, e.g. `2026-08-17`) and
`category` (string), with optional `excerpt` (max 300 chars) and `cover` (must
be a full `https://*.public.blob.vercel-storage.com/...` URL).

## 4. Compose Blocks with literal props

```mdx
<Hero
  variant="centered"
  title="Your website, editable by any AI agent"
  primary={{ label: "Read the docs", href: "/about" }}
/>
```

Hard constraints — breaking any of these fails `content:check` with the
lockdown's own hint: *"Content MDX is compose-only: assemble Blocks from
src/lib/blocks/schemas.ts and pass props as literal values. See README.md."*

- No `import` or `export` statements — Blocks are already in scope.
- No raw HTML elements (`<div>`, `<a>`, …) — only capitalised Block tag names.
  No hyphenated, namespaced (`:`), or dotted (`.`) tag names either.
- Props are literal values only: strings, numbers, booleans, and arrays/objects
  written as expression attributes — `primary={{ label: "…", href: "/…" }}`,
  never a quoted JSON string. No function calls, member access, bare
  identifiers, spreads (`{...x}`), or operators beyond unary `+ - !`.
- No prop name may start with `on` (treated as an event handler by name alone,
  regardless of what it holds) — rename it, e.g. `onboardingSteps` → `steps`.
- No `dangerouslySetInnerHTML` or `srcDoc` props.
- Any prop named `href`, `src`, `action`, `formAction`, `poster`, `url`, `to`,
  `cite`, `ping`, `srcSet`, or ending in `url`/`href`/`src` is treated as a
  URL: it must be a plain literal string (no interpolation) starting with
  `/`, `#`, `?`, `.`, or an `http(s)`/`mailto`/`tel` scheme —
  `javascript:`, `data:`, and protocol-relative `//host` are all rejected.

## 5. Validate, then view

```sh
pnpm content:check   # velite --strict — frontmatter schema + the lockdown above
pnpm build            # also catches bad Block *props* (Zod schema mismatches, not just syntax)
```

If `content:check` passes, the MDX itself is legal; `pnpm build` renders every
page and is what catches, e.g., a required prop you forgot. Then view the
page: `pnpm dev` serves at `http://localhost:3000` by default (respects
`$PORT`) — check whether a dev server is already running in this workspace
before starting a second one. A green build is necessary but not sufficient:
click through the actual page before calling the change done.
