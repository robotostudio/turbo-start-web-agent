// Direction: Signoff — deliberate contrast variant. Structure pushes further
// than the other two: an oversized wordmark closes the page as a statement
// in its own right, paired with a short line and a CTA so the footer also
// works as the site's last pitch, not just a link dump.

const links = [
  { label: "Blocks gallery", href: "/blocks-gallery" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
] satisfies Array<{ label: string; href: string }>;

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

export function FooterSignoff() {
  return (
    <footer className="font-sans">
      <div className="page-inset py-16 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-base font-normal text-muted-foreground hover:text-foreground sm:text-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <a href="https://x.com" aria-label="Harbour on X">
              <XIcon />
            </a>
            <a href="https://github.com" aria-label="Harbour on GitHub">
              <GitHubIcon />
            </a>
          </div>
        </div>

        <a
          href="/"
          aria-label="Homepage"
          className="mt-16 block text-8xl font-semibold tracking-tight text-foreground sm:mt-24 sm:text-9xl"
        >
          Harbour
        </a>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p className="max-w-sm text-lg text-pretty text-muted-foreground">
            Clone it, swap the tokens, ship the client&apos;s site this week.
          </p>
          <a
            href="https://github.com"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:shrink-0"
          >
            Clone the repo
          </a>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Harbour. Released under the MIT license.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-sm font-normal text-muted-foreground hover:text-foreground"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-sm font-normal text-muted-foreground hover:text-foreground"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
