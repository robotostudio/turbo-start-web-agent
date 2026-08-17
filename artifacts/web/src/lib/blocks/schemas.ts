import { z } from "zod";

// One Block = one schema here + one component + one registry entry. Variants
// are z.enum([...]).default(...), so this file shows an author every allowed
// value and its default.

const link = z.object({
  label: z.string(),
  href: z.string().min(1, "href must not be blank"),
});

export const heroSchema = z.object({
  variant: z.enum(["centered", "left"]).default("centered"),
  title: z.string(),
  subtitle: z.string().optional(),
  primary: link.optional(),
  secondary: link.optional(),
});
export type HeroProps = z.input<typeof heroSchema>;

export const ctaSchema = z.object({
  variant: z.enum(["boxed", "plain"]).default("boxed"),
  title: z.string(),
  body: z.string().optional(),
  primary: link.optional(),
});
export type CtaProps = z.input<typeof ctaSchema>;

// The registry the catalog generator reads. Keep in step with blockComponents
// in src/components/blocks/index.ts — a schema with no component renders
// nothing, and a component with no schema cannot be validated.
export const blockSchemas: Array<{ name: string; schema: z.ZodType }> = [
  { name: "Hero", schema: heroSchema },
  { name: "CTA", schema: ctaSchema },
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
