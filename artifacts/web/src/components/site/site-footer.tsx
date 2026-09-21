import { footer } from "#velite";
import { SiteLink } from "@/components/site/site-link";
import { socialIcons } from "@/components/site/social-icons";
import { GridField } from "@/components/texture/grid-field";

// Direction: Columns — the conventional multi-column link footer, done in
// the house voice: no card, no recessed band, just a top border to close the
// page and generous column gaps instead of dividers between them.
//
// Server component: the wordmark, columns, status pills, social links, legal
// links, attribution and notes all come from the `footer` singleton collection
// (content/settings/footer.yml), validated at build time by velite.config.ts
// — every href through the same isSafeUrl refine Block links use, since YAML
// never passes through the MDX content-lockdown remark plugin. What stays in
// the component: the social-icon SVGs themselves (`icon` in content only
// selects one of them), the watermark glyph, and the "© {year} {brand}."
// assembly — the year is computed at build time, never authored.

// The mark behind the footer, at the size the design draws it. The same glyph
// as app/icon.svg, carried here rather than imported because that file is a
// standalone favicon document and cannot be referenced as a component.
//
// It carries no text. brand:check asserts the site's name appears nowhere under
// src/, and a wordmark spelled out here would fail it — correctly, since the
// name belongs in site.yml where a client can change it.
function Watermark() {
  return (
    <svg
      aria-hidden="true"
      className="size-full text-foreground"
      fill="currentColor"
      role="presentation"
      viewBox="0 0 32 32"
    >
      <rect height="16" rx="1" width="4" x="9" y="8" />
      <rect height="16" rx="1" width="4" x="19" y="8" />
      <rect height="4" rx="1" width="14" x="9" y="14" />
    </svg>
  );
}

export function SiteFooter() {
  // Static generation only — computed once per build, same as every other
  // page on this site. Not a live "today's date"; that's the point.
  const year = new Date().getFullYear();
  const copyright = `© ${year} ${footer.brand.name}${footer.copyrightNote ? `. ${footer.copyrightNote}` : ""}`;

  return (
    <footer className="relative isolate overflow-hidden border-t border-border font-sans">
      {/* The textured bed and the mark, both decorative and both behind the
          content. The texture does not animate here: a moving field behind a
          column of links is harder to read than a still one, and a footer is
          the last place that trade is worth making. `animate={false}` also
          means this ships no client JavaScript. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3">
        <GridField animate={false} className="size-full opacity-[0.12]" preset="dense" />
      </div>
      <div className="pointer-events-none absolute -bottom-20 left-1/2 -z-10 size-80 -translate-x-1/2 opacity-[0.045] sm:size-[28rem]">
        <Watermark />
      </div>

      <div className="page-inset py-16 sm:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          <div className="max-w-xs">
            <SiteLink
              href={footer.brand.href}
              aria-label="Homepage"
              className="text-base font-semibold text-foreground"
            >
              {footer.brand.name}
            </SiteLink>
            {footer.note ? (
              <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-sm">
                {footer.note}
              </p>
            ) : null}

            {footer.pills?.length ? (
              <ul className="mt-6 flex flex-wrap items-center gap-2">
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

            <div className="mt-6 flex items-center gap-5">
              {footer.social.map((link) => {
                const Icon = socialIcons[link.icon];
                return (
                  <SiteLink
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    // Colour lives here rather than in the icon: the footer
                    // wants these muted, the header wants them to sit with the
                    // nav, and the mark itself is the same either way.
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Icon />
                  </SiteLink>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 lg:gap-16">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <p className="font-mono text-eyebrow uppercase text-muted-foreground">
                  {column.title}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <SiteLink
                        href={link.href}
                        className="text-base font-normal text-muted-foreground hover:text-foreground sm:text-sm"
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

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>{copyright}</span>
            {footer.builtBy ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Built by{" "}
                  <SiteLink href={footer.builtBy.href} className="text-foreground hover:underline">
                    {footer.builtBy.label}
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
                className="text-sm font-normal text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </SiteLink>
            ))}
            {footer.backToTop ? (
              // A plain anchor to the top of the document: no scroll handler,
              // no client JavaScript, and it still works before hydration.
              <a className="text-sm font-normal text-foreground hover:underline" href="#top">
                {footer.backToTop} <span aria-hidden="true">↑</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
