// Direction: contrast variant — no headline, no grid. Stats woven inline
// within a single sentence; the sentence itself is the statement. Values
// are mono + full-contrast, surrounding prose stays muted, and only color
// and weight change on the inline spans (never font-size, per general.md).
export function StatsInline() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <p className="max-w-prose text-2xl font-medium text-pretty text-muted-foreground sm:text-3xl">
          Agencies ship{" "}
          <span className="font-mono font-semibold text-foreground tabular-nums">12</span> blocks
          out of the box, reskin a client site in{" "}
          <span className="font-mono font-semibold text-foreground tabular-nums">3.2 hrs</span> on
          average, and launch{" "}
          <span className="font-mono font-semibold text-foreground tabular-nums">94%</span> of
          sections without touching custom code.
        </p>
      </div>
    </section>
  );
}
