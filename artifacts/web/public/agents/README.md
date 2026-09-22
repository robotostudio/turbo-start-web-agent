# Agent marks

The three marks shown beside "Edit with agents" in the Hero, lifted from the
2026-09 Paper comp rather than redrawn, so they match the design exactly.

They are flat `#666666` rather than `currentColor`: an SVG loaded by URL is an
isolated document and cannot read this page's custom properties, the same
constraint `src/components/texture/grid-field.tsx` documents for the texture.

Which agents appear is content, not code — the `agents` array in
`content/pages/home.mdx` names them, so adding or swapping one is an MDX edit.
