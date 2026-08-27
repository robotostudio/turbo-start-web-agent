import type { ReactNode } from "react";

// Block Gallery chrome — deliberately NOT registered in blockSchemas or
// blockComponents. It is page structure injected at render (see
// mdx-content.tsx), not a Block an author composes with. Registering it would
// have it list itself in its own gallery and skew blockCount.

export const blockAnchor = (name: string): string =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

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
    <section
      id={blockAnchor(name)}
      aria-label={name}
      className="scroll-mt-24 border-t border-border section-y"
    >
      {status === "todo" && (
        <p className="px-5 pb-8 type-overline font-mono text-muted-foreground uppercase">
          no example yet
        </p>
      )}
      <div className="min-w-0">{children}</div>
    </section>
  );
}
