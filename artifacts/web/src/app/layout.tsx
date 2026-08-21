import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { announcement, site } from "#velite";
import "./globals.css";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { OverscrollColorFallback } from "@/components/site/overscroll-color-fallback";
import { OverscrollEasterEgg } from "@/components/site/overscroll-easter-egg";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

// Read from content/settings/site.yml, never written here. Rebranding a
// client project must be a content edit; a brand name hardcoded in this file
// is exactly the thing that makes it a source edit instead.
export const metadata: Metadata = {
  title: site.name,
  description: site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-announcement drives --color-overscroll-top (globals.css). The top
    // overscroll colour must match whatever is actually topmost on the page:
    // the announcement bar when it is on, the header when it is off. Deriving
    // it here rather than hardcoding the token means flipping `enabled` in
    // announcement.yml cannot leave the bounce gap the wrong colour.
    <html
      lang="en"
      data-announcement={announcement.enabled ? "on" : "off"}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        {/* Direct children of <body> (not nested inside AnnouncementBar's or
            SiteHeader's own `relative`/`sticky` wrappers), so their `-z-10`/
            fixed positioning resolves against the root stacking context —
            see overscroll-easter-egg.tsx and overscroll-color-fallback.tsx. */}
        <OverscrollEasterEgg />
        <AnnouncementBar />
        <SiteHeader />
        {children}
        <SiteFooter />
        <OverscrollColorFallback />
      </body>
    </html>
  );
}
