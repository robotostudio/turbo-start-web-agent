import { footer } from "#velite";
import { SiteLink } from "@/components/site/site-link";
import { CornerTick, EdgeScrims, SiteMark } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";

// Direction: Ledger — the columns sit in a bordered grid rather than floating
// in whitespace, with a rule above and below, a divider before each column, and
// a crosshair on each corner. The same ledger treatment the logo row and the
// stats band use, so the page closes the way it opened.
//
// Measured from the design rather than approximated: the row carries a 1px rule
// top and bottom, each cell a 1px rule on its left, cells are 34px block and
// 24px inline, and the brand cell is a fixed 380px against four equal columns.
//
// Server component. The wordmark, columns, status pills, links, attribution and
// notes all come from the `footer` singleton (content/settings/footer.yml),
// validated at build time by velite.config.ts — every href through the same
// isSafeUrl refine Block links use, since YAML never passes through the MDX
// content-lockdown remark plugin. What stays in the component: the mark itself
// (see site-mark.tsx for why the name is not in it) and the "© {year} {brand}"
// assembly, where the year is computed at build and never authored.
//
// No social icons here. The design moved them out of the footer and into the
// header, where they are driven by navigation.yml.

const CELL = "flex flex-col gap-4 border-l border-border px-6 py-[34px]";

export function SiteFooter() {
  // Static generation only — computed once per build, same as every other
  // page on this site. Not a live "today's date"; that's the point.
  const year = new Date().getFullYear();
  const copyright = `© ${year} ${footer.brand.name}`;

  return (
    <footer className="relative isolate overflow-hidden font-sans">
      <div className="page-inset pt-16 sm:pt-24">
        {/* The ledger. `relative` so the corner crosshairs can hang off it. */}
        <div className="relative border-y border-border">
          <CornerTick className="absolute -top-1 -left-1 size-2 text-muted-foreground" />
          <CornerTick className="absolute -top-1 -right-1 size-2 text-muted-foreground" />
          <CornerTick className="absolute -bottom-1 -left-1 size-2 text-muted-foreground" />
          <CornerTick className="absolute -right-1 -bottom-1 size-2 text-muted-foreground" />

          <div className="flex flex-col lg:flex-row">
            <div className={`${CELL} gap-5 lg:w-[380px] lg:shrink-0 lg:pr-12`}>
              <SiteLink
                href={footer.brand.href}
                aria-label="Homepage"
                className="flex items-center gap-2.5 text-xl font-semibold text-foreground"
              >
                <SiteMark className="h-6 w-auto" />
                {footer.brand.name}
              </SiteLink>

              {footer.note ? (
                <p className="text-sm text-pretty text-muted-foreground">{footer.note}</p>
              ) : null}

              {footer.pills?.length ? (
                <ul className="flex flex-wrap items-center gap-2">
                  {footer.pills.map((pill) => (
                    <li
                      className="flex h-[26px] items-center gap-[7px] rounded-full px-2.5 outline-1 outline-foreground/15"
                      key={pill.label}
                    >
                      {pill.tone === "accent" ? (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
                      ) : null}
                      <span className="font-mono text-eyebrow uppercase text-muted-foreground">
                        {pill.label}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {footer.columns.map((column, index) => (
              <div
                // Only the last column closes the ledger on its right. Every
                // other edge in the row is some cell's left border, so without
                // this the grid is open on one side.
                className={`${CELL} lg:flex-1 ${index === footer.columns.length - 1 ? "lg:border-r" : ""}`}
                key={column.title}
              >
                <p className="font-mono text-eyebrow uppercase text-muted-foreground">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <SiteLink
                        href={link.href}
                        className="text-sm text-foreground hover:text-muted-foreground"
                      >
                        {link.label}
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar, outside the ledger. */}
        <div className="mt-[26px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>{copyright}</span>
            {footer.builtBy ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-2">
                  Built by
                  <SiteLink href={footer.builtBy.href} aria-label={footer.builtBy.label}>
                    {/* The builder's own wordmark, taken from the design file.
                        The one binary in this repo, and a deliberate exception:
                        a logo is not content, it cannot be a Block, and tracing
                        it to vector by hand would be reproducing someone's mark
                        by eye. `label` still carries the name for assistive tech
                        and for a project that swaps this out.

                        A plain <img>: next/image buys nothing for a fixed 80px
                        asset already in /public, and a mask would recolour a
                        third party's mark, which is not ours to do. */}
                    <img
                      alt=""
                      className="h-2.5 w-auto"
                      height={296}
                      src="/brand/roboto-wordmark.png"
                      width={2352}
                    />
                  </SiteLink>
                </span>
              </>
            ) : null}
          </p>

          <div className="flex items-center gap-6">
            {footer.legal.map((link) => (
              <SiteLink
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </SiteLink>
            ))}
            {footer.backToTop ? (
              // A plain anchor to the top of the document. The HTML spec defines
              // `#top` as the top of the page even when no element carries that
              // id, so this needs no scroll handler and no client JavaScript,
              // and it works before hydration.
              <a className="text-sm text-foreground hover:underline" href="#top">
                {footer.backToTop} <span aria-hidden="true">↑</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* The mark, large and running off the bottom of the page, on a textured
          bed. Decorative and behind everything. The texture does not animate: a
          moving field under a column of links is harder to read than a still
          one, and `animate={false}` keeps the footer free of client JS. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-30 h-80 sm:h-[26rem]">
        <GridField animate={false} className="size-full opacity-[0.16]" preset="dense" />
      </div>
      {/* Vignette and corner scrims over the bed, so it falls away into the page
          instead of ending on a line. Sits above the texture and below the mark,
          which is the order the design stacks them in. */}
      <EdgeScrims className="pointer-events-none absolute inset-0 -z-20" />
      {/* 72px below the bottom bar, matching the design. It sat directly under
          it before, which read as one block instead of two. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative -z-10 flex justify-center pt-[72px] pb-12"
      >
        <SiteMark className="h-44 w-auto text-foreground/85 sm:h-[270px]" />
      </div>
    </footer>
  );
}
