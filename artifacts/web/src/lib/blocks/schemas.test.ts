import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import {
  ctaSchema,
  featureGridSchema,
  featureSplitSchema,
  galleryImageCount,
  gallerySchema,
  heroSchema,
  imageCardsSchema,
  parseBlock,
  safeUrl,
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
    () => parseBlock("CTA", ctaSchema, { title: "Hi", primary: { label: "Go" } }),
    /href/,
  );
});

test("parseBlock rejects a missing required prop", () => {
  assert.throws(() => parseBlock("CTA", ctaSchema, {}), /title/);
});

test("link schema rejects javascript: hrefs", () => {
  assert.throws(
    () =>
      parseBlock("CTA", ctaSchema, {
        title: "x",
        primary: { label: "x", href: "javascript:alert(1)" },
      }),
    /href/,
  );
});

test("link schema rejects data: hrefs", () => {
  assert.throws(
    () =>
      parseBlock("CTA", ctaSchema, {
        title: "x",
        primary: { label: "x", href: "data:text/html,x" },
      }),
    /href/,
  );
});

test("link schema accepts relative, https, and mailto hrefs", () => {
  for (const href of ["/about", "https://example.com", "mailto:a@b.com", "#section"]) {
    const parsed = parseBlock("CTA", ctaSchema, { title: "x", primary: { label: "x", href } });
    assert.equal(parsed.primary?.href, href);
  }
});

test("the href URL rule survives into the JSON Schema", () => {
  const json = z.toJSONSchema(ctaSchema, { io: "input" });
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
