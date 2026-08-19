import Image from "next/image";
import { type LogoCloudProps, logoCloudSchema, parseBlock } from "@/lib/blocks/schemas";

export function LogoCloud(raw: LogoCloudProps) {
  const { lede, logos } = parseBlock("LogoCloud", logoCloudSchema, raw);

  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <p className="max-w-md text-lg text-pretty text-muted-foreground">{lede}</p>
        <div className="mt-10 grid grid-cols-3 items-center gap-x-8 gap-y-10 sm:mt-14 sm:grid-cols-6">
          {logos.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={120}
              height={28}
              unoptimized
              className="h-7 w-auto justify-self-center"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
