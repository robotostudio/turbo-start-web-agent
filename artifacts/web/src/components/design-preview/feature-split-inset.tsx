// Direction: Inset Split — visual sits right, held inside the container edge
// with a soft outline, close against the text column. Supporting detail is a
// short list rather than prose.
export function FeatureSplitInset() {
  const points = [
    "Every block preview ships with client-ready copy",
    "Content stays wired to the same schema in production",
    "Nothing on the page reads like a placeholder",
  ];

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-x-12 gap-y-10 lg:grid-cols-2">
          <div>
            <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Every block ships with real content, not lorem ipsum.
            </h2>
            <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">
              Preview a block and it already reads like a finished page — swap the copy when the
              client&apos;s ready, not before.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground"
                  />
                  <span className="text-base text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-card outline-1 -outline-offset-1 outline-black/10">
            <img
              src="https://assets.ui.sh/screenshots/1.webp?top=900&left=1200&position=bottom-right"
              alt=""
              width={1200}
              height={900}
              className="aspect-4/3 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
