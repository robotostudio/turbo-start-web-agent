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

export const link = z.object({
  label: z.string(),
  href: safeUrl(),
});

/** A single image: a validated URL plus its alt text. `alt` defaults to ""
 * (decorative) rather than being required, matching the purely-visual images
 * ported from the design-preview sources this Block family draws on. */
export const media = z.object({
  src: safeUrl(),
  alt: z.string().default(""),
});

/** A named individual: display name, role/title, and a photo. Deliberately
 * carries no `href` — Team (the first Block to use this) is a settled
 * decision to have no per-member link, since no team member is a link and
 * there are no bio pages, so any other Block reusing `person` inherits the
 * same no-link shape rather than each reinventing it. */
export const person = z.object({
  name: z.string(),
  role: z.string(),
  avatar: media,
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

export const bannerSchema = z
  .object({
    message: z.string(),
    link: link.optional(),
  })
  .describe(
    "A full-bleed, brand-colored strip pinned above the page content, carrying one short announcement and an optional link. Use for a single site-wide notice — a launch, an incident, a promotion — not for content that repeats or scrolls.",
  );
export type BannerProps = z.input<typeof bannerSchema>;

export const ctaBandSchema = z
  .object({
    title: z.string(),
    body: z.string().optional(),
    primary: link,
  })
  .describe(
    "A full-bleed, brand-colored closing band with a heading, optional supporting copy, and a single button — the highest-contrast CTA treatment available. Use as the last section on a page for the strongest possible visual close.",
  );
export type CtaBandProps = z.input<typeof ctaBandSchema>;

export const newsletterSchema = z
  .object({
    title: z.string(),
    subtitle: z.string().optional(),
    action: safeUrl(),
    buttonLabel: z.string().default("Subscribe"),
  })
  .describe(
    "A centered heading over a native email-capture form (no client JavaScript) that posts to a URL you provide. Use to grow an email list without embedding a third-party widget.",
  );
export type NewsletterProps = z.input<typeof newsletterSchema>;

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

export const faqSchema = z
  .object({
    title: z.string(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .min(1),
  })
  .describe(
    "A single-column list of question/answer pairs, question and answer sharing a line at wider widths. Use to pre-empt objections or answer common questions, typically ahead of a closing CTA.",
  );
export type FaqProps = z.input<typeof faqSchema>;

export const testimonialSchema = z
  .object({
    title: z.string(),
    testimonials: z
      .array(
        z.object({
          quote: z.string(),
          person,
        }),
      )
      .min(1),
  })
  .describe(
    "A row of short customer quotes, each attributed to a named person with their role and photo. Use to build trust with third-party praise rather than first-party claims.",
  );
export type TestimonialProps = z.input<typeof testimonialSchema>;

export const logoCloudSchema = z
  .object({
    lede: z.string(),
    logos: z.array(media).min(1),
  })
  .describe(
    "A row of customer or partner logos under a short line of supporting text, no heading. Use to signal adoption or social proof without making an argument.",
  );
export type LogoCloudProps = z.input<typeof logoCloudSchema>;

export const teamSchema = z
  .object({
    title: z.string(),
    team: z.array(person).min(1),
  })
  .describe(
    "A grid of team member photos with name and role beneath each. Carries no links or hover state — use to put faces to an organization, not when members have individual bio pages.",
  );
export type TeamProps = z.input<typeof teamSchema>;

export const statsSchema = z
  .object({
    title: z.string(),
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .min(1),
  })
  .describe(
    "A row of large numeric stats, each with a short label, divided at wider widths. Use to make a quantitative case — scale, results, usage — at a glance.",
  );
export type StatsProps = z.input<typeof statsSchema>;

export const pricingSchema = z
  .object({
    title: z.string(),
    subtitle: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          description: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: link.optional(),
          emphasized: z.boolean().default(false),
        }),
      )
      .min(1),
  })
  .describe(
    "A row of pricing plan cards, each with a name, price, optional feature list, and call to action, with one plan visually raised as the recommended choice — the only bordered, carded Block in this set. Use to compare plan tiers side by side on a pricing page or section; not for a single fixed price.",
  );
export type PricingProps = z.input<typeof pricingSchema>;

// The registry the catalog generator reads. Keep in step with blockComponents
// in src/components/blocks/index.ts — a schema with no component renders
// nothing, and a component with no schema cannot be validated.
export const blockSchemas: Array<{ name: string; schema: z.ZodType }> = [
  { name: "Banner", schema: bannerSchema },
  { name: "Hero", schema: heroSchema },
  { name: "CTA", schema: ctaBandSchema },
  { name: "FeatureGrid", schema: featureGridSchema },
  { name: "FeatureSplit", schema: featureSplitSchema },
  { name: "ImageCards", schema: imageCardsSchema },
  { name: "Gallery", schema: gallerySchema },
  { name: "Faq", schema: faqSchema },
  { name: "Testimonial", schema: testimonialSchema },
  { name: "LogoCloud", schema: logoCloudSchema },
  { name: "Team", schema: teamSchema },
  { name: "Stats", schema: statsSchema },
  { name: "Newsletter", schema: newsletterSchema },
  { name: "Pricing", schema: pricingSchema },
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
