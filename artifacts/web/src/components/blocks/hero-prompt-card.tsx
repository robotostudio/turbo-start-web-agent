import Image from "next/image";
import type { PromptSegment } from "@/lib/blocks/schemas";

// The card floating over the Hero's textured band: a still of an agent about to
// be given an instruction, which is the product this site is selling. Markup
// rather than an exported image, for the reason grid-field.tsx gives for
// generating the texture instead of shipping a bitmap — it rethemes with the
// site and stays sharp at any density.
//
// A private part of Hero, not a Block: it is never registered in blockSchemas or
// blockComponents, so it stays out of the catalog and out of blockCount. Same
// status as SectionHeader and GridField.
//
// Geometry is the comp's: 459x200, a 16px pad, and the prompt and the toolbar
// pushed to opposite ends.

// The two icons that are pure chrome of the mock stay inline rather than
// becoming files: nothing authors them, and a file each would be three more
// requests for shapes that never change.
function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path d="M3.332 8h9.336" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M8 3.333v9.334" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
      <path
        clipRule="evenodd"
        d="M3.27 7.842C2.97 7.765 2.735 7.53 2.658 7.23C2.581 6.93 2.674 6.611 2.9 6.399L7.4 1.899C7.732 1.568 8.269 1.568 8.601 1.899L13.101 6.399C13.331 6.61 13.427 6.931 13.35 7.233C13.274 7.536 13.037 7.773 12.734 7.849C12.432 7.926 12.111 7.83 11.9 7.6L8.85 4.552L8.85 13.5C8.85 13.969 8.469 14.35 8 14.35C7.531 14.35 7.15 13.969 7.15 13.5L7.15 4.552L4.101 7.601C3.889 7.827 3.57 7.919 3.27 7.842Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function HeroPromptCard({ prompt, model }: { prompt: PromptSegment[]; model: string }) {
  return (
    // aria-hidden because this is an illustration of a product, not a control:
    // there is nothing here a visitor can type into or send, so exposing it to a
    // screen reader would announce a form that does not exist. The lede and the
    // calls to action above carry the same message in operable form.
    <div
      aria-hidden="true"
      className="mx-auto flex min-h-50 w-full max-w-115 flex-col justify-between gap-12 rounded-xl bg-linear-to-b from-card to-background p-4 shadow-(--shadow-prompt-card) outline outline-primary/5"
    >
      {/* One flowing sentence: the runs are inline text separated by ordinary
          word spaces, and a chip is an inline-flex box sitting on the text
          baseline. This was a flex row of items, which put a fixed 8px gap
          between every run and broke each onto a line of its own once the card
          narrowed, so on a phone the prompt stopped reading as a sentence. */}
      <p className="text-lede leading-7 text-foreground">
        {prompt.map((segment, index) => (
          <span key={`${segment.icon ?? ""}${segment.text}`}>
            {index > 0 && " "}
            {segment.icon ? (
              <span className="mx-0.5 inline-flex items-center gap-1 rounded-lg bg-linear-to-b from-card to-muted px-1.5 align-middle outline outline-foreground">
                <Image alt="" className="shrink-0" height={16} src={segment.icon} width={16} />
                {segment.text}
              </span>
            ) : (
              segment.text
            )}
          </span>
        ))}
      </p>

      <div className="flex h-6 items-center justify-between text-muted-foreground">
        <PlusIcon />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-sm bg-linear-to-b from-card to-muted px-1">
            <span className="px-0.5 font-mono text-xs text-muted-foreground">AI Agent</span>
            <span className="flex items-center gap-1 rounded-sm bg-linear-to-b from-background to-card px-1 text-sm text-foreground/80">
              <Image alt="" className="shrink-0" height={12} src="/agents/claude.svg" width={12} />
              {model}
            </span>
          </div>
          {/* The send control, carrying the same gradient, border and shadow as
              the primary button, because in the comp it is the same affordance
              at a smaller size. */}
          <span className="flex h-6 w-6.5 items-center justify-center rounded-lg border border-primary bg-primary text-primary-foreground shadow-(--shadow-button-primary)">
            <SendIcon />
          </span>
        </div>
      </div>
    </div>
  );
}
