import Image from "next/image";
import { parseBlock, type TeamProps, teamSchema } from "@/lib/blocks/schemas";

export function Team(raw: TeamProps) {
  const { title, team } = parseBlock("Team", teamSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h2>
        <ul className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-3">
          {team.map((person) => (
            <li key={person.name}>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg outline-1 -outline-offset-1 outline-black/5">
                <Image
                  src={person.avatar.src}
                  alt={person.avatar.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 text-base font-semibold text-foreground">{person.name}</div>
              <div className="text-sm text-muted-foreground">{person.role}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
