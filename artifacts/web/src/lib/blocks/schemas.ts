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

const link = z.object({
  label: z.string(),
  href: z
    .string()
    .min(1, "href must not be blank")
    .refine(isSafeUrl, "href must be http(s), mailto, tel, or a relative URL")
    .describe(URL_RULE),
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
