import type { StatMeterProps } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

// The segmented meter beside a figure in the stats ledger. A private part of
// Stats, deliberately NOT registered in blockSchemas or blockComponents: it is
// a layout fragment a Block renders, not a Block an author composes with, so
// it stays out of catalog.json and out of blockCount. Same status as
// SectionHeader and GridField.
//
// The comp draws four of these and no two are the same shape: a plain tally of
// sixteen, a 2.6-of-8 with a part-height tick and a "/ 8 hr day" note, a single
// accent tick labelled tokens.css, and eight empty outlines for a zero. That is
// why the schema takes filled/total/partial/tone/note rather than one percent:
// a single filled-bar prop could express the first of those and none of the
// other three.

const TICK = "w-1.75 shrink-0 rounded-xs";
/** A tick at full height, in rem, so a partial one can be a fraction of it.
 * Matches `h-4.5`; kept as a number because the partial tick's height is
 * computed from data and cannot be a utility class. */
const TICK_REM = 1.125;

export function StatMeter({ filled, total, partial, tone, note }: StatMeterProps) {
  // A partial tick occupies the slot after the filled ones, so it has to be
  // counted when the author gave no explicit total.
  const slots = Math.max(total ?? filled, filled + (partial ? 1 : 0));

  // The row wraps and grows rather than fixing its height: a sixteen-tick tally
  // is about 176px, which does not fit a cell once four of them share a tablet
  // width, and a fixed-height row would have clipped the overflow instead of
  // flowing it.
  return (
    <p className="flex min-h-4.5 flex-wrap items-end gap-1">
      {Array.from({ length: slots }, (_, index) => {
        const isFilled = index < filled;
        const isPartial = !isFilled && partial !== undefined && index === filled;
        const key = `${index}-${isFilled ? "on" : isPartial ? "part" : "off"}`;

        if (isFilled || isPartial) {
          return (
            <span
              aria-hidden="true"
              className={cn(TICK, tone === "accent" ? "bg-primary" : "bg-ledger-meter")}
              key={key}
              // Absolute, not a percentage of the row: the row wraps, so its
              // height is not a fixed thing to take a fraction of.
              style={{ height: `${(isPartial ? (partial ?? 0) : 1) * TICK_REM}rem` }}
            />
          );
        }

        return (
          <span
            aria-hidden="true"
            className={cn(
              TICK,
              "h-4.5",
              // An empty slot on a cell that has nothing filled has to carry
              // its own edge: the 9% rule fill reads as missing data at 7px
              // wide, where an outline reads as a deliberate zero.
              tone === "outline" ? "border border-ledger-meter-empty" : "bg-ledger-rule",
            )}
            key={key}
          />
        );
      })}

      {/* Not aria-hidden, unlike the ticks: the ticks restate the figure sitting
          directly above them, but the note names the unit it is measured in and
          appears nowhere else. No `uppercase` either, unlike the eyebrow: the
          comp sets "/ 8 HR DAY" in caps and "tokens.css" in lower, one being a
          unit and the other a filename, so case is the author's to write. */}
      {note && <span className="pl-1.5 font-mono text-label text-subtle-foreground">{note}</span>}
    </p>
  );
}
