import Link from "next/link";
import { type BannerProps, bannerSchema, parseBlock } from "@/lib/blocks/schemas";

export function Banner(raw: BannerProps) {
  const { message, link } = parseBlock("Banner", bannerSchema, raw);

  return (
    <section className="bg-primary font-sans">
      <div className="page-inset flex flex-col items-center gap-1 py-3 text-center sm:flex-row sm:justify-center sm:gap-3">
        <p className="text-sm text-primary-foreground">{message}</p>
        {link &&
          (link.href.startsWith("/") ? (
            <Link
              href={link.href}
              className="text-sm font-medium text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/80"
            >
              {link.label}
            </Link>
          ) : (
            <a
              href={link.href}
              className="text-sm font-medium text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/80"
            >
              {link.label}
            </a>
          ))}
      </div>
    </section>
  );
}
