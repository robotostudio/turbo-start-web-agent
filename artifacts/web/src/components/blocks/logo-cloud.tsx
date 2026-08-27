import Image from "next/image";
import { type LogoCloudProps, logoCloudSchema, parseBlock } from "@/lib/blocks/schemas";

export function LogoCloud(raw: LogoCloudProps) {
  const { lede, logos } = parseBlock("LogoCloud", logoCloudSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <p className="max-w-md text-lg text-pretty text-muted-foreground">{lede}</p>
        <div className="relative mt-10 overflow-hidden sm:mt-14">
          <div className="flex w-max items-center gap-12 motion-safe:animate-marquee">
            <ul className="flex shrink-0 items-center gap-12">
              {logos.map((logo) => (
                <li key={logo.src} className="flex shrink-0">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={28}
                    unoptimized
                    className="h-7 w-auto"
                  />
                </li>
              ))}
            </ul>
            <ul
              className="flex shrink-0 items-center gap-12 motion-reduce:hidden"
              aria-hidden="true"
            >
              {logos.map((logo) => (
                <li key={`${logo.src}-duplicate`} className="flex shrink-0">
                  <Image
                    src={logo.src}
                    alt=""
                    width={120}
                    height={28}
                    unoptimized
                    className="h-7 w-auto"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
