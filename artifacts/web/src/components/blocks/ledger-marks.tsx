// The two small marks the redesign sets beside a ledger line: a pink check for
// the side being recommended, and a muted dash for the alternative. Shared by
// FeatureSplit's points and Comparison's columns so the check is drawn once.
// Both are decorative: the text beside them, or a column label, carries the
// meaning, so they are hidden from assistive tech.

export function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 14 14"
    >
      <path d="M2.5 7.4 5.6 10.4 11.5 3.8" />
    </svg>
  );
}

export function DashMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 14 14"
    >
      <path d="M3.5 7h7" />
    </svg>
  );
}
