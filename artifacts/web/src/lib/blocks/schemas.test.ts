import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import {
  bannerSchema,
  ctaBandSchema,
  faqSchema,
  featureGridSchema,
  featureSplitSchema,
  galleryImageCount,
  gallerySchema,
  heroSchema,
  imageCardsSchema,
  logoCloudSchema,
  newsletterSchema,
  parseBlock,
  pricingSchema,
  safeUrl,
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
    subtitle: "Each doing one job well.",
    features: [{ title: "Block system", description: "Compose pages from Blocks." }],
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

test("FeatureGrid rejects a feature missing its description", () => {
  assert.throws(
    () =>
      parseBlock("FeatureGrid", featureGridSchema, {
        title: "x",
        features: [{ title: "Only a title" }],
      }),
    /description/,
  );
});

// --- FeatureSplit --------------------------------------------------------

test("FeatureSplit parses valid props", () => {
  const parsed = parseBlock("FeatureSplit", featureSplitSchema, {
    title: "Every block ships with real content",
    body: "Preview a block and it already reads like a finished page.",
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

test("ImageCards parses valid props", () => {
  const parsed = parseBlock("ImageCards", imageCardsSchema, {
    title: "Built on the same six blocks.",
    cards: [
      {
        title: "Agency portfolio",
        body: "A five-page site for a three-person studio.",
        image: { src: "https://assets.ui.sh/screenshots/1.webp", alt: "" },
      },
    ],
  });
  assert.equal(parsed.cards.length, 1);
});

test("ImageCards rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("ImageCards", imageCardsSchema, {}),
    (error: Error) => error.message.includes("<ImageCards>") && error.message.includes("title"),
  );
});

test("ImageCards rejects an unsafe card image URL", () => {
  assert.throws(
    () =>
      parseBlock("ImageCards", imageCardsSchema, {
        title: "x",
        cards: [
          {
            title: "Card",
            body: "Body",
            image: { src: "javascript:alert(1)", alt: "" },
          },
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

test("Testimonial parses valid props", () => {
  const parsed = parseBlock("Testimonial", testimonialSchema, {
    title: "What people say",
    testimonials: [{ quote: "Great template.", person: samplePerson }],
  });
  assert.equal(parsed.testimonials.length, 1);
  assert.equal(parsed.testimonials[0].person.name, "Jordan Ellis");
});

test("Testimonial rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Testimonial", testimonialSchema, {}),
    (error: Error) => error.message.includes("<Testimonial>") && error.message.includes("title"),
  );
});

test("Testimonial rejects an unsafe avatar URL", () => {
  assert.throws(
    () =>
      parseBlock("Testimonial", testimonialSchema, {
        title: "x",
        testimonials: [
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

test("LogoCloud parses valid props", () => {
  const parsed = parseBlock("LogoCloud", logoCloudSchema, {
    lede: "Powering marketing sites for teams like these.",
    logos: [{ src: "https://assets.ui.sh/logos/align.svg", alt: "align" }],
  });
  assert.equal(parsed.logos.length, 1);
});

test("LogoCloud rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("LogoCloud", logoCloudSchema, {}),
    (error: Error) => error.message.includes("<LogoCloud>") && error.message.includes("lede"),
  );
});

test("LogoCloud rejects an empty logos array", () => {
  assert.throws(() => parseBlock("LogoCloud", logoCloudSchema, { lede: "x", logos: [] }), /logos/);
});

test("LogoCloud rejects an unsafe logo URL", () => {
  assert.throws(
    () =>
      parseBlock("LogoCloud", logoCloudSchema, {
        lede: "x",
        logos: [{ src: "javascript:alert(1)", alt: "logo" }],
      }),
    /src/,
  );
});

// --- Team --------------------------------------------------------

test("Team parses valid props", () => {
  const parsed = parseBlock("Team", teamSchema, {
    title: "The team",
    team: [samplePerson],
  });
  assert.equal(parsed.team.length, 1);
});

test("Team rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("Team", teamSchema, {}),
    (error: Error) => error.message.includes("<Team>") && error.message.includes("title"),
  );
});

test("Team rejects a person missing role", () => {
  assert.throws(
    () =>
      parseBlock("Team", teamSchema, {
        title: "x",
        team: [{ name: "Jordan Reyes", avatar: samplePerson.avatar }],
      }),
    /role/,
  );
});

test("Team rejects an unsafe avatar URL", () => {
  assert.throws(
    () =>
      parseBlock("Team", teamSchema, {
        title: "x",
        team: [{ ...samplePerson, avatar: { src: "javascript:alert(1)", alt: "" } }],
      }),
    /src/,
  );
});

test("Team's person schema carries no href field (no hover affordance)", () => {
  const parsed = parseBlock("Team", teamSchema, { title: "x", team: [samplePerson] });
  assert.equal("href" in parsed.team[0], false);
});

// --- Stats --------------------------------------------------------

test("Stats parses valid props", () => {
  const parsed = parseBlock("Stats", statsSchema, {
    title: "The numbers",
    stats: [{ value: "12", label: "Blocks in the registry" }],
  });
  assert.equal(parsed.stats.length, 1);
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
    subtitle: "One email a month.",
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
    subtitle: "Start free, upgrade the day you take on a second client.",
    plans: [
      {
        name: "Starter",
        price: "Free",
        description: "For a single portfolio or personal project.",
        features: ["1 site", "Full block library"],
        cta: { label: "Clone the repo", href: "/pricing" },
      },
      {
        name: "Studio",
        price: "$249",
        period: "one-time",
        description: "For agencies shipping client sites every month.",
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
    plans: [{ name: "Starter", price: "Free" }],
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
    () => parseBlock("Pricing", pricingSchema, { title: "x", plans: [{ name: "Starter" }] }),
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
            name: "Starter",
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
    body: "Six Blocks, one token file, zero lock-in.",
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
