// Shared copy for the /design-preview exploration route. Not a Block, not
// registered anywhere — deliberately outside content/** and schemas.ts so
// this page can be discarded without touching the Block registry.

export const features = [
  {
    title: "Block system.",
    description:
      "Compose pages from a growing library of pre-built sections instead of hand-rolling layout for every client.",
  },
  {
    title: "Bring your own content.",
    description:
      "Wire pages to Markdown, Sanity, or a JSON file — the block components never know which one is behind them.",
  },
  {
    title: "One token file.",
    description:
      "Rebrand a client site by editing a handful of CSS variables, not hunting hex codes through the codebase.",
  },
  {
    title: "Schemas that catch mistakes.",
    description:
      "Every block validates its props at build time, so a bad edit fails the build, not the client demo.",
  },
  {
    title: "No client JS by default.",
    description:
      "Sections render as server components — a block only ships a bundle when it actually needs one.",
  },
  {
    title: "Ships in an afternoon.",
    description:
      "Clone the repo, swap the tokens and copy, push. Most rebuilds go live the same day.",
  },
] satisfies Array<{ title: string; description: string }>;

export const plans = [
  {
    name: "Starter",
    price: "Free",
    period: undefined,
    description: "For a single portfolio or personal project.",
    features: ["1 site", "Full block library", "Community support", "MIT-licensed"],
    cta: { label: "Clone the repo", href: "#" },
    emphasized: false,
  },
  {
    name: "Studio",
    price: "$249",
    period: "one-time",
    description: "For agencies shipping client sites every month.",
    features: [
      "Unlimited sites",
      "Block registry updates",
      "Figma kit included",
      "Priority support",
    ],
    cta: { label: "Get Studio", href: "#" },
    emphasized: true,
  },
  {
    name: "Agency",
    price: "Custom",
    period: undefined,
    description: "For teams running a full client roster.",
    features: [
      "Everything in Studio",
      "Custom blocks on request",
      "Dedicated Slack channel",
      "Single sign-on",
    ],
    cta: { label: "Talk to us", href: "#" },
    emphasized: false,
  },
] satisfies Array<{
  name: string;
  price: string;
  period: string | undefined;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  emphasized: boolean;
}>;

export const faqs = [
  {
    question: "Do I need to know Sanity, or can I use plain Markdown?",
    answer:
      "Neither is required. Block components read from a shared content shape, and the shape ships with a Markdown adapter and a Sanity adapter already wired. Point the config at whichever one matches the client's comfort level — the sections themselves never know which backend is behind them.",
  },
  {
    question: "How long does a client rebuild actually take?",
    answer:
      "Most agencies using this go from clone to a live client preview in an afternoon: swap the token file, drop in the client's copy and logo, pick block variants per section. The parts that used to take a week — layout, spacing, responsive behavior — are already decided.",
  },
  {
    question: "What happens when a client wants a block that doesn't exist yet?",
    answer:
      "You build it once, following the same props-and-schema pattern as every other block, and it slots into the registry alongside the built-ins. It's not a fork of the template — it's an addition to it, so the next client project gets it for free too.",
  },
  {
    question: "Is the block registry locked to a specific CMS?",
    answer:
      "No. The registry is just a mapping from a type string to a component. Whatever's supplying that type — Sanity, a JSON file, a headless CMS you bolt on later — the registry doesn't care, as long as the props match the schema.",
  },
  {
    question: "Can I white-label this for resale?",
    answer:
      "Yes. It ships MIT-licensed specifically so agencies can rebrand, resell, and reuse it across client engagements without asking permission or crediting the template anywhere client-facing.",
  },
  {
    question: "Does it support multiple languages?",
    answer:
      "Not yet natively — routing and copy are single-locale today. Multi-language support is on the roadmap, but if a client needs it now, the content layer is thin enough that most teams wire in next-intl themselves in under a day.",
  },
] satisfies Array<{ question: string; answer: string }>;

export const testimonials = [
  {
    quote:
      "We used to quote four weeks for a rebrand. With the token file doing the heavy lifting, we shipped the last one in three days — and the client didn't know the difference.",
    name: "Jordan Ellis",
    role: "Creative Director, Fernwood Studio",
    avatar: "https://assets.ui.sh/avatars/3.webp",
  },
  {
    quote:
      "The block registry is the first thing I show new hires. They're shipping client sections in their first week instead of their first month.",
    name: "Casey Okafor",
    role: "Founder, Northbound",
    avatar: "https://assets.ui.sh/avatars/7.webp",
  },
  {
    quote:
      "Nothing ships client JS unless a block actually needs it. Our Lighthouse scores stopped being a monthly fire drill.",
    name: "Morgan Vale",
    role: "Lead Engineer, Attic Digital",
    avatar: "https://assets.ui.sh/avatars/11.webp",
  },
  {
    quote:
      "Handoff used to mean a week of Slack threads. Now it's a token file and a content doc, and the client's team can maintain it themselves.",
    name: "Riley Sandoval",
    role: "Partner, Palisade",
    avatar: "https://assets.ui.sh/avatars/5.webp",
  },
] satisfies Array<{ quote: string; name: string; role: string; avatar: string }>;

export const featuredTestimonial = {
  quote:
    "Every other template we tried made us fight the defaults. This one gets out of the way and lets the client's brand do the talking — that's the whole job, done right.",
  name: "Avery Doyle",
  role: "CEO, Loom & Co.",
  avatar: "https://assets.ui.sh/avatars/9.webp",
} satisfies { quote: string; name: string; role: string; avatar: string };

export const team = [
  {
    name: "Jordan Reyes",
    role: "Design Lead",
    avatar: "https://assets.ui.sh/avatars/2.webp",
  },
  {
    name: "Casey Whitfield",
    role: "Engineering Lead",
    avatar: "https://assets.ui.sh/avatars/6.webp",
  },
  {
    name: "Morgan Ito",
    role: "Product Manager",
    avatar: "https://assets.ui.sh/avatars/10.webp",
  },
  {
    name: "Riley Sandoval",
    role: "Front-End Engineer",
    avatar: "https://assets.ui.sh/avatars/13.webp",
  },
  {
    name: "Avery Kwan",
    role: "Design Systems",
    avatar: "https://assets.ui.sh/avatars/4.webp",
  },
  {
    name: "Sasha Novak",
    role: "Operations",
    avatar: "https://assets.ui.sh/avatars/15.webp",
  },
] satisfies Array<{ name: string; role: string; avatar: string }>;

export const stats = [
  { value: "12", label: "Blocks in the registry today" },
  { value: "3.2 hrs", label: "Average time to reskin a client site" },
  { value: "94%", label: "Sections shipped without custom code" },
  { value: "0kb", label: "Client JS shipped by default" },
] satisfies Array<{ value: string; label: string }>;
