// The button primitive, from `npx shadcn@latest add button` on this project's
// components.json (Base UI, base-nova style) — deliberately close to stock, so
// that `shadcn add` keeps working for adopters and anything else they pull in
// matches. Two deviations, both marked below: the `marketing` size, and this
// note.
//
// Blocks do NOT import this file. They import `buttonVariants` from
// ./button-variants directly and apply it to a link, because this module
// pulls in Base UI's `'use client'` Button and every Block is a server
// component. See the note in button-variants.ts.
//
// See the ButtonMatrix on /blocks-gallery for every variant and size
// rendered live.

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type ButtonVariants, buttonVariants } from "@/components/ui/button-variants";

import { cn } from "@/lib/utils";

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & ButtonVariants) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
