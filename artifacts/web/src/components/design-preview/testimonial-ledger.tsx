import Image from "next/image";
import { testimonials } from "@/components/design-preview/data";

// Direction: contrast variant — Ledger rhythm, denser than the rest of the
// set. Four quotes stacked with divider rows; attribution sits beside the
// quote in a fixed-width column instead of below it, with a mono role
// label carrying real information (their title).
export function TestimonialLedger() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          Client feedback, on the record.
        </h2>
        <ul className="mt-14 divide-y divide-foreground/10 border-t border-foreground/10 sm:mt-20">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.name}
              className="flex flex-col gap-4 py-8 first:pt-0 last:pb-0 sm:flex-row sm:gap-10"
            >
              <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                <Image
                  src={testimonial.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full outline-1 -outline-offset-1 outline-black/5"
                />
                <div>
                  <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              <blockquote>
                <p className="relative max-w-prose text-lg text-pretty text-foreground before:absolute before:inline before:-translate-x-full before:content-['\201C'] after:inline after:content-['\201D']">
                  {testimonial.quote}
                </p>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
