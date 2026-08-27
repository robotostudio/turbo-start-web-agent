import { footer, site } from "#velite";
import { SiteLink } from "@/components/site/site-link";
import { ThemeToggle } from "@/components/site/theme-toggle";

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

const linkClass = "type-caption font-normal text-muted-foreground hover:text-foreground";

function Note() {
  return footer.note ? <p className="type-caption text-muted-foreground">{footer.note}</p> : null;
}

function Columns({ className }: { className: string }) {
  return (
    <div className={className}>
      {footer.columns.map((column) => (
        <div key={column.title}>
          <p className="type-caption font-medium text-foreground">{column.title}</p>
          <ul className="stack-tight flex flex-col gap-2">
            {column.links.map((link) => (
              <li key={link.label}>
                <SiteLink href={link.href} className={linkClass}>
                  {link.label}
                </SiteLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Social() {
  if (footer.social.length === 0) return null;
  return (
    <div className="flex items-center gap-4">
      {footer.social.map((link) => {
        const Icon = socialIcons[link.icon];
        return (
          <SiteLink key={link.label} href={link.href} aria-label={link.label} className="relative">
            <Icon />
            <span
              className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
              aria-hidden="true"
            />
          </SiteLink>
        );
      })}
    </div>
  );
}

// Optical trim: `leading-none` still leaves Geist's own empty bands in the line
// box, 0.145em above the caps and 0.133em below the baseline. Re-measure if the
// font changes.
function Wordmark() {
  return (
    <p
      aria-hidden="true"
      className="mt-[calc(var(--rhythm-section)-0.145em)] mb-[-0.133em] px-5 text-center text-(length:--wordmark-size) leading-none font-semibold text-foreground/12 uppercase tracking-tight"
    >
      {site.name}
    </p>
  );
}

export function SiteFooter() {
  // Static generation only — computed once per build, same as every other
  // page on this site. Not a live "today's date"; that's the point.
  const year = new Date().getFullYear();
  const copyright = `© ${year} ${footer.brand.name}${footer.copyrightNote ? `. ${footer.copyrightNote}` : ""}`;

  return (
    <footer className="overflow-hidden border-t border-border font-sans">
      <div className="page-inset pt-16">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-note">
            <Note />
            {footer.builtBy ? (
              <p className="stack-lede type-caption text-muted-foreground">
                <SiteLink href={footer.builtBy.href} className="font-normal hover:text-foreground">
                  {footer.builtBy.label}
                </SiteLink>
              </p>
            ) : null}

            <div className="stack-near">
              <Social />
            </div>
          </div>
          <Columns className="flex shrink-0 flex-wrap gap-x-32 gap-y-12 sm:justify-end" />
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <p className="type-caption text-muted-foreground">{copyright}</p>
          <ThemeToggle />
        </div>
      </div>
      <Wordmark />
    </footer>
  );
}
