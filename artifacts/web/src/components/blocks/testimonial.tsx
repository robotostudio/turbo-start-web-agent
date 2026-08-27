import Image from "next/image";
import { parseBlock, type TestimonialProps, testimonialSchema } from "@/lib/blocks/schemas";
import { SectionHeader } from "./section-header";

export function Testimonial(raw: TestimonialProps) {
  const { title, testimonials } = parseBlock("Testimonial", testimonialSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset section-y">
        <SectionHeader title={title} />
        <ul className="stack-content grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.person.name}
              className="flex flex-col justify-between gap-8 card p-6 sm:p-8"
            >
              <blockquote>
                <p className="type-lead text-foreground">{testimonial.quote}</p>
              </blockquote>
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.person.avatar.src}
                  alt={testimonial.person.avatar.alt}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full outline-1 -outline-offset-1 outline-foreground/5"
                />
                <div>
                  <div className="type-caption font-semibold text-foreground">
                    {testimonial.person.name}
                  </div>
                  <div className="type-caption text-muted-foreground">
                    {testimonial.person.role}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
