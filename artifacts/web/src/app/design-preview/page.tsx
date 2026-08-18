import type { Metadata } from "next";

import { BannerAnnouncement } from "@/components/design-preview/banner-announcement";
import { BannerBrand } from "@/components/design-preview/banner-brand";
import { BannerUtility } from "@/components/design-preview/banner-utility";
import { CtaBand } from "@/components/design-preview/cta-band";
import { CtaCurrent } from "@/components/design-preview/cta-current";
import { CtaPlain } from "@/components/design-preview/cta-plain";
import { FaqColumns } from "@/components/design-preview/faq-columns";
import { FaqSplit } from "@/components/design-preview/faq-split";
import { FaqStacked } from "@/components/design-preview/faq-stacked";
import { FeatureSplitBleed } from "@/components/design-preview/feature-split-bleed";
import { FeatureSplitFramed } from "@/components/design-preview/feature-split-framed";
import { FeatureSplitInset } from "@/components/design-preview/feature-split-inset";
import { FeaturesField } from "@/components/design-preview/features-field";
import { FooterColumns } from "@/components/design-preview/footer-columns";
import { FooterMinimal } from "@/components/design-preview/footer-minimal";
import { FooterSignoff } from "@/components/design-preview/footer-signoff";
import { GalleryGrid } from "@/components/design-preview/gallery-grid";
import { GalleryMosaic } from "@/components/design-preview/gallery-mosaic";
import { GalleryTight } from "@/components/design-preview/gallery-tight";
import { HeroAsymmetric } from "@/components/design-preview/hero-asymmetric";
import { HeroCurrent } from "@/components/design-preview/hero-current";
import { HeroLeft } from "@/components/design-preview/hero-left";
import { ImageCardsFlush } from "@/components/design-preview/image-cards-flush";
import { ImageCardsFramed } from "@/components/design-preview/image-cards-framed";
import { ImageCardsOverlay } from "@/components/design-preview/image-cards-overlay";
import { LogoCloudBand } from "@/components/design-preview/logo-cloud-band";
import { LogoCloudGrid } from "@/components/design-preview/logo-cloud-grid";
import { LogoCloudRow } from "@/components/design-preview/logo-cloud-row";
import { NewsletterInline } from "@/components/design-preview/newsletter-inline";
import { NewsletterSplit } from "@/components/design-preview/newsletter-split";
import { NewsletterStacked } from "@/components/design-preview/newsletter-stacked";
import { PricingAnchor } from "@/components/design-preview/pricing-anchor";
import { PricingLedger } from "@/components/design-preview/pricing-ledger";
import { PricingPodium } from "@/components/design-preview/pricing-podium";
import { PricingStacked } from "@/components/design-preview/pricing-stacked";
import { ProseNarrow } from "@/components/design-preview/prose-narrow";
import { ProseStandard } from "@/components/design-preview/prose-standard";
import { ProseWide } from "@/components/design-preview/prose-wide";
import { SiteHeaderDrawer } from "@/components/design-preview/site-header-drawer";
import { StatsGrid } from "@/components/design-preview/stats-grid";
import { StatsInline } from "@/components/design-preview/stats-inline";
import { StatsRow } from "@/components/design-preview/stats-row";
import { TeamDense } from "@/components/design-preview/team-dense";
import { TeamGrid } from "@/components/design-preview/team-grid";
import { TeamList } from "@/components/design-preview/team-list";
import { TestimonialFeatured } from "@/components/design-preview/testimonial-featured";
import { TestimonialField } from "@/components/design-preview/testimonial-field";
import { TestimonialLedger } from "@/components/design-preview/testimonial-ledger";
import { cn } from "@/lib/utils";
import picker from "./picker.module.css";

export const metadata: Metadata = {
  title: "Design preview",
  robots: { index: false, follow: false },
};

// Disposable design exploration. Every switchable Block appears here as
// several variants that can be toggled per-group with a plain radio +
// :checked switcher (see picker.module.css), so a whole direction can be
// chosen in one pass in the browser without any client JavaScript. Nothing
// here is registered as a Block: no catalog, no gallery, no MDX lockdown.
// Once the picks are made this route and its components are deleted and the
// winners are rebuilt as real Blocks.

type PickOption = { name: string; node: React.ReactNode };

function slugify(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="page-inset border-t border-border pt-6 pb-2">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function Pick({ label, options }: { label: string; options: PickOption[] }) {
  const name = `pick-${slugify(label)}`;

  return (
    <section className={picker.group}>
      <GroupLabel label={label} />
      <div className={cn("page-inset flex flex-wrap gap-2 pb-4", picker.toolbar)}>
        {options.flatMap((option, index) => {
          const id = `${name}-${index}`;
          return [
            <input
              key={`input-${option.name}`}
              className="sr-only"
              defaultChecked={index === 0}
              id={id}
              name={name}
              type="radio"
            />,
            <label
              key={`label-${option.name}`}
              className={cn(
                "cursor-pointer rounded-card border border-border bg-muted px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground",
                picker.option,
              )}
              htmlFor={id}
            >
              {option.name}
            </label>,
          ];
        })}
      </div>
      <div className={picker.panels}>
        {options.map((option) => (
          <div className={picker.panel} key={option.name}>
            {option.node}
          </div>
        ))}
      </div>
    </section>
  );
}

function Settled({
  label,
  variant,
  node,
}: {
  label: string;
  variant: string;
  node: React.ReactNode;
}) {
  return (
    <section>
      <div className="page-inset border-t border-border pt-6 pb-2">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {label} — settled ({variant}, not switchable)
        </p>
      </div>
      {node}
    </section>
  );
}

export default function DesignPreviewPage() {
  return (
    <main className="flex flex-col gap-16 py-16">
      <Settled label="Site header" node={<SiteHeaderDrawer />} variant="Drawer + floating panel" />
      <Pick
        label="Hero"
        options={[
          { name: "Current", node: <HeroCurrent /> },
          { name: "Left statement", node: <HeroLeft /> },
          { name: "Asymmetric", node: <HeroAsymmetric /> },
        ]}
      />
      <Settled label="Features" node={<FeaturesField />} variant="Even Field" />
      <Pick
        label="Feature split"
        options={[
          { name: "Inset", node: <FeatureSplitInset /> },
          { name: "Bleed", node: <FeatureSplitBleed /> },
          { name: "Framed", node: <FeatureSplitFramed /> },
        ]}
      />
      <Pick
        label="Stats"
        options={[
          { name: "Row", node: <StatsRow /> },
          { name: "Grid", node: <StatsGrid /> },
          { name: "Inline sentence", node: <StatsInline /> },
        ]}
      />
      <Pick
        label="Logo cloud"
        options={[
          { name: "Row", node: <LogoCloudRow /> },
          { name: "Grid", node: <LogoCloudGrid /> },
          { name: "Recessed band", node: <LogoCloudBand /> },
        ]}
      />
      <Pick
        label="Testimonial"
        options={[
          { name: "Featured quote", node: <TestimonialFeatured /> },
          { name: "Field of quotes", node: <TestimonialField /> },
          { name: "Ledger rows", node: <TestimonialLedger /> },
        ]}
      />
      <Pick
        label="Pricing"
        options={[
          { name: "Podium", node: <PricingPodium /> },
          { name: "Ledger", node: <PricingLedger /> },
          { name: "Numeral anchor", node: <PricingAnchor /> },
          { name: "Stacked full-width", node: <PricingStacked /> },
        ]}
      />
      <Pick
        label="FAQ"
        options={[
          { name: "Stacked", node: <FaqStacked /> },
          { name: "Two column", node: <FaqSplit /> },
          { name: "Shared line", node: <FaqColumns /> },
        ]}
      />
      <Pick
        label="Team"
        options={[
          { name: "Grid", node: <TeamGrid /> },
          { name: "Dense", node: <TeamDense /> },
          { name: "List", node: <TeamList /> },
        ]}
      />
      <Pick
        label="Image cards"
        options={[
          { name: "Flush", node: <ImageCardsFlush /> },
          { name: "Overlay", node: <ImageCardsOverlay /> },
          { name: "Framed", node: <ImageCardsFramed /> },
        ]}
      />
      <Pick
        label="Gallery"
        options={[
          { name: "Grid", node: <GalleryGrid /> },
          { name: "Mosaic", node: <GalleryMosaic /> },
          { name: "Tight", node: <GalleryTight /> },
        ]}
      />
      <Pick
        label="Prose"
        options={[
          { name: "Standard", node: <ProseStandard /> },
          { name: "Narrow", node: <ProseNarrow /> },
          { name: "Wide", node: <ProseWide /> },
        ]}
      />
      <Pick
        label="Newsletter"
        options={[
          { name: "Inline", node: <NewsletterInline /> },
          { name: "Stacked", node: <NewsletterStacked /> },
          { name: "Split", node: <NewsletterSplit /> },
        ]}
      />
      <Pick
        label="Banner"
        options={[
          { name: "Announcement", node: <BannerAnnouncement /> },
          { name: "Utility", node: <BannerUtility /> },
          { name: "Brand", node: <BannerBrand /> },
        ]}
      />
      <Pick
        label="CTA"
        options={[
          { name: "Current", node: <CtaCurrent /> },
          { name: "Plain", node: <CtaPlain /> },
          { name: "Brand band", node: <CtaBand /> },
        ]}
      />
      <Pick
        label="Footer"
        options={[
          { name: "Columns", node: <FooterColumns /> },
          { name: "Minimal", node: <FooterMinimal /> },
          { name: "Signoff", node: <FooterSignoff /> },
        ]}
      />
    </main>
  );
}
