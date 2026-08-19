import Link from "next/link";
import type { ReactNode } from "react";
import { announcement } from "#velite";
import { cn } from "@/lib/utils";

type AnnouncementLink = { label: string; href: string };

const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";

// Renders `children` in a `<Link>`/`<a>` (the internal-vs-external split
// every other Block/chrome component in this repo uses — banner.tsx,
// hero.tsx's ActionLink, since next/link only understands same-origin
// routes) when `link` is set, otherwise a plain `<div>`. The whole strip
// becomes the tap target rather than a link nested around just the trailing
// label — the marquee variant below especially needs this, since a target
// sliding under your thumb inside a moving track is close to untappable.
function BarShell({
  link,
  className,
  children,
}: {
  link?: AnnouncementLink;
  className: string;
  children: ReactNode;
}) {
  if (!link) {
    return <div className={className}>{children}</div>;
  }

  const linkClassName = cn(className, "transition-opacity hover:opacity-80", focusRing);

  return link.href.startsWith("/") ? (
    <Link href={link.href} className={linkClassName}>
      {children}
    </Link>
  ) : (
    <a href={link.href} className={linkClassName}>
      {children}
    </a>
  );
}

// The message, then the link label (when set) underlined — shared by the
// two non-marquee layouts below.
function Message({ message, label }: { message: string; label?: string }) {
  return (
    <>
      <span>{message}</span>
      {label ? <span className="font-medium underline underline-offset-4">{label}</span> : null}
    </>
  );
}

// One pass of the mobile marquee's content, sized and spaced to match
// `Message` above. The track below renders this twice — the second copy
// `aria-hidden`, a pure visual duplicate so the `-50%` slide
// (globals.css `@keyframes marquee`) loops with no seam.
function MarqueeCopy({
  message,
  label,
  hidden,
}: {
  message: string;
  label?: string;
  hidden?: boolean;
}) {
  return (
    <span
      aria-hidden={hidden}
      className="flex shrink-0 items-center gap-2 pr-12 text-sm whitespace-nowrap text-primary-foreground"
    >
      <span>{message}</span>
      {label ? <span className="font-medium underline underline-offset-4">{label}</span> : null}
    </span>
  );
}

// Site-wide announcement bar: chrome rendered above `SiteHeader` in
// src/app/layout.tsx, structurally outside the page content flow — unlike
// the in-page Banner Block (src/components/blocks/banner.tsx), which is
// composed into page content and can never render above the header. Reads
// the `announcement` singleton collection (content/settings/announcement.yml),
// validated at build time by velite.config.ts — every `href` through the
// same `isSafeUrl` refine nav and footer hrefs use, since YAML never passes
// through the MDX content-lockdown remark plugin. `enabled: false` renders
// nothing at all (not an empty element), so a client's agent can switch the
// bar off without deleting the message/link underneath.
//
// Server component: no dismiss control and no scroll-linked behavior, and
// the below-`sm` marquee is a pure CSS `animation` (globals.css
// `--animate-marquee`/`@keyframes marquee`), so no client JS is needed here.
//
// Sticky-header interaction (verified in-browser, not just in source): this
// bar is a normal, non-sticky block that sits above `SiteHeader`
// (`sticky top-4 z-40` — see site-header.tsx) in document order. It scrolls
// away with the rest of the page like any other content; once it's scrolled
// out of view, the header's own `sticky top-4` rule pins it at the same
// 1rem-from-viewport-top position it would use with no bar present — the
// two never fight over the same space. `relative z-30` keeps this bar one
// level below the header's `z-40` for the rare case their boxes would
// otherwise overlap (e.g. during the scroll frame where the header's sticky
// state engages), without ever needing to out-rank it.
export function AnnouncementBar() {
  if (!announcement.enabled) return null;

  const { message, link } = announcement;

  return (
    <div className="relative z-30 bg-primary font-sans">
      {/* Below `sm`, motion-safe only: verified in-browser at 390px — this
          copy's message plus its link label wraps to three lines there,
          which reads worse than a single scrolling line, so it loops as a
          marquee instead. Full-bleed (no page-inset) so the sliding track
          reads as edge-to-edge motion rather than sliding inside a visible
          margin. */}
      <BarShell link={link} className="hidden overflow-hidden py-2.5 motion-safe:flex sm:hidden">
        <div className="flex w-max shrink-0 animate-marquee items-center">
          <MarqueeCopy message={message} label={link?.label} />
          <MarqueeCopy message={message} label={link?.label} hidden />
        </div>
      </BarShell>

      {/* Below `sm`, motion-reduce only: the same wrapping layout the sm+
          block below uses, sized for a phone. A perpetually looping strip is
          exactly the kind of motion prefers-reduced-motion exists to
          suppress, so reduced-motion users never see the marquee above. */}
      <BarShell
        link={link}
        className="hidden flex-wrap items-center justify-center gap-x-2 gap-y-1 px-6 py-2.5 text-center text-sm text-primary-foreground motion-reduce:flex sm:hidden"
      >
        <Message message={message} label={link?.label} />
      </BarShell>

      {/* `sm` and up: verified in-browser — this copy fits on one line at
          desktop widths and wraps cleanly at narrower sm/tablet widths, so
          it's never animated here regardless of motion preference. */}
      <BarShell
        link={link}
        className="page-inset hidden flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2.5 text-center text-sm text-primary-foreground sm:flex"
      >
        <Message message={message} label={link?.label} />
      </BarShell>
    </div>
  );
}
