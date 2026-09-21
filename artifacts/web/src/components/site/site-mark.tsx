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
