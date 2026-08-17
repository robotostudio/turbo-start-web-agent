import type { ComponentType } from "react";
import { CTA } from "./cta";
import { Hero } from "./hero";

// Injected into every MDX body by the renderer, so content files need no
// imports. Keep in step with blockSchemas in src/lib/blocks/schemas.ts.
export const blockComponents: Record<string, ComponentType<never>> = {
  Hero,
  CTA,
};
