// The site's mark, taken from the design rather than approximated. Six paths:
// a notched frame and the two bars inside it.
//
// The design's own lockup draws the name beside this as a seventh vector path.
// That is deliberately not reproduced here. `brand:check` asserts the site's
// name appears nowhere under `src/`, and a wordmark is the name -- it just
// happens not to be greppable as one. The name is set in `content/settings/
// site.yml` and rendered as text beside this mark, so a client rebrand stays a
// content edit. A client replacing the mark itself edits this file, the same
// deal `app/icon.svg` already documents for the favicon.
//
// Colour comes from the call site through currentColor: the lockup wants it at
// full strength, the watermark behind the footer wants it dimmed.
export function SiteMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      role="presentation"
      viewBox="0 0 25.682 24"
    >
      <path d="M20.834 4.825H25.682V19.174L20.834 24.001 20.834 4.825Z" />
      <path d="M0.001 4.824L4.818 0V19.176H0.001L0.001 4.824Z" />
      <path d="M18.186 7.987C18.186 7.45 17.748 7.014 17.207 7.014 16.668 7.014 16.23 7.45 16.23 7.987V11.23C16.23 11.769 16.668 12.203 17.207 12.203 17.748 12.203 18.186 11.769 18.186 11.23V7.987Z" />
      <path d="M12.97 9.771C12.97 9.234 12.533 8.799 11.992 8.799 11.451 8.799 11.014 9.234 11.014 9.771V13.014C11.014 13.552 11.451 13.987 11.992 13.987 12.533 13.987 12.97 13.552 12.97 13.014V9.771Z" />
      <path d="M4.816 0.001H21.511C22.97 0.001 23.701 0.001 24.259 0.283 24.749 0.532 25.148 0.929 25.398 1.417 25.682 1.972 25.682 2.699 25.682 4.152V4.825H4.816V0.001Z" />
      <path d="M0 19.176H20.834V24H4.174C2.712 24 1.982 24 1.423 23.717 0.933 23.469 0.534 23.071 0.284 22.583 0 22.029 0 21.301 0 19.849V19.176Z" />
    </svg>
  );
}

// The crosshair that marks each corner of a bordered grid in this design. It
// sits on the corner rather than inside it, which is why it is offset by half
// its own size at the call site.
export function CornerTick({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      role="presentation"
      stroke="currentColor"
      strokeWidth="1"
      viewBox="0 0 9 9"
    >
      <path d="M4.5 0V9M0 4.5H9" />
    </svg>
  );
}

// The edge treatment under the footer: a vignette plus three corner scrims,
// which is what stops the textured bed ending in a hard line and lets it fall
// away into the page.
//
// Measured from the design. Every stop is `--background` at some alpha, which
// is why these are written with color-mix against the token rather than as the
// literal oklab values Paper reports -- a re-theme has to carry them, or the
// footer keeps fading to a colour the rest of the page no longer uses.
//
// Inline styles rather than Tailwind arbitrary values: these are four
// multi-stop gradients with commas and percentages in them, and the escaped
// class-name version is unreadable for no gain.
//
// Exported because the CTA band's bed is built the same way: the comp gives it
// the identical vignette and its own pair of scrims, all `--background` at
// some alpha.
export const groundAt = (alpha: number) =>
  alpha >= 100
    ? "var(--background)"
    : `color-mix(in oklab, var(--background) ${alpha}%, transparent)`;

/** The oval that darkens a textured bed towards its edges. Shared, not
 * similar: the footer and the CTA band carry the same ellipse, stop for stop. */
export const BED_VIGNETTE = `radial-gradient(ellipse 75.01% 96.44% at 50% 53.18% in oklab, ${groundAt(15)} 0%, ${groundAt(72)} 58%, ${groundAt(100)} 100%)`;

export function EdgeScrims({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(in oklab 76.16deg, ${groundAt(0)} 49.11%, ${groundAt(55)} 60.69%, ${groundAt(100)} 79.03%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(in oklab 79.1deg, ${groundAt(100)} 15.69%, ${groundAt(55)} 40.21%, ${groundAt(0)} 55.71%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(in oklab 168.06deg, ${groundAt(100)} 49.22%, ${groundAt(55)} 63.4%, ${groundAt(0)} 72.36%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: BED_VIGNETTE,
        }}
      />
    </div>
  );
}
