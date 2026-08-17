# Plan 2 (Block system) — primary-source API verification

Pre-execution verification of `docs/superpowers/plans/2026-08-17-block-system.md` against the versions actually pinned in `artifacts/web/package.json` and the real installed packages (`node_modules`), plus official docs/source where the plan touches build-time behavior not visible in a `.d.ts` file. All claims below trace to node_modules file paths (with line numbers) or empirical output from actually running the installed compiler/library, not memory. Empirical checks were done by writing throwaway scripts and deleting them afterward — no repo files were modified.

Installed versions confirmed from `artifacts/web/package.json` / `node_modules`: `next@16.2.7`, `react@19.2.4`, `zod@4.4.3`, `velite@0.3.1`, `tailwindcss@4.3.3` (`@tailwindcss/postcss@4.3.3`), `@biomejs/biome@2.5.5`. `geist` is **not yet installed** — Task 1 adds it; verified instead against the actual npm tarball for the latest published version (`geist@1.7.2`).

---

## 1. `geist` package

Source: `geist@1.7.2` tarball downloaded directly from `https://registry.npmjs.org/geist/-/geist-1.7.2.tgz` and inspected (no intermediary).

- **Install name**: `geist` (`package.json` `"name": "geist"`). Confirmed.
- **Imports**: `package.json` `exports` map defines `"./font/sans"` → `dist/sans.js` and `"./font/mono"` → `dist/mono.js`. So `import { GeistSans } from "geist/font/sans"` and `import { GeistMono } from "geist/font/mono"` are exactly right.
- **`dist/sans.js`** (verbatim):
  ```js
  import localFont from "next/font/local";
  export const GeistSans = localFont({
    src: "./fonts/geist-sans/Geist-Variable.woff2",
    variable: "--font-geist-sans",
    weight: "100 900",
  });
  ```
- **`dist/mono.js`** (verbatim):
  ```js
  import localFont from "next/font/local";
  export const GeistMono = localFont({
    src: "./fonts/geist-mono/GeistMono-Variable.woff2",
    variable: "--font-geist-mono",
    ...
    weight: "100 900",
  });
  ```
  **CSS variable names are exactly `--font-geist-sans` and `--font-geist-mono`.** The plan's assumption is correct, verified at the source, not just via README.
- **`.variable` exists**: `font.d.ts` types both as `NextFontWithVariable` (from `next/dist/compiled/@next/font`), which is the same return shape `next/font/google`/`next/font/local` always produce — `.variable` and `.className` both present. Confirmed.
- **Self-hosted, no network at build**: both `sans.js`/`mono.js` use `next/font/local` (not `next/font/google`) pointing at `.woff2` files that ship physically inside the npm package (`dist/fonts/geist-sans/Geist-Variable.woff2`, `dist/fonts/geist-mono/...`). No fetch to Google or any remote host occurs — the font binaries live inside `node_modules/geist`, not the repo, so the plan's "no binary assets in the repo" claim holds (the binaries are a dependency's problem, never committed).
- **Next.js 16 compatibility**: `package.json` declares `"peerDependencies": { "next": ">=13.2.0" }` — satisfied by installed `next@16.2.7`.
- Plan's Step 3 (`globals.css`) is **verified exactly correct**: `--font-sans: var(--font-geist-sans), ...` and `--font-mono: var(--font-geist-mono), ...` are the right variable names.

## 2. Tailwind CSS 4 `@theme`

Source: official docs (`https://tailwindcss.com/docs/theme`, fetched directly) **plus an empirical compile** using the actually-installed `@tailwindcss/postcss@4.3.3` (found at `node_modules/.pnpm/@tailwindcss+postcss@4.3.3/node_modules/@tailwindcss/postcss`).

- Tailwind's own docs state a real gotcha: a plain `@theme { --font-sans: var(--font-inter, sans-serif); }` can resolve to the fallback instead of the referenced variable, "because of how variables are resolved in CSS," and recommend `@theme inline` "when defining theme variables that reference other variables." This is a real documented subtlety, and I initially treated it as a likely bug in the plan.
- **I compiled the plan's exact CSS through the real Tailwind 4.3.3 engine** (via `postcss([tailwindPostcss()]).process(...)`, input `@theme { --font-sans: var(--font-geist-sans), ui-sans-serif, ...; --font-mono: var(--font-geist-mono), ...; }`, with an HTML fixture using `class="font-sans font-mono text-brand"` so the utilities actually get generated). Output:
  ```css
  :root, :host {
    --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
    --font-mono: var(--font-geist-mono), ui-monospace, monospace;
  }
  ...
  .font-mono { font-family: var(--font-mono); }
  .font-sans { font-family: var(--font-sans); }
  .text-brand { color: var(--color-brand); }
  ```
  Tailwind does **not** inline the resolved literal value into the utility — it keeps `var(--font-sans)`, a live reference. This chains correctly at runtime because in the plan's actual topology, both `--font-sans` (Tailwind's `:root` declaration) and `--font-geist-sans` (set by `next/font`'s `className` on `<html>`, per Step 2) are declared **on the same element** (`<html>` *is* `:root` in an HTML document). CSS custom-property substitution for `var()` resolves lazily at the point of use, walking the cascade up from the consuming element — since both variables live at that one root element, there's no nesting/ordering problem. The gotcha Tailwind's docs describe only bites when the referenced variable is set on a *descendant* (e.g., set via inline style deeper in the tree) that hasn't been reached yet when the ancestor's theme variable is defined — not this case.
  - **Verdict: the plan's plain `@theme` (not `@theme inline`) is correct here and empirically verified working**, but this is exactly the kind of thing that looks wrong at a glance — worth a one-line comment in `globals.css` explaining why plain `@theme` is safe (both variables share the `<html>`/`:root` scope), so a future editor doesn't "fix" it into `@theme inline` (which — per Tailwind's own docs — inlines the *resolved value*, and would actually be **worse** here since `next/font`'s variable value isn't known until runtime/hydration in the way `@theme inline` assumes for static tokens... though in practice `@theme inline` also just substitutes the reference, so this is a nice-to-have doc comment, not a blocking correction).
- `--color-*` → `bg-*`/`text-*`/`border-*` mapping: confirmed in the same compiled output (`--color-brand` → `.text-brand { color: var(--color-brand); }`). This matches the project's existing, already-working `globals.css` pattern.

## 3. Zod 4 `z.toJSONSchema`

Source: `node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.d.ts` and `to-json-schema.d.ts`, **plus an empirical run** of the installed `zod@4.4.3` against a schema shaped like the plan's Blocks (`title`, `subtitle.optional()`, `variant: z.enum([...]).default(...)`, `href` with `.refine(...)`).

- `export declare function toJSONSchema<T extends schemas.$ZodType>(schema: T, params?: ToJSONSchemaParams): ZodStandardJSONSchemaPayload<T>;` — exists, and `z.toJSONSchema(schema, { io: "input" })` is valid usage. `io?: "input" | "output"` (default `"output"`) is documented in `to-json-schema.d.ts`: `"input"` — "Convert the input schema," `"output"` (default) — "Convert the output schema." **`io: "input"` is the correct option name and correct choice** for describing what an author writes.
- Empirical output confirms the plan's exact claim: with `io: "input"`, a prop with `.default("a")` is **excluded** from `required` (author may omit it); with `io: "output"` (default), the same prop **is** in `required` (because the default always fills it in). Both runs also correctly surfaced `"enum": ["a","b","c"]` and `"default": "a"` on the variant field. **Confirmed exactly as the plan describes.**
- **`.refine()` predicates are silently and completely dropped from the JSON Schema output.** In the empirical test, `href: z.string().refine((v) => v.startsWith("http"), "must be http")` produced `"href": { "type": "string" }` in both `io: "input"` and `io: "output"` output — no `description`, no pattern, no trace of the refinement or its message anywhere in the JSON Schema. **This confirms the plan's own stated risk is real**: the URL-safety constraint on `link.href` (Task 2) and on `media.src`/`newsletter.action`/`imageCards.href` (Tasks 5–8) will vanish from `catalog.json`, and an authoring agent reading only the catalog will have no way to know those props are constrained beyond "type: string." **The plan does not currently include a mitigation for this** (see Corrections below).
- The generic-instantiation idiom in the plan's generator script — `type JsonSchema = ReturnType<typeof z.toJSONSchema<z.ZodType>>;` — was typechecked directly with the project's own `tsc` against the installed `zod@4.4.3` types and **compiles cleanly** (exit 0, `--strict`).
- `import { z } from "zod"` resolves to `./index.js` per `zod`'s own `package.json` `exports["."]`, which is the v4 classic API — `z.toJSONSchema` is available on it directly (confirmed by the successful empirical run above, no `zod/v4` subpath import needed).

## 4. Velite

Source: `node_modules/.pnpm/velite@0.3.1/node_modules/velite/dist/index.d.ts` and `dist/chunk-4HFW4XPZ.js` (Velite's bundled implementation — it vendors its own fork of Zod's engine, distinct from the project's `zod` dependency, under `src/schemas/zod/*`, but exposes the same `s.*`/`.refine()` API surface).

- **Singleton collections**: `dist/index.d.ts` line ~5078, `Collection` interface: `single?: boolean` — "Whether the schema is single, @default false." `CollectionType` conditionally types the collection's exported type as `T['schema']['_output']` (a single object) when `single extends true`, vs `Array<...>` otherwise. **`single: true` is exactly the right option**, confirmed at the type-definition source.
- **`.yml`/`.yaml` pattern support and loader routing**: `dist/chunk-4HFW4XPZ.js` (~line 37827) shows Velite's built-in loader list: `loaders = [json_default, yaml_default, matter_default]`, where `yaml_default` has `test: /\.(yaml|yml)$/` and simply does `data: yaml.parse(file.toString())` — **no separate `content` field, no MDX/markdown compile step at all**. Loader selection (`dist/chunk-4HFW4XPZ.js` ~line 33317) is `config.loaders.find(loader => loader.test.test(path))`, so a `pattern: "settings/navigation.yml"` collection is routed to the plain YAML loader.
- **Does YAML content pass through `remarkPlugins`? NO — confirmed structurally, not just asserted.** `remarkPlugins`/`mdx.remarkPlugins` only run as part of Velite's markdown/MDX compilation pipeline, which is triggered by a collection schema using `s.mdx()` or `s.md()` (as `pages`/`blog` do via `code: s.mdx()`). The `yaml` loader (used for `.yml`/`.yaml` files) never invokes that pipeline — it returns parsed plain data with no markdown `content`/`code` field to compile. Since the plan's `navigation`/`footer` schemas (per Task 9's shape: `{ items: [...] }`, `{ columns: [...], legal: [...], note? }`) have no `s.mdx()`/`s.md()` field, there is nothing for `remarkContentLockdown` to ever run against. **The plan's security claim for Task 9 is verified true**, and specifically true *because* the schema author doesn't declare a markdown field — not an inherent property of `.yml` files as a format (a hypothetical `s.md()` field inside a YAML-loaded collection, if one existed, would still compile through remark; the plan doesn't do this, so it's moot, but worth knowing why it's safe).
- **`.refine()` inside `s.object()`**: `dist/chunk-4HFW4XPZ.js` line 34071, `refine(check, message) { ... }` is defined on Velite's base schema class (the vendored Zod-fork `ZodType` equivalent), inherited by `objectType`/`stringType`/etc. exported as `s.object`, `s.string`, etc. **Confirmed available and usable exactly as the plan assumes.**
- `s.*` helpers referenced (`s.object`, `s.string`, `s.array`, `s.boolean`, `s.isodate`, `s.mdx`) are all already in active use in the existing `velite.config.ts` (read directly) — not a new assumption, already proven working in this repo.

## 5. Next.js 16 specifics

Source: `node_modules/.pnpm/next@16.2.7_.../node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts`, `is-metadata-route.js`, and the existing (already-building) `src/app/[...slug]/page.tsx` and `src/app/sitemap.ts` in this repo.

- **`MetadataRoute.Sitemap` shape**: `type SitemapFile = Array<{ url: string; lastModified?...; changeFrequency?...; priority?...; alternates?...; images?...; videos?... }>` — only `url` is required, everything else optional. **`url` alone is valid.** Confirmed at the type source. The existing `sitemap.ts` (read directly) already does exactly this (`{ url: ... }` with no other fields), so Task 10's "restore the blog block" extension is a proven-safe pattern in this exact codebase.
- **`generateStaticParams` + async `params`**: the existing `[...slug]/page.tsx` (read directly, already building per the plan's "105 tests pass" predecessor state) already uses `generateStaticParams(): Params[]` and destructures `params: Promise<Params>` with `await params` in both `generateMetadata` and the page component. Task 10's blog route mirrors this exactly — **verified as an already-working pattern in this repo**, not a new assumption.
- **`<form method="post" action="...">` without `"use client"`**: this is a plain native HTML `<form>` element (lowercase, not Next's `next/form` `<Form>` component), with a literal string `action` and no event handlers. React Server Components can emit arbitrary static HTML; `"use client"` is only required for hooks or event-handler wiring, neither of which is present. **No primary-source contradiction found** — this is standard RSC behavior, not a Next-specific API needing separate verification. (Note: don't confuse this with `next/form`'s `<Form action="string">`, which — per Next's docs — behaves as a client-side-enhanced GET-with-query-params flow; the plan correctly uses the plain `<form>` tag, not `next/form`.)
- **Favicon**: `is-metadata-route.js`'s `STATIC_METADATA_IMAGES` confirms both conventions exist: `icon: { filename: 'icon', extensions: ['ico','jpg','jpeg','png','svg'] }` and `favicon: { filename: 'favicon', extensions: ['ico'] }`. **Both `src/app/icon.svg` and `src/app/favicon.ico` are valid Next.js file-convention routes.** However: `favicon.ico` is necessarily a **binary** file, which directly conflicts with the plan's own Global Constraint "No binary assets. ... No binary assets are committed" (completion criteria also restates "no binaries committed"). `icon.svg` is text (XML) and is the only option consistent with the plan's own rules. Task 11 Step 3 currently offers this as an either/or ("add a `favicon.ico` route or a `src/app/icon.svg`") — see Corrections.

## 6. Cross-checks against installed reality / internal consistency

- `artifacts/web/src/lib/content/remark-content-lockdown.ts` (read directly): `isSafeUrl` exists exactly as the plan describes — `const isSafeUrl = (value: string): boolean => { ... }` at line 125, currently unexported, used internally at lines 216 and 454. Task 2's Step 3 ("add the `export` keyword... change nothing else") is accurate to the real file.
- `artifacts/web/src/lib/blocks/schemas.ts` (read directly): current `link` schema, `blockSchemas` registry, and `parseBlock` all match what Task 2/3's diffs assume as the starting state.
- Zod version pinned in `package.json` is `^4.4.3`; installed resolves to exactly `4.4.3`. No drift.

---

## Corrections required to the plan

1. **Task 3, generator script — `.refine()` constraints silently vanish from the catalog (confirmed, not hypothetical).** Empirically verified: `z.toJSONSchema` drops `.refine()` predicates and their messages entirely, in both `io: "input"` and `io: "output"` modes. As written, `catalog.json` will describe every `href`/`src`/`action` prop as plain `"type": "string"` with no indication of the URL-safety constraint from Task 2 and Tasks 5–8's `media`/`imageCards`/`newsletter` schemas. **Fix**: add a `.describe("Must be an http(s), mailto, tel, or relative URL")` (Zod's `.describe()` **does** survive `toJSONSchema` conversion into the `description` field — this is the standard Zod4 JSON Schema pathway for exactly this problem) alongside each `.refine(isSafeUrl, ...)` call in `schemas.ts`, or otherwise document in Task 3 that refine-based constraints are catalog-invisible and must be paired with `.describe()`. This should be called out explicitly as a required step in Task 3 or in the "Shared sub-schemas" block before Task 5, not left implicit.

2. **Task 11, Step 3 — the `favicon.ico` option contradicts the plan's own "no binary assets" constraint.** `.ico` is a binary format; the plan's Global Constraints section says "No binary assets" and the Plan 2 completion criteria repeats "no binaries committed." Task 11 Step 3 should be changed to **only** say "add `src/app/icon.svg`" and drop the `favicon.ico` alternative, since choosing it would violate a rule stated earlier in the same document.

3. **`globals.css` Step 3 — add a one-line comment explaining why plain `@theme` (not `@theme inline`) is safe.** Verified empirically correct as written (see §2 above), but it runs directly against Tailwind's own documented general-case warning about `var()` references inside `@theme`, so a future maintainer is likely to "fix" it. Not a functional correction, but worth a comment noting that `--font-geist-sans`/`--font-geist-mono` and `--font-sans`/`--font-mono` are both declared at the same `<html>`/`:root` scope, which is why the inlining pitfall doesn't apply here. This is a documentation nit, not a blocking correction.

No other plan assumptions were found to be wrong. Everything else checked in areas 1–5 above (Geist package/exports/variable names, Tailwind color-token mapping, Zod `io: "input"`/enum/default surfacing, Velite `single: true`/YAML-loader/`.refine()`, Next.js `MetadataRoute.Sitemap`/`generateStaticParams`/async `params`/plain `<form>`) matches the plan's text exactly against the installed package versions.
