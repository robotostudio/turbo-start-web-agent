import { SiteLink } from "@/components/site/site-link";
import { type ButtonVariants, buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

// A link that looks like a button — which is what every call to action on this
// site actually is. None of them submit anything or open a menu; they navigate.
//
// Two duplications end here. The button classes come from `buttonVariants`
// rather than being retyped per Block, and the internal-vs-external branching
// comes from `SiteLink`, which four Blocks were each carrying their own copy
// of: `href.startsWith("/") ? <Link> : <a>`, written out twice per Block for
// the two branches. Getting that wrong is the navbar bug all over again — a
// relative href on a bare `<a>` is a full page load instead of a client-side
// navigation.
//
// Deliberately not Base UI's `<Button render={<Link />}>`: that module is
// marked `'use client'` and every Block here is a server component. See the
// note in button-variants.ts.
export function ButtonLink({
  href,
  label,
  variant = "default",
  size = "marketing",
  className,
}: {
  href: string;
  label: string;
  className?: string;
} & ButtonVariants) {
  return (
    <SiteLink href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {label}
    </SiteLink>
  );
}
