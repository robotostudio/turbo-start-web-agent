import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

test("catalog is in sync with the schema registry", () => {
  assert.doesNotThrow(() =>
    execFileSync("node", ["--experimental-strip-types", "scripts/generate-catalog.ts", "--check"], {
      stdio: "pipe",
    }),
  );
});
