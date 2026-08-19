import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  bannerSchema,
  blockSchemas,
  ctaBandSchema,
  faqSchema,
  featureGridSchema,
  featureSplitSchema,
  galleryImageCount,
  gallerySchema,
  heroSchema,
  imageCardsSchema,
  logoCloudSchema,
  media,
  newsletterSchema,
  parseBlock,
  pricingSchema,
  safeUrl,
  statsCount,
  statsSchema,
  teamSchema,
  testimonialSchema,
} from "./schemas.ts";

test("parseBlock returns parsed data for valid props", () => {
  const parsed = parseBlock("Hero", heroSchema, { title: "Hi" });
  assert.equal(parsed.title, "Hi");
});

test("parseBlock applies schema defaults", () => {
  const parsed = parseBlock("Hero", heroSchema, { title: "Hi" });
  assert.equal(parsed.variant, "centered");
});

test("parseBlock names the Block and the bad prop path", () => {
  assert.throws(
    () => parseBlock("Hero", heroSchema, { title: 42 }),
    (error: Error) => error.message.includes("<Hero>") && error.message.includes("title"),
  );
});

test("parseBlock rejects unknown variants", () => {
  assert.throws(() => parseBlock("Hero", heroSchema, { title: "Hi", variant: "nope" }), /variant/);
});

test("parseBlock rejects a link missing href", () => {
  assert.throws(
    () => parseBlock("Hero", heroSchema, { title: "Hi", primary: { label: "Go" } }),
    /href/,
  );
});

test("parseBlock rejects a missing required prop", () => {
  assert.throws(() => parseBlock("Hero", heroSchema, {}), /title/);
});

test("link schema rejects javascript: hrefs", () => {
  assert.throws(
    () =>
      parseBlock("Hero", heroSchema, {
        title: "x",
        primary: { label: "x", href: "javascript:alert(1)" },
      }),
    /href/,
  );
});

test("link schema rejects data: hrefs", () => {
  assert.throws(
    () =>
      parseBlock("Hero", heroSchema, {
        title: "x",
        primary: { label: "x", href: "data:text/html,x" },
      }),
    /href/,
  );
});

test("link schema accepts relative, https, and mailto hrefs", () => {
  for (const href of ["/about", "https://example.com", "mailto:a@b.com", "#section"]) {
    const parsed = parseBlock("Hero", heroSchema, { title: "x", primary: { label: "x", href } });
    assert.equal(parsed.primary?.href, href);
  }
});

test("the href URL rule survives into the JSON Schema", () => {
  const json = z.toJSONSchema(heroSchema, { io: "input" });
  assert.match(JSON.stringify(json), /http\(s\), mailto, tel, or relative/);
});

test("safeUrl always carries its rule into the JSON Schema", () => {
  const json = z.toJSONSchema(z.object({ u: safeUrl() }), { io: "input" });
  assert.match(JSON.stringify(json), /http\(s\), mailto, tel, or relative/);
});

// --- FeatureGrid --------------------------------------------------------

test("FeatureGrid parses valid props", () => {
  const parsed = parseBlock("FeatureGrid", featureGridSchema, {
    title: "Six pieces",
    lede: "Each doing one job well.",
    features: [{ title: "Block system", body: "Compose pages from Blocks." }],
  });
  assert.equal(parsed.features.length, 1);
});

test("FeatureGrid rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("FeatureGrid", featureGridSchema, {}),
    (error: Error) => error.message.includes("<FeatureGrid>") && error.message.includes("title"),
  );
});

test("FeatureGrid rejects an empty features array", () => {
  assert.throws(
    () => parseBlock("FeatureGrid", featureGridSchema, { title: "x", features: [] }),
    /features/,
  );
});

test("FeatureGrid rejects a feature missing its body", () => {
  assert.throws(
    () =>
      parseBlock("FeatureGrid", featureGridSchema, {
        title: "x",
        features: [{ title: "Only a title" }],
      }),
    /body/,
  );
});

// --- FeatureSplit --------------------------------------------------------

test("FeatureSplit parses valid props", () => {
  const parsed = parseBlock("FeatureSplit", featureSplitSchema, {
    title: "Every block ships with real content",
    lede: "Preview a block and it already reads like a finished page.",
    points: ["Ships with client-ready copy"],
    image: { src: "https://assets.ui.sh/screenshots/1.webp", alt: "" },
  });
  assert.equal(parsed.image.src, "https://assets.ui.sh/screenshots/1.webp");
});

test("FeatureSplit rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("FeatureSplit", featureSplitSchema, { title: "x" }),
    (error: Error) => error.message.includes("<FeatureSplit>") && error.message.includes("image"),
  );
});

test("FeatureSplit rejects an unsafe image URL", () => {
  assert.throws(
    () =>
      parseBlock("FeatureSplit", featureSplitSchema, {
        title: "x",
        image: { src: "javascript:alert(1)", alt: "" },
      }),
    /src/,
  );
});

// --- ImageCards --------------------------------------------------------

const threeCards = [
  {
    title: "Agency portfolio",
    body: "A five-page site for a three-person studio.",
    image: { src: "https://assets.ui.sh/screenshots/1.webp", alt: "" },
  },
  {
    title: "SaaS marketing site",
    body: "Pricing, changelog, and docs pulled from three sources.",
    image: { src: "https://assets.ui.sh/screenshots/2.webp", alt: "" },
  },
  {
    title: "Client rebrand",
    body: "Same block tree, new tokens.",
    image: { src: "https://assets.ui.sh/screenshots/3.webp", alt: "" },
  },
];

test("ImageCards parses valid props", () => {
  const parsed = parseBlock("ImageCards", imageCardsSchema, {
    title: "Built on the same six blocks.",
    cards: threeCards,
  });
  assert.equal(parsed.cards.length, 3);
});

test("ImageCards rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("ImageCards", imageCardsSchema, {}),
    (error: Error) => error.message.includes("<ImageCards>") && error.message.includes("title"),
  );
});

test("ImageCards rejects fewer than 3 cards (the grid is a fixed 3-column row)", () => {
  assert.throws(
    () => parseBlock("ImageCards", imageCardsSchema, { title: "x", cards: threeCards.slice(0, 2) }),
    /cards/,
  );
});

test("ImageCards rejects an unsafe card image URL", () => {
  assert.throws(
    () =>
      parseBlock("ImageCards", imageCardsSchema, {
        title: "x",
        cards: [
          ...threeCards.slice(0, 2),
          { title: "Card", body: "Body", image: { src: "javascript:alert(1)", alt: "" } },
        ],
      }),
    /src/,
  );
});

// --- Gallery --------------------------------------------------------

const eightImages = Array.from({ length: galleryImageCount }, (_, i) => ({
  src: `https://assets.ui.sh/wallpapers/landscapes.webp?variant=${i}`,
  alt: `Wallpaper ${i}`,
}));

test("Gallery parses valid props", () => {
  const parsed = parseBlock("Gallery", gallerySchema, {
    title: "Wallpapers, ready for a hero background.",
    images: eightImages,
  });
  assert.equal(parsed.images.length, galleryImageCount);
});

test("Gallery rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Gallery", gallerySchema, {}),
    (error: Error) => error.message.includes("<Gallery>") && error.message.includes("title"),
  );
});

test("Gallery rejects fewer than the required number of images", () => {
  assert.throws(
    () => parseBlock("Gallery", gallerySchema, { title: "x", images: eightImages.slice(0, 3) }),
    /images/,
  );
});

test("Gallery rejects an unsafe image URL", () => {
  assert.throws(
    () =>
      parseBlock("Gallery", gallerySchema, {
        title: "x",
        images: [{ src: "javascript:alert(1)", alt: "" }, ...eightImages.slice(1)],
      }),
    /src/,
  );
});

// --- Faq --------------------------------------------------------

test("Faq parses valid props", () => {
  const parsed = parseBlock("Faq", faqSchema, {
    title: "Questions",
    faqs: [{ question: "Is it free?", answer: "Yes." }],
  });
  assert.equal(parsed.faqs.length, 1);
});

test("Faq rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Faq", faqSchema, {}),
    (error: Error) => error.message.includes("<Faq>") && error.message.includes("title"),
  );
});

test("Faq rejects a faq entry missing its answer", () => {
  assert.throws(
    () => parseBlock("Faq", faqSchema, { title: "x", faqs: [{ question: "Only a question" }] }),
    /answer/,
  );
});

test("Faq rejects an empty faqs array", () => {
  assert.throws(() => parseBlock("Faq", faqSchema, { title: "x", faqs: [] }), /faqs/);
});

// --- Testimonial --------------------------------------------------------

const samplePerson = {
  name: "Jordan Ellis",
  role: "Creative Director",
  avatar: { src: "https://assets.ui.sh/avatars/3.webp", alt: "" },
};

const threePeople = [
  samplePerson,
  { ...samplePerson, name: "Casey Okafor" },
  { ...samplePerson, name: "Morgan Vale" },
];

const threeTestimonials = threePeople.map((person, i) => ({
  quote: `Quote number ${i + 1}.`,
  person,
}));

test("Testimonial parses valid props", () => {
  const parsed = parseBlock("Testimonial", testimonialSchema, {
    title: "What people say",
    testimonials: threeTestimonials,
  });
  assert.equal(parsed.testimonials.length, 3);
  assert.equal(parsed.testimonials[0].person.name, "Jordan Ellis");
});

test("Testimonial rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Testimonial", testimonialSchema, {}),
    (error: Error) => error.message.includes("<Testimonial>") && error.message.includes("title"),
  );
});

test("Testimonial rejects fewer than 3 testimonials (the grid is a fixed 3-column row)", () => {
  assert.throws(
    () =>
      parseBlock("Testimonial", testimonialSchema, {
        title: "x",
        testimonials: threeTestimonials.slice(0, 2),
      }),
    /testimonials/,
  );
});

test("Testimonial rejects an unsafe avatar URL", () => {
  assert.throws(
    () =>
      parseBlock("Testimonial", testimonialSchema, {
        title: "x",
        testimonials: [
          ...threeTestimonials.slice(0, 2),
          {
            quote: "q",
            person: { ...samplePerson, avatar: { src: "javascript:alert(1)", alt: "" } },
          },
        ],
      }),
    /src/,
  );
});

// --- LogoCloud --------------------------------------------------------

const sixLogos = Array.from({ length: 6 }, (_, i) => ({
  src: `https://assets.ui.sh/logos/logo-${i}.svg`,
  alt: `Logo ${i}`,
}));

test("LogoCloud parses valid props", () => {
  const parsed = parseBlock("LogoCloud", logoCloudSchema, {
    lede: "Powering marketing sites for teams like these.",
    logos: sixLogos,
  });
  assert.equal(parsed.logos.length, 6);
});

test("LogoCloud rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("LogoCloud", logoCloudSchema, {}),
    (error: Error) => error.message.includes("<LogoCloud>") && error.message.includes("lede"),
  );
});

test("LogoCloud rejects fewer than 6 logos (the grid is a fixed 6-column row)", () => {
  assert.throws(
    () => parseBlock("LogoCloud", logoCloudSchema, { lede: "x", logos: sixLogos.slice(0, 3) }),
    /logos/,
  );
});

test("LogoCloud rejects an unsafe logo URL", () => {
  assert.throws(
    () =>
      parseBlock("LogoCloud", logoCloudSchema, {
        lede: "x",
        logos: [...sixLogos.slice(0, 5), { src: "javascript:alert(1)", alt: "logo" }],
      }),
    /src/,
  );
});

// --- Team --------------------------------------------------------

test("Team parses valid props", () => {
  const parsed = parseBlock("Team", teamSchema, {
    title: "The team",
    team: threePeople,
  });
  assert.equal(parsed.team.length, 3);
});

test("Team rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Team", teamSchema, {}),
    (error: Error) => error.message.includes("<Team>") && error.message.includes("title"),
  );
});

test("Team rejects fewer than 3 members (the grid is a fixed 3-column row)", () => {
  assert.throws(
    () => parseBlock("Team", teamSchema, { title: "x", team: threePeople.slice(0, 2) }),
    /team/,
  );
});

test("Team rejects a person missing role", () => {
  assert.throws(
    () =>
      parseBlock("Team", teamSchema, {
        title: "x",
        team: [...threePeople.slice(0, 2), { name: "Jordan Reyes", avatar: samplePerson.avatar }],
      }),
    /role/,
  );
});

test("Team rejects an unsafe avatar URL", () => {
  assert.throws(
    () =>
      parseBlock("Team", teamSchema, {
        title: "x",
        team: [
          ...threePeople.slice(0, 2),
          { ...samplePerson, avatar: { src: "javascript:alert(1)", alt: "" } },
        ],
      }),
    /src/,
  );
});

test("Team's person schema carries no href field (no hover affordance)", () => {
  const parsed = parseBlock("Team", teamSchema, { title: "x", team: threePeople });
  assert.equal("href" in parsed.team[0], false);
});

// --- Stats --------------------------------------------------------

const fourStats = [
  { value: "12", label: "Blocks in the registry" },
  { value: "3.2 hrs", label: "Average time to reskin a site" },
  { value: "94%", label: "Sections shipped without custom code" },
  { value: "0kb", label: "Client JS shipped by default" },
];

test("Stats parses valid props", () => {
  const parsed = parseBlock("Stats", statsSchema, {
    title: "The numbers",
    stats: fourStats,
  });
  assert.equal(parsed.stats.length, statsCount);
});

test("Stats rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Stats", statsSchema, {}),
    (error: Error) => error.message.includes("<Stats>") && error.message.includes("title"),
  );
});

test("Stats rejects an empty stats array", () => {
  assert.throws(() => parseBlock("Stats", statsSchema, { title: "x", stats: [] }), /stats/);
});

test("Stats rejects a count other than exactly 4 (the row is a fixed 4-column divided layout)", () => {
  assert.throws(
    () => parseBlock("Stats", statsSchema, { title: "x", stats: fourStats.slice(0, 3) }),
    /stats/,
  );
  assert.throws(
    () =>
      parseBlock("Stats", statsSchema, {
        title: "x",
        stats: [...fourStats, { value: "5", label: "One too many" }],
      }),
    /stats/,
  );
});

test("Stats rejects a stat missing its value", () => {
  assert.throws(
    () => parseBlock("Stats", statsSchema, { title: "x", stats: [{ label: "Only a label" }] }),
    /value/,
  );
});

// --- Banner --------------------------------------------------------------

test("Banner parses valid props", () => {
  const parsed = parseBlock("Banner", bannerSchema, {
    message: "Now shipping: the Harbour block system.",
    link: { label: "Explore the blocks", href: "/blocks-gallery" },
  });
  assert.equal(parsed.message, "Now shipping: the Harbour block system.");
  assert.equal(parsed.link?.href, "/blocks-gallery");
});

test("Banner parses without the optional link", () => {
  const parsed = parseBlock("Banner", bannerSchema, { message: "Scheduled maintenance tonight." });
  assert.equal(parsed.link, undefined);
});

test("Banner rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Banner", bannerSchema, {}),
    (error: Error) => error.message.includes("<Banner>") && error.message.includes("message"),
  );
});

test("Banner rejects an unsafe link URL", () => {
  assert.throws(
    () =>
      parseBlock("Banner", bannerSchema, {
        message: "x",
        link: { label: "Go", href: "javascript:alert(1)" },
      }),
    /href/,
  );
});

// --- Newsletter ------------------------------------------------------------

test("Newsletter parses valid props", () => {
  const parsed = parseBlock("Newsletter", newsletterSchema, {
    title: "Get notified when new blocks ship.",
    lede: "One email a month.",
    action: "https://forms.example.com/subscribe",
  });
  assert.equal(parsed.action, "https://forms.example.com/subscribe");
});

test("Newsletter applies the buttonLabel default", () => {
  const parsed = parseBlock("Newsletter", newsletterSchema, {
    title: "x",
    action: "/subscribe",
  });
  assert.equal(parsed.buttonLabel, "Subscribe");
});

test("Newsletter rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Newsletter", newsletterSchema, { title: "x" }),
    (error: Error) => error.message.includes("<Newsletter>") && error.message.includes("action"),
  );
});

test("Newsletter rejects an unsafe action URL", () => {
  assert.throws(
    () =>
      parseBlock("Newsletter", newsletterSchema, {
        title: "x",
        action: "javascript:alert(1)",
      }),
    /action/,
  );
});

test("the action URL rule survives into the JSON Schema", () => {
  const json = z.toJSONSchema(newsletterSchema, { io: "input" });
  assert.match(JSON.stringify(json), /http\(s\), mailto, tel, or relative/);
});

// --- Pricing --------------------------------------------------------

test("Pricing parses valid props", () => {
  const parsed = parseBlock("Pricing", pricingSchema, {
    title: "One template, three ways to license it.",
    lede: "Start free, upgrade the day you take on a second client.",
    plans: [
      {
        title: "Starter",
        price: "Free",
        body: "For a single portfolio or personal project.",
        features: ["1 site", "Full block library"],
        cta: { label: "Clone the repo", href: "/pricing" },
      },
      {
        title: "Studio",
        price: "$249",
        period: "one-time",
        body: "For agencies shipping client sites every month.",
        features: ["Unlimited sites", "Priority support"],
        cta: { label: "Get Studio", href: "/pricing" },
        emphasized: true,
      },
    ],
  });
  assert.equal(parsed.plans.length, 2);
  assert.equal(parsed.plans[1].emphasized, true);
});

test("Pricing applies the emphasized default", () => {
  const parsed = parseBlock("Pricing", pricingSchema, {
    title: "x",
    plans: [{ title: "Starter", price: "Free" }],
  });
  assert.equal(parsed.plans[0].emphasized, false);
});

test("Pricing rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Pricing", pricingSchema, {}),
    (error: Error) => error.message.includes("<Pricing>") && error.message.includes("title"),
  );
});

test("Pricing rejects a plan missing its price", () => {
  assert.throws(
    () => parseBlock("Pricing", pricingSchema, { title: "x", plans: [{ title: "Starter" }] }),
    /price/,
  );
});

test("Pricing rejects an empty plans array", () => {
  assert.throws(() => parseBlock("Pricing", pricingSchema, { title: "x", plans: [] }), /plans/);
});

test("Pricing rejects an unsafe plan CTA href", () => {
  assert.throws(
    () =>
      parseBlock("Pricing", pricingSchema, {
        title: "x",
        plans: [
          {
            title: "Starter",
            price: "Free",
            cta: { label: "Go", href: "javascript:alert(1)" },
          },
        ],
      }),
    /href/,
  );
});

test("the plan CTA URL rule survives into the JSON Schema", () => {
  const json = z.toJSONSchema(pricingSchema, { io: "input" });
  assert.match(JSON.stringify(json), /http\(s\), mailto, tel, or relative/);
});

// --- CTA (ctaBandSchema) --------------------------------------------------

test("CTA band parses valid props", () => {
  const parsed = parseBlock("CTA", ctaBandSchema, {
    title: "Your next client site starts from Harbour.",
    lede: "Six Blocks, one token file, zero lock-in.",
    primary: { label: "Clone the repo", href: "https://github.com" },
  });
  assert.equal(parsed.primary.label, "Clone the repo");
});

test("CTA band requires primary (no variant without a button to fall back on)", () => {
  assert.throws(
    () => parseBlock("CTA", ctaBandSchema, { title: "x" }),
    (error: Error) => error.message.includes("<CTA>") && error.message.includes("primary"),
  );
});

test("CTA band rejects a primary link missing href", () => {
  assert.throws(
    () => parseBlock("CTA", ctaBandSchema, { title: "x", primary: { label: "Go" } }),
    /href/,
  );
});

test("CTA band rejects an unsafe primary URL", () => {
  assert.throws(
    () =>
      parseBlock("CTA", ctaBandSchema, {
        title: "x",
        primary: { label: "Go", href: "javascript:alert(1)" },
      }),
    /href/,
  );
});

// --- media.src host allowlist (review finding I9) -------------------------
//
// next.config.mjs's images.remotePatterns allows exactly three hosts. A
// media src outside that list used to pass this schema (it only checked for
// a generally safe URL) and fail only at RENDER, when next/image throws for
// a host it isn't configured for — the worst failure ordering, since the
// catalog, Zod, and the content lockdown would all have said the page was
// fine. These tests pin the schema to the same three hosts next.config.mjs
// allows, so the two can't silently drift apart.

test("media accepts a relative path", () => {
  const parsed = media.parse({ src: "/images/hero.jpg" });
  assert.equal(parsed.src, "/images/hero.jpg");
});

test("media accepts each host next.config.mjs allows", () => {
  for (const src of [
    "https://images.unsplash.com/photo-1",
    "https://assets.ui.sh/screenshots/1.webp",
    "https://my-app.public.blob.vercel-storage.com/upload.png",
  ]) {
    const parsed = media.parse({ src });
    assert.equal(parsed.src, src);
  }
});

test("media rejects a host next.config.mjs does not allow", () => {
  assert.throws(() => media.parse({ src: "https://evil.example.com/x.png" }), /src/);
});

test("media rejects http (next.config.mjs remotePatterns is https-only)", () => {
  assert.throws(() => media.parse({ src: "http://assets.ui.sh/x.png" }), /src/);
});

test("media rejects a vercel-storage lookalike host", () => {
  assert.throws(
    () => media.parse({ src: "https://public.blob.vercel-storage.com.evil.com/x.png" }),
    /src/,
  );
});

test("the media src host rule names the allowed hosts and survives into the JSON Schema", () => {
  const json = z.toJSONSchema(media, { io: "input" });
  const text = JSON.stringify(json);
  assert.match(text, /images\.unsplash\.com/);
  assert.match(text, /assets\.ui\.sh/);
  assert.match(text, /public\.blob\.vercel-storage\.com/);
});

// --- registry guard (review finding I7) -----------------------------------
//
// Of the four Block touch points — schema, component, registry, catalog —
// schema<->component pairing was the only one with no automated check. A
// schema with no component renders nothing; a component with no schema is
// never validated. blockComponents lives in a .tsx file Node's
// --experimental-strip-types cannot import (JSX isn't type syntax, so trying
// throws "Unknown file extension .tsx"), so this test reads that file's
// SOURCE and extracts the registry object's key names instead of importing
// it — a mismatch here would still be caught by tsc separately, since
// mdx-content.tsx types blockComponents against the same component set.

const componentsIndexPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "components",
  "blocks",
  "index.ts",
);

function extractBlockComponentNames(source: string): string[] {
  const match = source.match(/export const blockComponents[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!match) {
    throw new Error(
      "Could not find the blockComponents object literal in src/components/blocks/index.ts — has its shape changed?",
    );
  }
  return match[1]
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.split(":")[0].trim());
}

test("blockSchemas and blockComponents register the exact same Block names", () => {
  const schemaNames = new Set(blockSchemas.map(({ name }) => name));
  const componentNames = new Set(
    extractBlockComponentNames(readFileSync(componentsIndexPath, "utf8")),
  );

  const noComponent = [...schemaNames].filter((name) => !componentNames.has(name));
  const noSchema = [...componentNames].filter((name) => !schemaNames.has(name));

  assert.deepEqual(
    noComponent,
    [],
    `Block(s) in blockSchemas with no matching blockComponents entry (renders nothing): ${noComponent.join(", ")}`,
  );
  assert.deepEqual(
    noSchema,
    [],
    `Block(s) in blockComponents with no matching blockSchemas entry (unvalidated): ${noSchema.join(", ")}`,
  );
});
