import Link from "next/link";
import type { ReactNode } from "react";

// One link component for site chrome (header + footer), because chrome hrefs
// come from YAML and can be either an in-app route ("/about") or an external
// URL ("https://github.com/..."). next/link only understands same-origin
// routes, so anything else falls back to a plain anchor — the same
// internal-vs-external split announcement-bar.tsx and the Blocks' own
// ActionLinks (hero.tsx, banner.tsx, pricing.tsx, cta-band.tsx) use.
//
// Why this file exists: the header and footer previously rendered every link
// as a raw `<a>`, which makes an in-site click a full document load — new
// HTML request, fonts and CSS re-evaluated, the RSC payload cache and scroll
// position both discarded — while the Blocks on the same page navigated
// client-side. That inconsistency is the bug this fixes; keeping the choice
// in one component is what stops it coming back the next time a chrome link
// is added.
//
// The predicate is deliberately `startsWith("/")` and nothing more, matching
// the existing call sites verbatim rather than inventing a second, subtly
// different rule: a bare "#section" or "?q=1" href stays a plain anchor,
// which is the correct behaviour for a same-document jump anyway.
const isInternalRoute = (href: string): boolean => href.startsWith("/");

export function SiteLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
} & Pick<React.ComponentProps<"a">, "aria-label">) {
  return isInternalRoute(href) ? (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}
