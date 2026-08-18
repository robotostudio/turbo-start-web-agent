import { team } from "@/components/design-preview/data";

// Direction: Even Field, dense. Full 6-up grid at desktop, small circular
// avatars, role sits beside the name on one line instead of stacked below.
export function TeamDense() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          Six people, one template.
        </h2>
        <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-20 sm:grid-cols-6">
          {team.map((person) => (
            <li key={person.name} className="flex flex-col items-start gap-3">
              <img
                src={person.avatar}
                alt=""
                className="size-16 shrink-0 rounded-full outline-1 -outline-offset-1 outline-black/5"
              />
              <div className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-sm font-semibold text-foreground">{person.name}</span>
                <span className="text-sm text-muted-foreground">{person.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
