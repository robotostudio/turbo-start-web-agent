# Agent marks

The marks shown beside "Edit with agents" in the Hero. Claude and OpenAI are
lifted from the 2026-09 Paper comp; v0 is its official artwork, recoloured to match.

They are flat `#666666` rather than `currentColor`: an SVG loaded by URL is an
isolated document and cannot read this page's custom properties, the same
constraint `src/components/texture/grid-field.tsx` documents for the texture.

Which agents appear is content, not code — the `agents` array in
`content/pages/home.mdx` names them, so adding or swapping one is an MDX edit.
