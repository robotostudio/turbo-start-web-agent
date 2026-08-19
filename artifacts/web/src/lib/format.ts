// Shared display formatting. Kept out of the components so the blog index and
// an article header can never drift into showing the same date two ways.

// `timeZone: "UTC"` is the whole point of pinning the formatter here. Velite's
// `s.isodate()` turns a date-only frontmatter value ("2026-08-17") into a full
// ISO instant at midnight UTC ("2026-08-17T00:00:00.000Z"). Formatted in the
// build machine's local zone, that instant renders as the PREVIOUS day
// anywhere west of Greenwich — so a post dated the 17th would publish as the
// 16th on a US-hosted build and the 17th on a European one, from identical
// content. Reading it back in UTC returns the day that was authored.
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** "2026-08-17T00:00:00.000Z" -> "August 17, 2026". */
export const formatDate = (iso: string): string => DATE_FORMATTER.format(new Date(iso));
