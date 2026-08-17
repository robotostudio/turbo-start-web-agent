import type { ReactNode } from "react";

// Block Gallery chrome — deliberately NOT registered in blockSchemas or
// blockComponents. It is page structure injected at render (see
// mdx-content.tsx), not a Block an author composes with. Registering it would
// have it list itself in its own gallery and skew blockCount.
export function BlockSpec({
  name,
  status = "ready",
  children,
}: {
  name: string;
  status?: "ready" | "todo";
  children?: ReactNode;
}) {
  return (
    <section className="border-t border-border py-12">
      <div className="page-inset">
        <div className="flex items-baseline gap-3">
          <h2 className="font-mono text-sm uppercase tracking-wide text-foreground">{name}</h2>
          {status === "todo" && (
            <span className="font-mono text-xs uppercase text-muted-foreground">
              no example yet
            </span>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
