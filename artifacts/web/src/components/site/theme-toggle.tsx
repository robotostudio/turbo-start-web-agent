"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Choice = "system" | "light" | "dark";

// "system" is the absence of a stored value, so it takes the same path as a
// first-ever visit and the pre-paint script in layout.tsx, which understands
// only the two explicit values, needs nothing kept in sync.
const STORAGE_KEY = "theme";

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const apply = (choice: Choice) => {
  const dark = choice === "dark" || (choice === "system" && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
};

function MonitorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

const OPTIONS: { value: Choice; label: string; Icon: () => React.ReactElement }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
];

export function ThemeToggle() {
  // null, not a guess: the server cannot know the choice, and defaulting to
  // "system" would flash the wrong segment for anyone who picked light or dark.
  const [choice, setChoice] = useState<Choice | null>(null);

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })();
    setChoice(stored === "dark" || stored === "light" ? stored : "system");
  }, []);

  // Only while following the OS: a visitor who has explicitly chosen light
  // should not have their page flip when the system switches at sunset.
  useEffect(() => {
    if (choice !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => apply("system");
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [choice]);

  const select = (next: Choice) => {
    setChoice(next);
    apply(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or storage disabled. The theme still changes for this
      // page; it just will not be remembered.
    }
  };

  return (
    // Toggle buttons, not a radio group: a radiogroup owes the reader a roving
    // tabindex and arrow-key navigation. Each button's own aria-label names it,
    // so the group is announced without a visible heading.
    <div className="inline-flex gap-1 rounded-full border border-border p-1">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={choice === value}
          aria-label={label}
          onClick={() => select(value)}
          className={cn(
            "flex size-8 items-center justify-center rounded-full transition-colors",
            choice === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
