import Image from "next/image";
import { featuredTestimonial } from "@/components/design-preview/data";

// Direction: Even Field, single quote as the whole section. Real type
// scale carries it — no heading group above, the quote is the statement.
// Hanging punctuation per testimonials.md.
export function TestimonialFeatured() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <figure>
          <blockquote>
            <p className="relative max-w-md text-3xl font-semibold tracking-tight text-balance text-foreground before:absolute before:inline before:-translate-x-full before:content-['\201C'] after:inline after:content-['\201D'] sm:text-4xl">
              {featuredTestimonial.quote}
            </p>
          </blockquote>
          <figcaption className="mt-10 flex items-center gap-4">
            <Image
              src={featuredTestimonial.avatar}
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full outline-1 -outline-offset-1 outline-black/5"
            />
            <div>
              <div className="font-semibold text-foreground">{featuredTestimonial.name}</div>
              <div className="text-muted-foreground">{featuredTestimonial.role}</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
