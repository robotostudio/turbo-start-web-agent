import Image from "next/image";
import { parseBlock, type TeamProps, teamSchema } from "@/lib/blocks/schemas";
import { LedgerCorners, ledgerFillers } from "./ledger";
import { SectionHeaderSplit } from "./section-header";

// The redesign's team grid, drawn in Paper as "team / redesign" (and its 375
// frame): a ruled ledger of people, three to a row from lg and two below.
// Each cell is a square portrait on the hairline, the name in the subtitle
// role, and the role in the eyebrow's small caps, opposite the name when the
// cell is wide enough and under it on a phone.
//
// Portraits are greyscale on purpose: a set of photos shot in different
// light reads as one set on the dark page, the way the FeaturedQuote avatar
// does.
export function Team(raw: TeamProps) {
  const { eyebrow, title, lede, team } = parseBlock("Team", teamSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-16 lg:py-22">
        <SectionHeaderSplit eyebrow={eyebrow} lede={lede} title={title} />
        <div className="relative mt-14">
          <ul className="grid grid-cols-2 border-ledger-rule border-t border-l lg:grid-cols-3">
            {team.map((person) => (
              <li
                className="flex flex-col gap-3 border-ledger-rule border-r border-b p-3 pb-4 sm:gap-5 sm:p-6 sm:pb-7"
                key={person.name}
              >
                <div className="relative aspect-square overflow-hidden outline outline-ledger-rule">
                  <Image
                    alt={person.avatar.alt}
                    className="object-cover grayscale"
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    src={person.avatar.src}
                  />
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <h3 className="text-foreground text-lg sm:text-subtitle">{person.name}</h3>
                  <p className="font-mono text-eyebrow text-subtle-foreground uppercase">
                    {person.role}
                  </p>
                </div>
              </li>
            ))}
            {ledgerFillers(team.length, { base: 2, lg: 3 }).map((className, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fillers are identical and positional
              <li aria-hidden="true" className={className} key={`filler-${index}`} />
            ))}
          </ul>
          <LedgerCorners />
        </div>
      </div>
    </section>
  );
}
