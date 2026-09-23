import type { ReactNode } from "react";
import { site } from "#velite";
import { groundAt, SiteMark } from "@/components/site/site-mark";
import { GridField } from "@/components/texture/grid-field";
import { cn } from "@/lib/utils";

// The PreviewStage illustration: this site, open in a browser, with its Hero
// under selection while an agent edits it. Markup rather than an exported
// image, for the reasons hero-prompt-card.tsx gives, plus one of its own: the
// mock shows the site's name three times, and a picture would keep saying the
// template's name after a client rebrand, somewhere brand:check cannot read.
// Here the name, the domain and the hero's lede all come from site.yml.
//
// A private part of PreviewStage, not a Block: never registered in
// blockSchemas or blockComponents, so it stays out of catalog.json and out of
// blockCount. Same status as feature-row-art.tsx.
//
// Built once, on the comp's own 1440x760 canvas, at the comp's coordinates
// (Paper, artboard "home", the section misnamed "stats / 1 — Ledger"). The
// Block scales the whole canvas down a step at md and again below it, rather
// than re-laying it out: it is a picture, and a picture shrinks. The scrims at
// either edge fade to the page, so the part a narrow screen crops is the part
// that was already fading out.
//
// Layer order is the comp's and it matters: the scrims sit over the bed, the
// browser, the toolbar and the left-hand pill, which is why those read dimmer
// on the left; the connector, the cursor and the right-hand pill sit above the
// scrims and stay bright, which is where the comp wants the eye.

// "harbour.dev" for the template, and whatever the client's name makes of it
// after a rebrand. Illustrative only: it is never linked.
const DOMAIN = `${site.name.toLowerCase().replace(/\s+/g, "")}.dev`;

const LEFT_SCRIM = `linear-gradient(in oklab 90deg, ${groundAt(100)} 0%, ${groundAt(0)} 100%)`;
const RIGHT_SCRIM = `linear-gradient(in oklab 90deg, ${groundAt(0)} 0%, ${groundAt(100)} 69.02%)`;

function HouseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M10 14v-5.333a0.667 0.667 0 0 0-0.667-0.667h-2.666a0.667 0.667 0 0 0-0.667 0.667v5.333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 6.667C2 6.274 2.173 5.901 2.473 5.648L7.139 1.648C7.636 1.228 8.364 1.228 8.861 1.648L13.527 5.648C13.827 5.901 14 6.274 14 6.667L14 12.667C14 13.021 13.86 13.36 13.61 13.61C13.36 13.86 13.021 14 12.667 14L3.333 14C2.979 14 2.64 13.86 2.39 13.61C2.14 13.36 2 13.021 2 12.667L2 6.667Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One of the toolbar's icon buttons: move up, move down, swap. */
function ToolbarIcon({ d, active = false }: { d: string; active?: boolean }) {
  return (
    <span
      className={
        active
          ? "flex size-7 items-center justify-center rounded-md bg-foreground/7 text-foreground"
          : "flex size-7 items-center justify-center rounded-md text-muted-foreground"
      }
    >
      <svg aria-hidden="true" className="size-3.75" fill="none" viewBox="0 0 15 15">
        <path
          d={d}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    </span>
  );
}

function ToolbarDivider() {
  return <span className="h-5 w-px shrink-0 bg-foreground/12" />;
}

/** A status pill along the stage's bottom edge. */
function StatusPill({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "absolute bottom-14 flex h-9 items-center gap-2.5 rounded-full bg-linear-to-b from-card to-background px-3.5 outline outline-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PreviewStageArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-1/2 h-190 w-360 origin-top -translate-x-1/2 scale-36 sm:scale-50 md:scale-70 lg:scale-100"
    >
      {/* The bed: the site's texture, still, where the comp places it and at
          the size the comp sets it, 1056px wide anchored at 100% 80%. Scaled
          to cover this 1057x590 box instead, the cells came out twice the
          comp's size and read as a coarser, brighter field than the design.
          The comp's bitmap thins out toward its right and bottom edges, so
          they never read as edges; this field is even to the last cell, so the
          same softness comes from masking those two edges out instead. */}
      <div className="absolute top-1.25 right-95.75 bottom-41.25 left-0 mask-r-from-70% mask-b-from-65%">
        <GridField
          animate={false}
          className="size-full opacity-30"
          preset="dense"
          tile={{ width: "1056px", position: "100% 80%" }}
        />
      </div>

      {/* The browser, centred on the canvas. */}
      <div className="absolute top-31 left-67.5 flex h-128 w-225 flex-col overflow-hidden rounded-xl bg-linear-to-b from-card to-background shadow-(--shadow-stage-window) outline outline-border">
        <div className="flex h-11.5 shrink-0 items-center gap-4 border-mock-rule border-b px-4">
          <span className="flex shrink-0 gap-1.75">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </span>
          <span className="flex h-6.5 grow items-center gap-2.25 rounded-full bg-foreground/4 px-3">
            <SiteMark className="size-3.5 shrink-0 text-foreground/80" />
            <span className="font-mono text-subtle-foreground text-xs">{DOMAIN}</span>
          </span>
          <span className="w-14 shrink-0" />
        </div>

        <div className="relative flex grow flex-col overflow-hidden bg-background">
          <div className="flex h-13 shrink-0 items-center justify-between px-8.5">
            <span className="flex items-center gap-1.5 text-foreground">
              <SiteMark className="size-4.25" />
              <span className="font-semibold text-base">{site.name}</span>
            </span>
            <span className="flex gap-5">
              <span className="h-1.25 w-8 rounded-full bg-card" />
              <span className="h-1.25 w-6 rounded-full bg-card" />
              <span className="h-1.25 w-10 rounded-full bg-card" />
            </span>
            <span className="h-6 w-17.5 rounded-full outline outline-input" />
          </div>

          {/* The page's textured band under the Hero, fading in from above. First
              in the DOM so the Hero paints over it without a z-index: a
              z-index here would also lift the Hero above the scrims, and the
              comp dims it on the left like everything else under them. */}
          <div className="absolute inset-x-0 bottom-0 h-47.5 overflow-hidden">
            <GridField
              animate={false}
              className="size-full opacity-45"
              preset="dense"
              tile={{ width: "1056px", position: "40% 60%" }}
            />
            <div className="absolute inset-x-0 top-0 h-14 bg-linear-to-b from-4% from-background to-transparent" />
          </div>
          {/* The Hero, selected: an accent outline with a handle on each
              corner. The lede is the site's own description, so the picture
              stays true to whatever site it is showing. */}
          <div className="px-8.5 pt-8.5">
            <div className="relative inline-flex flex-col gap-3.5 p-4.5 outline outline-primary">
              <p className="text-3xl text-foreground leading-9.5 tracking-tight">
                <span className="block">Your website, editable</span>
                <span className="block">by any AI agent</span>
              </p>
              {/* 28px under the title, not the 14px gap alone: the comp leaves that
                  room between the two, and it is where the agent's cursor sits. */}
              <p className="mt-3.5 w-85 text-muted-foreground text-sm">{site.description}</p>
              <span className="-top-1 -left-1 absolute size-1.75 rounded-xs bg-primary" />
              <span className="-top-1 -right-1 absolute size-1.75 rounded-xs bg-primary" />
              <span className="-bottom-1 -left-1 absolute size-1.75 rounded-xs bg-primary" />
              <span className="-right-1 -bottom-1 absolute size-1.75 rounded-xs bg-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* The Block toolbar, over the selection. */}
      <div className="absolute top-12.75 left-79.25 flex h-11.5 items-center gap-2.5 rounded-lg bg-linear-to-b from-accent to-card px-3 shadow-(--shadow-stage-float) outline outline-input">
        <span className="rounded-md bg-primary/14 px-2.25 py-1.25 font-mono text-primary text-xs tracking-wider outline outline-primary/38">
          HERO
        </span>
        <ToolbarDivider />
        <ToolbarIcon d="M7.5 12 V3 M3.8 6.7 L7.5 3 L11.2 6.7" />
        <ToolbarIcon d="M7.5 3 V12 M3.8 8.3 L7.5 12 L11.2 8.3" />
        <ToolbarIcon
          active
          d="M2.5 5.2 H10.5 M8.4 3.1 L10.5 5.2 L8.4 7.3 M12.5 9.8 H4.5 M6.6 7.7 L4.5 9.8 L6.6 11.9"
        />
        <ToolbarDivider />
        <span className="flex items-center gap-1.75 rounded-md bg-foreground/6 px-2.75 py-1.5 text-foreground text-sm">
          <HouseIcon className="size-3.25" />
          Edit with agent
        </span>
      </div>

      <StatusPill className="left-59.5">
        <SiteMark className="size-3.5 text-foreground/80" />
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="font-mono text-muted-foreground text-xs">editing content/hero.mdx</span>
      </StatusPill>

      {/* The scrims. Everything above this point is dimmed toward the edges;
          everything after it is not. */}
      <div className="absolute top-0 left-0 h-190 w-182" style={{ backgroundImage: LEFT_SCRIM }} />
      <div
        className="absolute top-0 left-170.25 h-190 w-189.75"
        style={{ backgroundImage: RIGHT_SCRIM }}
      />

      {/* The connector from the toolbar down to the selection's top edge. */}
      <svg
        aria-hidden="true"
        className="absolute top-23.75 left-121.5 h-40 w-3"
        fill="none"
        viewBox="0 0 12 160"
      >
        <path className="stroke-primary" d="M6 0 V152" strokeWidth="1.5" />
        <rect className="fill-primary" height="10" rx="2" width="10" x="1" y="151" />
      </svg>

      {/* The agent, mid-edit. */}
      <div className="absolute top-82.5 left-139 flex flex-col items-start gap-0.5">
        <svg aria-hidden="true" className="h-5 w-4.5" viewBox="0 0 18 20">
          <path
            className="fill-primary stroke-background"
            d="M1.5 1.2 L15.2 9.4 L8.6 10.6 L5.6 17.2 Z"
            strokeLinejoin="round"
            strokeWidth="1.1"
          />
        </svg>
        <span className="flex translate-x-2.5 items-center gap-1.5 rounded-md bg-primary px-2.25 py-1.25 text-primary-foreground">
          <HouseIcon className="size-2.75" />
          <span className="font-mono text-xs">AI Agent</span>
        </span>
      </div>

      <StatusPill className="right-57.5">
        <svg
          aria-hidden="true"
          className="size-3.25 text-subtle-foreground"
          fill="none"
          viewBox="0 0 13 13"
        >
          <path
            d="M2.5 6.8 L5.2 9.5 L10.5 3.8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
        <span className="font-mono text-muted-foreground text-xs">content:check passed</span>
      </StatusPill>
    </div>
  );
}
