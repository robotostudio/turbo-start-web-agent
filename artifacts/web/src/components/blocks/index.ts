import type { ComponentType } from "react";
import { CTA } from "./cta";
import { FeatureGrid } from "./feature-grid";
import { FeatureSplit } from "./feature-split";
import { Gallery } from "./gallery";
import { Hero } from "./hero";
import { ImageCards } from "./image-cards";

// Injected into every MDX body by the renderer, so content files need no
// imports. Keep in step with blockSchemas in src/lib/blocks/schemas.ts.
export const blockComponents: Record<string, ComponentType<never>> = {
  Hero,
  CTA,
  FeatureGrid,
  FeatureSplit,
  ImageCards,
  Gallery,
};
