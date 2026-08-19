import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { formatDate } from "./format.ts";

test("formatDate renders a long-form date", () => {
  assert.equal(formatDate("2026-08-17T00:00:00.000Z"), "August 17, 2026");
});

test("formatDate keeps a single-digit day unpadded", () => {
  assert.equal(formatDate("2026-08-03T00:00:00.000Z"), "August 3, 2026");
});

// The regression this module exists to prevent: a date-only frontmatter value
// becomes midnight UTC, which is the previous evening in every zone west of
// Greenwich — so an unpinned formatter publishes the post a day early there.
// Run in a child process because TZ is read once when the process starts:
// reassigning process.env.TZ in this one would prove nothing, and the whole
// point is to exercise a machine that is NOT on UTC (as this one may well be).
test("formatDate reads midnight UTC as the authored day on a machine west of UTC", () => {
  const moduleUrl = pathToFileURL(new URL("format.ts", import.meta.url).pathname).href;
  const output = execFileSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--no-warnings",
      "-e",
      `import(${JSON.stringify(moduleUrl)}).then((m) => process.stdout.write(m.formatDate("2026-01-01T00:00:00.000Z")))`,
    ],
    { env: { ...process.env, TZ: "America/Los_Angeles" }, encoding: "utf8" },
  );
  assert.equal(output, "January 1, 2026");
});
