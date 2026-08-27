import Image from "next/image";
import { parseBlock, type TeamProps, teamSchema } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function Team(raw: TeamProps) {
  const { title, team } = parseBlock("Team", teamSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset section-y">
        <SectionHeader title={title} />
        <ul className="stack-content grid grid-cols-2 gap-4 lg:grid-cols-3">
          {team.map((person) => (
            <li
              key={person.name}
              className="relative aspect-3/4 overflow-hidden rounded-card outline-1 -outline-offset-1 outline-foreground/5"
            >
              <Image
                src={person.avatar.src}
                alt={person.avatar.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="type-subheading text-balance text-background">{person.name}</div>
                <div className="stack-tight type-caption text-background/70">{person.role}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
