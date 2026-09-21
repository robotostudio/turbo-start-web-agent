# texture/

The procedural grid field from the redesign, drawn rather than shipped as a
bitmap.

## Where it came from

`wave-field.ts`, `grid-geometry.ts`, `fit-lattice.ts`, `grid-render.ts` and
`field-modes.ts` are vendored from **github.com/jenilroboto/harbour**, the
Toolcraft app the texture was designed in. Each carries a header saying whether
it is unmodified; only `field-modes.ts` is trimmed, to the one mode this site
uses.

**Do not refactor the vendored files.** Their value over a rewrite is that they
still diff cleanly against upstream. A tidied copy is one nobody can compare when
the algorithm changes there.

`grid-svg.ts` and `presets.ts` are ours. Upstream only paints to canvas, so the
SVG renderer has no counterpart there; it mirrors `grid-render.ts`'s bucketing so
the two produce the same picture from the same seed.

## Why a copy and not a dependency

The source repo is private. This one is public, so a dependency on it would fail
every adopter's install. Vendoring is the only option that leaves the template
working for someone who clones it.

## Licence

Upstream is MIT. Its terms require the notice travel with any substantial portion
copied, which is what the file headers and this section are for.

```
MIT License

Copyright (c) 2026 Pixel Point

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Upstream's `NOTICE.md` also records that product-specific application code its
author created remains theirs. Both positions are compatible with this repo's
MIT.

## Colour

Upstream ships `#E8E8E8` on `#050505` as literal hex. Nothing here does: a raw
hex in a component breaks the rule that makes a retheme one file (AGENTS.md rule
3). The cell colour is read from a design token at the call site instead.
