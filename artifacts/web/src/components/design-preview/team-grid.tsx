import { team } from "@/components/design-preview/data";

// Direction: Even Field. Moderate density (3-up desktop), square avatars,
// role sits under the name in the muted color per team-sections.md.
export function TeamGrid() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          The people building the block registry.
        </h2>
        <ul className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-3">
          {team.map((person) => (
            <li key={person.name}>
              <img
                src={person.avatar}
                alt=""
                className="aspect-square w-full rounded-card object-cover outline-1 -outline-offset-1 outline-black/5"
              />
              <div className="mt-4 text-base font-semibold text-foreground">{person.name}</div>
              <div className="text-sm text-muted-foreground">{person.role}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
