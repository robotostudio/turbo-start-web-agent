import { cva, type VariantProps } from "class-variance-authority";

// The button's styling, in its own module so that using it costs nothing at
// runtime.
//
// `button.tsx` renders Base UI's Button, which is marked `'use client'`, so
// anything importing from that file pulls a client boundary in with it — even
// when all it wants is the class strings. That is not theoretical: adding the
// gallery's ButtonMatrix put `@base-ui/react/button` into the client reference
// manifest for the `[...slug]` route, on a site whose homepage advertises that
// Blocks ship no client JavaScript by default.
//
// So a Block styles a link with `buttonVariants({ variant, size })` and stays
// a server component. `<Button>` stays available for anything that genuinely
// needs Base UI's button behaviour — no Block does, because every one of them
// renders a link rather than a button.

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding shadow-(--shadow-button) text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // The comp fills the primary button with a shallow two-stop gradient
        // rather than a flat colour, and rings it in the accent with a close
        // halo. Both stops are mixed from --primary rather than pinned to the
        // measured values, so re-theming the accent carries the button with it.
        default:
          "border-primary bg-[linear-gradient(in_oklab_180deg,color-mix(in_oklab,var(--primary),black_1.5%),color-mix(in_oklab,var(--primary),white_1.5%))] text-primary-foreground shadow-(--shadow-button-primary) hover:brightness-110",
        // --input, not --border: the comp draws a control's edge heavier than a
        // section rule, which is the distinction the two tokens were split for
        // when the dark palette landed.
        outline:
          "border-input bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        // Added to the stock shadcn sizes, which top out at h-9 because they
        // are drawn for application UI. A marketing page's primary call to
        // action sits under a 5xl heading and has to hold its own there: this
        // is the size the Hero, CTA, Pricing, and Newsletter Blocks reach for.
        marketing: "h-11 gap-2 px-5 text-sm",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export { buttonVariants };
