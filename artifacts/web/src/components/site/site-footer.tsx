import { footer } from "#velite";
import { SiteLink } from "@/components/site/site-link";

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

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-6 text-muted-foreground hover:text-foreground"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-6 text-muted-foreground hover:text-foreground"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2z"
      />
    </svg>
  );
}

const socialIcons = {
  x: XIcon,
  github: GitHubIcon,
} as const;

export function SiteFooter() {
  // Static generation only — computed once per build, same as every other
  // page on this site. Not a live "today's date"; that's the point.
  const year = new Date().getFullYear();
  const copyright = `© ${year} ${footer.brand.name}${footer.copyrightNote ? `. ${footer.copyrightNote}` : ""}`;

  return (
    <footer className="border-t-2 border-border font-sans">
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
                  <SiteLink key={link.label} href={link.href} aria-label={link.label}>
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
