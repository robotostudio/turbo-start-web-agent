import { footer } from "#velite";
import { SiteLink } from "@/components/site/site-link";
import { socialIcons } from "@/components/site/social-icons";

// Direction: Columns — the conventional multi-column link footer, done in
// the house voice: no card, no recessed band, just a top border to close the
// page and generous column gaps instead of dividers between them.
//
// Server component: the wordmark, columns, social links, legal links, and
// notes all come from the `footer` singleton collection
// (content/settings/footer.yml), validated at build time by velite.config.ts
// — every href through the same isSafeUrl refine Block links use, since YAML
// never passes through the MDX content-lockdown remark plugin. What stays in
// the component: the social-icon SVGs themselves (`icon` in content only
// selects one of the two below), and the "© {year} {brand}." assembly — the
// year is computed at build time, never authored.

export function SiteFooter() {
  // Static generation only — computed once per build, same as every other
  // page on this site. Not a live "today's date"; that's the point.
  const year = new Date().getFullYear();
  const copyright = `© ${year} ${footer.brand.name}${footer.copyrightNote ? `. ${footer.copyrightNote}` : ""}`;

  return (
    <footer className="border-t border-border font-sans">
      <div className="page-inset py-16 sm:py-20">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between sm:gap-16">
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

          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 sm:gap-16">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-medium text-foreground">{column.title}</p>
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
          <p className="text-sm text-muted-foreground">{copyright}</p>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
