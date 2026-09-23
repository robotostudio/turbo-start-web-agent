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
  featuredQuoteSchema,
  featureGridSchema,
  featureRowsCount,
  featureRowsSchema,
  featureSplitSchema,
  galleryImageCount,
  gallerySchema,
  heroSchema,
  imageCardsSchema,
  ledgerMarkIds,
  logoCloudSchema,
  media,
  newsletterSchema,
  parseBlock,
  postGridMaxCount,
  postGridSchema,
  previewStageSchema,
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
  assert.equal(parsed.variant, "showcase");
  assert.equal(parsed.agentsLabel, "Edit with agents");
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

// Uses CTA rather than Hero: Hero's `title` became optional when the showcase
// variant landed, since the home comp's hero opens on the lede and carries no
// headline. CTA still requires both a title and a primary link.
test("parseBlock rejects a missing required prop", () => {
  assert.throws(() => parseBlock("CTA", ctaBandSchema, {}), /title/);
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

// --- FeatureRows --------------------------------------------------------

const threeRows = [
  { title: "Block system", body: "Compose pages from a library of finished sections." },
  { title: "Content lives in git", body: "Pages are plain-text MDX, so a change is diffable." },
  { title: "One token file", body: "Rebrand a site by editing a handful of CSS variables." },
];

test("FeatureRows parses valid props", () => {
  const parsed = parseBlock("FeatureRows", featureRowsSchema, {
    eyebrow: "What you get",
    title: "A template that stays out of your way",
    rows: threeRows,
  });
  assert.equal(parsed.rows.length, featureRowsCount);
});

test("FeatureRows rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("FeatureRows", featureRowsSchema, { rows: threeRows }),
    (error: Error) => error.message.includes("<FeatureRows>") && error.message.includes("title"),
  );
});

test("FeatureRows rejects a count other than exactly 3 (each row's art is fixed by position)", () => {
  assert.throws(
    () => parseBlock("FeatureRows", featureRowsSchema, { title: "x", rows: threeRows.slice(0, 2) }),
    /rows/,
  );
  assert.throws(
    () =>
      parseBlock("FeatureRows", featureRowsSchema, {
        title: "x",
        rows: [...threeRows, { title: "One too many", body: "There is no fourth drawing." }],
      }),
    /rows/,
  );
});

test("FeatureRows rejects a row missing its body", () => {
  assert.throws(
    () =>
      parseBlock("FeatureRows", featureRowsSchema, {
        title: "x",
        rows: [{ title: "Only a title" }, ...threeRows.slice(1)],
      }),
    /body/,
  );
});

test("FeatureRows rejects an unsafe link href", () => {
  assert.throws(
    () =>
      parseBlock("FeatureRows", featureRowsSchema, {
        title: "x",
        rows: [
          { ...threeRows[0], link: { label: "Go", href: "javascript:alert(1)" } },
          ...threeRows.slice(1),
        ],
      }),
    /href/,
  );
});

test("FeatureRows takes no index prop — 01/02/03 is derived from position", () => {
  const parsed = parseBlock("FeatureRows", featureRowsSchema, {
    title: "x",
    rows: threeRows,
  });
  assert.equal("index" in parsed.rows[0], false);
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

test("ImageCards takes an optional eyebrow", () => {
  const withEyebrow = parseBlock("ImageCards", imageCardsSchema, {
    eyebrow: "In practice",
    title: "x",
    cards: threeCards,
  });
  assert.equal(withEyebrow.eyebrow, "In practice");
  const without = parseBlock("ImageCards", imageCardsSchema, { title: "x", cards: threeCards });
  assert.equal(without.eyebrow, undefined);
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

// --- PostGrid --------------------------------------------------------

test("PostGrid parses valid props", () => {
  const parsed = parseBlock("PostGrid", postGridSchema, { title: "From the blog" });
  assert.equal(parsed.title, "From the blog");
});

test("PostGrid applies the count default", () => {
  const parsed = parseBlock("PostGrid", postGridSchema, { title: "x" });
  assert.equal(parsed.count, 3);
});

test("PostGrid takes an eyebrow and defaults the all-posts link's label", () => {
  const parsed = parseBlock("PostGrid", postGridSchema, {
    eyebrow: "Writing",
    title: "From the blog",
  });
  assert.equal(parsed.eyebrow, "Writing");
  assert.equal(parsed.allPostsLabel, "All posts");
});

test("PostGrid lets the all-posts link's label be rewritten", () => {
  const parsed = parseBlock("PostGrid", postGridSchema, {
    title: "From the blog",
    allPostsLabel: "Read the journal",
  });
  assert.equal(parsed.allPostsLabel, "Read the journal");
});

test("PostGrid accepts an explicit category filter", () => {
  const parsed = parseBlock("PostGrid", postGridSchema, { title: "x", category: "Guides" });
  assert.equal(parsed.category, "Guides");
});

test("PostGrid rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("PostGrid", postGridSchema, {}),
    (error: Error) => error.message.includes("<PostGrid>") && error.message.includes("title"),
  );
});

test("PostGrid rejects a count above the fixed 3-column row's cap", () => {
  assert.throws(
    () => parseBlock("PostGrid", postGridSchema, { title: "x", count: postGridMaxCount + 1 }),
    /count/,
  );
});

test("PostGrid rejects a count below 1", () => {
  assert.throws(() => parseBlock("PostGrid", postGridSchema, { title: "x", count: 0 }), /count/);
});

test("PostGrid rejects a non-integer count", () => {
  assert.throws(() => parseBlock("PostGrid", postGridSchema, { title: "x", count: 2.5 }), /count/);
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

test("Testimonial parses an eyebrow, highlights, and every company shape", () => {
  const parsed = parseBlock("Testimonial", testimonialSchema, {
    eyebrow: "From the agencies",
    title: "What people say",
    testimonials: [
      { ...threeTestimonials[0], highlight: "number 1", company: { name: "Northbound" } },
      { ...threeTestimonials[1], company: { name: "Attic Digital", mark: "grid" } },
      { ...threeTestimonials[2], company: { src: "/agents/claude.svg", alt: "Claude" } },
    ],
  });
  assert.equal(parsed.eyebrow, "From the agencies");
  assert.equal(parsed.testimonials[0].highlight, "number 1");
  assert.deepEqual(parsed.testimonials[1].company, { name: "Attic Digital", mark: "grid" });
});

test("Testimonial rejects a highlight that is not in its quote, naming the prop", () => {
  assert.throws(
    () =>
      parseBlock("Testimonial", testimonialSchema, {
        title: "x",
        testimonials: [
          { ...threeTestimonials[0], highlight: "not in the quote" },
          ...threeTestimonials.slice(1),
        ],
      }),
    /testimonials\.0\.highlight/,
  );
});

test("Testimonial rejects a company logo on a host next/image is not configured for", () => {
  assert.throws(
    () =>
      parseBlock("Testimonial", testimonialSchema, {
        title: "x",
        testimonials: [
          { ...threeTestimonials[0], company: { src: "https://example.com/logo.svg", alt: "" } },
          ...threeTestimonials.slice(1),
        ],
      }),
    /company/,
  );
});

test("Testimonial parses a featured quote above the three", () => {
  const parsed = parseBlock("Testimonial", testimonialSchema, {
    title: "What people say",
    featured: {
      quote: "Nothing broke.",
      highlight: "Nothing broke.",
      person: samplePerson,
      company: { name: "Meridian" },
    },
    testimonials: threeTestimonials,
  });
  assert.equal(parsed.featured?.highlight, "Nothing broke.");
  assert.equal(parsed.testimonials.length, 3);
});

test("Testimonial checks the featured quote's highlight like the others'", () => {
  assert.throws(
    () =>
      parseBlock("Testimonial", testimonialSchema, {
        title: "x",
        featured: { quote: "Nothing broke.", highlight: "Everything broke.", person: samplePerson },
        testimonials: threeTestimonials,
      }),
    /featured\.highlight/,
  );
});

test("Testimonial still needs three in the ledger when it has a featured quote", () => {
  assert.throws(
    () =>
      parseBlock("Testimonial", testimonialSchema, {
        title: "x",
        featured: threeTestimonials[0],
        testimonials: threeTestimonials.slice(1),
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

const sixLogos = Array.from({ length: 6 }, (_, i) => ({ name: `Client ${i}` }));

test("LogoCloud parses valid props", () => {
  const parsed = parseBlock("LogoCloud", logoCloudSchema, {
    eyebrow: "Powering marketing teams at",
    meta: "40+ teams",
    logos: sixLogos,
  });
  assert.equal(parsed.logos.length, 6);
  assert.equal(parsed.meta, "40+ teams");
});

test("LogoCloud rejects a missing required prop", () => {
  assert.throws(
    () => parseBlock("LogoCloud", logoCloudSchema, {}),
    (error: Error) => error.message.includes("<LogoCloud>") && error.message.includes("eyebrow"),
  );
});

// The three entry shapes are one array, not three props: the comp's ledger
// mixes marked and unmarked names, and a client replacing it swaps them for
// images a few at a time rather than all at once.
test("LogoCloud mixes images, marked names and bare names in one array", () => {
  const parsed = parseBlock("LogoCloud", logoCloudSchema, {
    eyebrow: "Powering marketing teams at",
    logos: [
      { src: "https://assets.ui.sh/logos/align.svg", alt: "Align" },
      { name: "Northbeam", mark: "squares" },
      { name: "MERIDIAN" },
      ...sixLogos.slice(0, 3),
    ],
  });
  assert.equal(parsed.logos.length, 6);
  assert.deepEqual(parsed.logos[0], { src: "https://assets.ui.sh/logos/align.svg", alt: "Align" });
  assert.deepEqual(parsed.logos[1], { name: "Northbeam", mark: "squares" });
  assert.deepEqual(parsed.logos[2], { name: "MERIDIAN" });
});

// Nothing dedupes a ledger: two clients can legitimately share a wordmark, and
// the comp's grid is positional anyway. This is what makes the index in
// logo-cloud.tsx's list key necessary rather than defensive noise — src and
// name are both content, and content here is allowed to repeat.
test("LogoCloud accepts duplicate entries", () => {
  const parsed = parseBlock("LogoCloud", logoCloudSchema, {
    eyebrow: "Powering marketing teams at",
    logos: [
      { name: "Northbeam" },
      { name: "Northbeam" },
      { src: "https://assets.ui.sh/logos/align.svg", alt: "Align" },
      { src: "https://assets.ui.sh/logos/align.svg", alt: "Align" },
      ...sixLogos.slice(0, 2),
    ],
  });
  assert.equal(parsed.logos.length, 6);
  assert.deepEqual(parsed.logos[0], parsed.logos[1]);
  assert.deepEqual(parsed.logos[2], parsed.logos[3]);
});

test("LogoCloud rejects fewer than 6 logos (6 is one whole row at every breakpoint)", () => {
  assert.throws(
    () => parseBlock("LogoCloud", logoCloudSchema, { eyebrow: "x", logos: sixLogos.slice(0, 5) }),
    /logos/,
  );
});

test("LogoCloud rejects an unsafe logo image URL", () => {
  assert.throws(
    () =>
      parseBlock("LogoCloud", logoCloudSchema, {
        eyebrow: "x",
        logos: [...sixLogos.slice(0, 5), { src: "javascript:alert(1)", alt: "logo" }],
      }),
    /logos/,
  );
});

// A mark names one of the five glyphs logo-wordmarks.tsx draws. Anything else
// would render as a name with no mark, silently, so the schema stops it.
test("LogoCloud rejects a mark that names no glyph", () => {
  assert.throws(
    () =>
      parseBlock("LogoCloud", logoCloudSchema, {
        eyebrow: "x",
        logos: [...sixLogos.slice(0, 5), { name: "Halcyon", mark: "hexagon" }],
      }),
    /logos/,
  );
});

// The ids the schema offers and the glyphs the component draws are one list.
// The drawing side is typecheck's: ledgerMarks in logo-wordmarks.tsx is a
// total Record over LedgerMarkId, so an id with no glyph — or a glyph with no
// id — fails tsc rather than rendering a name with nothing beside it. What
// this test pins is the authoring side: the enum reaches catalog.json, so
// adding or dropping an id changes what an author is told they may write.
test("the mark enum offers exactly the five glyphs drawn from the comp", () => {
  assert.deepEqual([...ledgerMarkIds], ["squares", "diamond", "chevron", "grid", "triangle"]);
});

test("LogoCloud parses with the meta note omitted", () => {
  const parsed = parseBlock("LogoCloud", logoCloudSchema, {
    eyebrow: "Powering marketing teams at",
    logos: sixLogos,
  });
  assert.equal(parsed.meta, undefined);
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

// --- PreviewStage ---------------------------------------------------------

test("PreviewStage parses valid props", () => {
  const parsed = parseBlock("PreviewStage", previewStageSchema, {
    eyebrow: "Preview-ready",
    title: "Every block ships with real content, not lorem ipsum.",
    lede: "Preview a block and it already reads like a finished page.",
  });
  assert.equal(parsed.title, "Every block ships with real content, not lorem ipsum.");
});

test("PreviewStage needs only a title (eyebrow and lede are optional)", () => {
  const parsed = parseBlock("PreviewStage", previewStageSchema, { title: "x" });
  assert.equal(parsed.eyebrow, undefined);
  assert.equal(parsed.lede, undefined);
});

test("PreviewStage rejects a missing title", () => {
  assert.throws(
    () => parseBlock("PreviewStage", previewStageSchema, { lede: "x" }),
    (error: Error) => error.message.includes("<PreviewStage>") && error.message.includes("title"),
  );
});

test("PreviewStage takes no props for its illustration (fixed artwork)", () => {
  assert.deepEqual(Object.keys(previewStageSchema.shape).sort(), ["eyebrow", "lede", "title"]);
});

// --- FeaturedQuote --------------------------------------------------------

const casey = {
  name: "Casey Okafor",
  role: "Founder, Northbound",
  avatar: { src: "https://assets.ui.sh/avatars/7.webp", alt: "" },
};
const oneQuote = "The block registry is the first thing I show new hires.";

test("FeaturedQuote parses each company shape: a wordmark, a wordmark with a mark, a logo", () => {
  for (const company of [
    { name: "Northbound" },
    { name: "Attic Digital", mark: "grid" },
    { src: "/agents/claude.svg", alt: "Claude" },
  ]) {
    const parsed = parseBlock("FeaturedQuote", featuredQuoteSchema, {
      quote: oneQuote,
      person: casey,
      company,
    });
    assert.deepEqual(parsed.company, company);
  }
});

test("FeaturedQuote parses with no company (the quote takes the full width)", () => {
  const parsed = parseBlock("FeaturedQuote", featuredQuoteSchema, {
    quote: oneQuote,
    person: casey,
  });
  assert.equal(parsed.company, undefined);
});

test("FeaturedQuote rejects a missing quote", () => {
  assert.throws(
    () => parseBlock("FeaturedQuote", featuredQuoteSchema, { person: casey }),
    (error: Error) => error.message.includes("<FeaturedQuote>") && error.message.includes("quote"),
  );
});

test("FeaturedQuote rejects a person with no avatar", () => {
  assert.throws(
    () =>
      parseBlock("FeaturedQuote", featuredQuoteSchema, {
        quote: oneQuote,
        person: { name: "Casey Okafor", role: "Founder" },
      }),
    /avatar/,
  );
});

test("FeaturedQuote rejects an avatar on a host next/image is not configured for", () => {
  assert.throws(
    () =>
      parseBlock("FeaturedQuote", featuredQuoteSchema, {
        quote: oneQuote,
        person: { ...casey, avatar: { src: "https://example.com/me.jpg", alt: "" } },
      }),
    /avatar\.src/,
  );
});

test("FeaturedQuote rejects a company logo on a host next/image is not configured for", () => {
  assert.throws(
    () =>
      parseBlock("FeaturedQuote", featuredQuoteSchema, {
        quote: oneQuote,
        person: casey,
        company: { src: "https://example.com/logo.svg", alt: "Acme" },
      }),
    /company/,
  );
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
    message: "Now shipping: the new block system.",
    link: { label: "Explore the blocks", href: "/blocks-gallery" },
  });
  assert.equal(parsed.message, "Now shipping: the new block system.");
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

test("Newsletter takes an optional eyebrow", () => {
  const withEyebrow = parseBlock("Newsletter", newsletterSchema, {
    eyebrow: "Newsletter",
    title: "x",
    action: "/subscribe",
  });
  assert.equal(withEyebrow.eyebrow, "Newsletter");
  const without = parseBlock("Newsletter", newsletterSchema, { title: "x", action: "/subscribe" });
  assert.equal(without.eyebrow, undefined);
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

test("CTA parses valid props", () => {
  const parsed = parseBlock("CTA", ctaBandSchema, {
    title: "Your next client site starts here.",
    lede: "Six Blocks, one token file, zero lock-in.",
    primary: { label: "Clone the repo", href: "https://github.com" },
  });
  assert.equal(parsed.primary.label, "Clone the repo");
});

test("CTA requires primary (secondary is optional, the primary button is not)", () => {
  assert.throws(
    () => parseBlock("CTA", ctaBandSchema, { title: "x" }),
    (error: Error) => error.message.includes("<CTA>") && error.message.includes("primary"),
  );
});

test("CTA rejects a primary link missing href", () => {
  assert.throws(
    () => parseBlock("CTA", ctaBandSchema, { title: "x", primary: { label: "Go" } }),
    /href/,
  );
});

test("CTA rejects an unsafe primary URL", () => {
  assert.throws(
    () =>
      parseBlock("CTA", ctaBandSchema, {
        title: "x",
        primary: { label: "Go", href: "javascript:alert(1)" },
      }),
    /href/,
  );
});

test("CTA parses the comp's full shape: a muted second line and a secondary button", () => {
  const parsed = parseBlock("CTA", ctaBandSchema, {
    title: "Compose pages from Blocks.",
    titleMuted: "The build is the gate.",
    lede: "MIT-licensed. Clone it and ship your own site.",
    primary: { label: "Read the docs", href: "/blog/introducing-harbour" },
    secondary: { label: "Browse the blocks", href: "/blocks-gallery" },
  });
  assert.equal(parsed.titleMuted, "The build is the gate.");
  assert.equal(parsed.secondary?.href, "/blocks-gallery");
});

test("CTA still parses a title and primary alone (the about and contact pages' shape)", () => {
  const parsed = parseBlock("CTA", ctaBandSchema, {
    title: "Ready to go deeper?",
    primary: { label: "Read the guides", href: "/blog" },
  });
  assert.equal(parsed.titleMuted, undefined);
  assert.equal(parsed.secondary, undefined);
});

test("CTA rejects an unsafe secondary URL", () => {
  assert.throws(
    () =>
      parseBlock("CTA", ctaBandSchema, {
        title: "x",
        primary: { label: "Go", href: "/" },
        secondary: { label: "No", href: "javascript:alert(1)" },
      }),
    /secondary\.href/,
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
