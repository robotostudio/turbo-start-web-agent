import Image from "next/image";
import { team } from "@/components/design-preview/data";

// Direction: Even Field, spacious. Two-column list, larger portrait
// avatars, name stacked above role — the lowest density of the three
// variants, leaning further into whitespace-as-hierarchy.
export function TeamList() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          Who you&apos;re actually talking to.
        </h2>
        <ul className="mt-16 grid grid-cols-1 gap-x-12 gap-y-14 sm:mt-20 sm:grid-cols-2">
          {team.map((person) => (
            <li key={person.name} className="flex items-center gap-6">
              <Image
                src={person.avatar}
                alt=""
                width={96}
                height={96}
                className="aspect-square size-24 shrink-0 rounded-full outline-1 -outline-offset-1 outline-black/5"
              />
              <div>
                <div className="text-lg font-semibold text-foreground">{person.name}</div>
                <div className="mt-1 text-muted-foreground">{person.role}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
