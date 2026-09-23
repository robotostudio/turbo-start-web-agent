import { SiteLink } from "@/components/site/site-link";
import { cn } from "@/lib/utils";

// A link set as text with a chevron after it, which is how the redesign draws
// every link that is not a call to action: under each FeatureRows row, and the
// "All posts" link beside PostGrid's header. One component so the chevron is
// drawn once; ButtonLink is the equivalent for links that look like buttons.
//
// Through SiteLink, for the reason button-link.tsx gives: an in-site href is a
// client-side navigation and anything else a plain anchor, decided in one place.

/** The comp's link chevron: 13px, 1.4 stroke, round joins. Not the header's
 * ChevronRightIcon, which lives in a `"use client"` module and is drawn at 20px
 * for a touch target rather than at text size beside a label. */
function LinkChevron() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.25 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      viewBox="0 0 13 13"
    >
      <path d="M4.4 2.2 8.6 6.5 4.4 10.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TextLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <SiteLink
      className={cn(
        "inline-flex w-fit items-center gap-1.75 text-sm text-foreground transition-colors hover:text-primary",
        className,
      )}
      href={href}
    >
      {label}
      <LinkChevron />
    </SiteLink>
  );
}
