import { z } from "zod";
import { isSafeUrl } from "../content/remark-content-lockdown.ts";

// One Block = one schema here + one component + one registry entry. Variants
// are z.enum([...]).default(...), so this file shows an author every allowed
// value and its default.

// The lockdown's URL check is a NAME heuristic (href, src, url, to, cite,
// ping, srcset, or any name ending url/href/src) — a prop named something
// outside that list gets no check from it at all. This is the second,
// independent gate: Zod checks every href here regardless of what the prop
// is named. `.refine()` predicates are silently dropped by z.toJSONSchema(),
// so the rule is restated in `.describe()`, which does survive conversion —
// without it the generated catalog would tell an authoring agent that `href`
// is a bare string, inviting exactly the unsafe value this refine rejects.
export const URL_RULE = "Must be an http(s), mailto, tel, or relative URL.";

/** The ONLY sanctioned way to declare a URL prop. The .refine() enforces the
 * rule at build time; the .describe() is what carries it into catalog.json,
 * because z.toJSONSchema() silently drops refinements. Never hand-write this
 * pairing — a bare .refine() validates correctly and documents nothing. */
export const safeUrl = () =>
  z.string().min(1, "must not be blank").refine(isSafeUrl, URL_RULE).describe(URL_RULE);

const link = z.object({
  label: z.string(),
  href: safeUrl(),
});

/** A single image: a validated URL plus its alt text. `alt` defaults to ""
 * (decorative) rather than being required, matching the purely-visual images
 * ported from the design-preview sources this Block family draws on. */
const media = z.object({
  src: safeUrl(),
  alt: z.string().default(""),
});

export const heroSchema = z
  .object({
    variant: z.enum(["centered", "left"]).default("centered"),
    title: z.string(),
    subtitle: z.string().optional(),
    primary: link.optional(),
    secondary: link.optional(),
  })
  .describe(
    "The page-opening banner: a large headline, an optional supporting line, and up to two calls to action. Use once per page, at the top.",
  );
export type HeroProps = z.input<typeof heroSchema>;

export const ctaSchema = z
  .object({
    variant: z.enum(["boxed", "plain"]).default("boxed"),
    title: z.string(),
    body: z.string().optional(),
    primary: link.optional(),
  })
  .describe(
    "A closing prompt to take one action: a short heading, optional body text, and a single button.",
  );
export type CtaProps = z.input<typeof ctaSchema>;

export const featureGridSchema = z
  .object({
    title: z.string(),
    subtitle: z.string().optional(),
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .min(1),
  })
  .describe(
    "An unbordered grid of short title/description pairs enumerating several capabilities at a glance, with no icons or cards. Use mid-page to list what the product does when each point needs only a sentence.",
  );
export type FeatureGridProps = z.input<typeof featureGridSchema>;

export const featureSplitSchema = z
  .object({
    title: z.string(),
    body: z.string().optional(),
    points: z.array(z.string()).optional(),
    image: media,
  })
  .describe(
    "A two-column section pairing a headline, supporting copy, and an optional bullet list against a single supporting image. Use mid-page to explain one capability in more depth than a feature grid allows.",
  );
export type FeatureSplitProps = z.input<typeof featureSplitSchema>;

export const imageCardsSchema = z
  .object({
    title: z.string(),
    cards: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
          image: media,
        }),
      )
      .min(1),
  })
  .describe(
    "A row of cards, each pairing an image with a short title and body copy. Use to showcase several examples, case studies, or products side by side.",
  );
export type ImageCardsProps = z.input<typeof imageCardsSchema>;

/** The mosaic layout is a fixed 8-tile arrangement (2 wide tiles, 6 square),
 * not an authorable variant — the count is load-bearing for the component's
 * position-based tile sizing, so it is exported for tests to reference rather
 * than hard-coded twice. */
export const galleryImageCount = 8;

export const gallerySchema = z
  .object({
    title: z.string(),
    subtitle: z.string().optional(),
    images: z.array(media).length(galleryImageCount),
  })
  .describe(
    "An eight-image mosaic of varying tile sizes, for showcasing a set of visual assets (photography, product shots, wallpapers) rather than making an argument. Use when the goal is browsing images, not reading copy.",
  );
export type GalleryProps = z.input<typeof gallerySchema>;

// The registry the catalog generator reads. Keep in step with blockComponents
// in src/components/blocks/index.ts — a schema with no component renders
// nothing, and a component with no schema cannot be validated.
export const blockSchemas: Array<{ name: string; schema: z.ZodType }> = [
  { name: "Hero", schema: heroSchema },
  { name: "CTA", schema: ctaSchema },
  { name: "FeatureGrid", schema: featureGridSchema },
  { name: "FeatureSplit", schema: featureSplitSchema },
  { name: "ImageCards", schema: imageCardsSchema },
  { name: "Gallery", schema: gallerySchema },
];

// Validate a Block's props at render. Every Block calls this first, so invalid
// content fails the static build with a message naming the Block and each bad
// prop path — the authoring agent's only feedback channel.
export function parseBlock<S extends z.ZodType>(
  name: string,
  schema: S,
  raw: unknown,
): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`<${name}> received invalid props:\n${issues}`);
  }
  return result.data;
}
