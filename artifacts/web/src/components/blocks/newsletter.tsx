import { buttonVariants } from "@/components/ui/button-variants";
import { type NewsletterProps, newsletterSchema, parseBlock } from "@/lib/blocks/schemas";
import { cn } from "@/lib/utils";

export function Newsletter(raw: NewsletterProps) {
  const { title, lede, action, buttonLabel } = parseBlock("Newsletter", newsletterSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <h2 className="mx-auto max-w-lg text-3xl font-semibold tracking-tight text-balance text-foreground">
              {title}
            </h2>
            {lede && (
              <p className="mx-auto mt-3 max-w-sm text-lg text-pretty text-muted-foreground">
                {lede}
              </p>
            )}
          </div>
          <form
            method="post"
            action={action}
            className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3 text-base text-foreground placeholder:text-muted-foreground"
            />
            {/* The one button on the site that is genuinely a button rather
                than a link, so it takes the classes directly instead of going
                through ButtonLink. */}
            <button type="submit" className={cn("shrink-0", buttonVariants({ size: "marketing" }))}>
              {buttonLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
