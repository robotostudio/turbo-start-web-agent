import type { ComponentType } from "react";
import { Banner } from "./banner";
import { CtaBand } from "./cta-band";
import { Faq } from "./faq";
import { FeatureGrid } from "./feature-grid";
import { FeatureSplit } from "./feature-split";
import { Gallery } from "./gallery";
import { Hero } from "./hero";
import { ImageCards } from "./image-cards";
import { LogoCloud } from "./logo-cloud";
import { Newsletter } from "./newsletter";
import { Stats } from "./stats";
import { Team } from "./team";
import { Testimonial } from "./testimonial";

// Injected into every MDX body by the renderer, so content files need no
// imports. Keep in step with blockSchemas in src/lib/blocks/schemas.ts.
export const blockComponents: Record<string, ComponentType<never>> = {
  Banner,
  Hero,
  CTA: CtaBand,
  FeatureGrid,
  FeatureSplit,
  ImageCards,
  Gallery,
  Faq,
  Testimonial,
  LogoCloud,
  Team,
  Stats,
  Newsletter,
};
