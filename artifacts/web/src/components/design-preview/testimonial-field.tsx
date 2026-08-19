import Image from "next/image";
import { testimonials } from "@/components/design-preview/data";

// Direction: Even Field, multi-quote. Three quotes in a symmetric row,
// modest type scale, whitespace alone separates columns. Attribution
// bottom-aligns across equal-height columns per testimonials.md.
export function TestimonialField() {
  const featured = testimonials.slice(0, 3);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground">
          What agencies say once they&apos;ve shipped a client site.
        </h2>
        <ul className="mt-16 grid grid-cols-1 gap-x-10 gap-y-14 sm:mt-20 sm:grid-cols-3">
          {featured.map((testimonial) => (
            <li key={testimonial.name} className="flex flex-col justify-between gap-8">
              <blockquote>
                <p className="relative max-w-xs text-lg text-pretty text-foreground before:absolute before:inline before:-translate-x-full before:content-['\201C'] after:inline after:content-['\201D']">
                  {testimonial.quote}
                </p>
              </blockquote>
              <div className="flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full outline-1 -outline-offset-1 outline-black/5"
                />
                <div>
                  <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
