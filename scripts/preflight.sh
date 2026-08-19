#!/bin/sh
# scripts/preflight.sh
#
# Capability-probe script for an agent starting a session on this repo.
# Run at session start (Replit's onBoot, Claude Code's SessionStart hook, or
# by hand) so the agent knows what it can and cannot do BEFORE it promises
# anything to a client — e.g. "I've pushed that" when it never had
# credentials to push at all.
#
# This is a REPORT, not a gate: it must always exit 0. A non-zero exit here
# can wedge a Replit workspace boot, and a broken workspace is worse than a
# missing capability. Every failure path below is therefore handled with an
# if/else — nothing is allowed to abort the script — and a trap forces the
# final exit code to 0 no matter what happens above it.
#
# JSON parsing: harness.config.json is parsed with `node -e` (Node is
# guaranteed present — this is a Node project) rather than a hand-rolled
# grep/sed/awk JSON parser, which is fragile and easy to get subtly wrong on
# quoting/escaping. Each capability is emitted as one tab-separated
# env\tlabel\tfallback line for the shell loop below to consume.

# Never let git wait at an interactive credential prompt that nobody is
# there to answer. This is the single most important line in the script:
# without it, a git probe on a machine with no credentials can hang forever.
GIT_TERMINAL_PROMPT=0
export GIT_TERMINAL_PROMPT

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
MANIFEST="$REPO_ROOT/harness.config.json"

# Ceiling for any single network probe (git ls-remote, gh api user). Keeps
# a probe against an unreachable/blackholed host from stalling the boot.
TIMEOUT_SECS=5

tmp_caps=""
cleanup() {
  [ -n "$tmp_caps" ] && rm -f "$tmp_caps"
  exit 0
}
trap cleanup EXIT

# Run "$@", killing it if it is still running after $1 seconds. This is a
# portable (no GNU coreutils `timeout` dependency) POSIX-sh timeout: fork
# the command, fork a watcher that sleeps then kills it, wait on the
# command, then clean up the watcher.
with_timeout() {
  secs=$1
  shift
  "$@" &
  cmd_pid=$!
  (sleep "$secs" 2>/dev/null; kill -TERM "$cmd_pid" 2>/dev/null) &
  watcher_pid=$!
  status=0
  wait "$cmd_pid" 2>/dev/null || status=$?
  kill "$watcher_pid" 2>/dev/null
  wait "$watcher_pid" 2>/dev/null
  return "$status"
}

report_can() {
  printf 'CAN %s\n' "$1"
}

report_cannot() {
  printf 'CANNOT %s\n' "$1"
  printf '%s\n' "$2"
}

echo "=== Capability preflight: turbo-start-web-agent ==="
echo

# --- Built-in probe 1/3: git reachability -----------------------------
# Presence of a remote is not the same as being able to reach it. Probe the
# real thing with `ls-remote`, not just `git remote -v`.
remote_url=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null)
if [ -z "$remote_url" ]; then
  report_cannot "reach the git remote (no 'origin' remote is configured)" \
"-> Do not claim to push, pull, fetch, or open a PR against a remote. Tell the operator no git remote is configured here and ask them to add one (git remote add origin <url>) before you attempt any git network operation."
else
  if with_timeout "$TIMEOUT_SECS" git -c core.askpass=true \
       -C "$REPO_ROOT" ls-remote --exit-code "$remote_url" HEAD >/dev/null 2>&1; then
    report_can "reach the git remote ($remote_url)"
  else
    report_cannot "reach the git remote ($remote_url)" \
"-> Do not claim to have pushed, pulled, fetched, or opened a PR. Work locally, tell the operator that git networking or credentials are unavailable in this environment, and wait for them to restore access before retrying."
  fi
fi

# --- Built-in probe 2/3: PR ability ------------------------------------
# A token can exist and still be expired, wrong-scoped, or for the wrong
# account, so probe the real capability (`gh api user`) rather than merely
# checking that a token is present in the environment.
if ! command -v gh >/dev/null 2>&1; then
  report_cannot "open pull requests via gh (gh CLI not found)" \
"-> Do not claim to open, update, or merge pull requests. Commit your change locally and ask the operator to install and authenticate the GitHub CLI (gh auth login), or to open the PR themselves from your branch."
else
  if with_timeout "$TIMEOUT_SECS" gh api user >/dev/null 2>&1; then
    report_can "open pull requests via gh (authenticated)"
  else
    report_cannot "open pull requests via gh (gh is installed but not usable: no, expired, or wrong-scoped/account token)" \
"-> Do not claim to open, update, or merge pull requests. Commit your change locally and ask the operator to run gh auth login (or fix the token's scopes/account), or to open the PR themselves from your branch."
  fi
fi

# --- Built-in probe 3/3: package manager usability ---------------------
if command -v pnpm >/dev/null 2>&1 && with_timeout "$TIMEOUT_SECS" pnpm --version >/dev/null 2>&1; then
  report_can "run pnpm commands ($(pnpm --version 2>/dev/null))"
else
  report_cannot "run pnpm commands (pnpm not found or not runnable)" \
"-> Do not run pnpm commands or claim that install/build/lint/test succeeded via pnpm. Ask the operator to install pnpm (corepack enable, per the packageManager field in package.json) before you retry. Do not silently substitute npm or yarn — the lockfile and workspace layout assume pnpm."
fi

echo

# --- Manifest-driven probes (harness.config.json "capabilities") -------
if ! command -v node >/dev/null 2>&1; then
  report_cannot "read capability probes from harness.config.json (node not found)" \
"-> Node is required to parse the manifest. Ask the operator to ensure node is on PATH, then re-run scripts/preflight.sh. Until then, do not assume any manifest-declared capability (e.g. Slack webhook, blob uploads) is either available or unavailable."
elif [ ! -f "$MANIFEST" ]; then
  report_cannot "read capability probes (harness.config.json not found at $MANIFEST)" \
"-> Do not assume any optional capability is available. Ask the operator whether harness.config.json was removed or moved before continuing."
else
  tmp_caps=$(mktemp 2>/dev/null || echo "/tmp/preflight-caps.$$")
  node -e '
    const fs = require("fs");
    const cfg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const caps = Array.isArray(cfg.capabilities) ? cfg.capabilities : [];
    for (const c of caps) {
      const clean = (s) => String(s ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
      process.stdout.write(clean(c.env) + "\t" + clean(c.label) + "\t" + clean(c.fallback) + "\n");
    }
  ' "$MANIFEST" >"$tmp_caps" 2>/dev/null

  if [ ! -s "$tmp_caps" ]; then
    report_cannot "read capability probes (harness.config.json has no usable \"capabilities\" array, or node failed to parse it)" \
"-> Do not assume any optional capability is available. Ask the operator to check that harness.config.json is valid JSON with a top-level \"capabilities\" array."
  else
    tab="$(printf '\t')"
    while IFS="$tab" read -r cap_env cap_label cap_fallback; do
      [ -z "$cap_env" ] && continue
      case "$cap_env" in
        [0-9]*|*[!A-Za-z0-9_]*)
          report_cannot "$cap_label (manifest entry has an invalid \"env\" name: '$cap_env')" \
"-> Treat this capability as unknown rather than assuming it is available. Ask the operator to fix the \"env\" field for this entry in harness.config.json."
          continue
          ;;
      esac
      eval "cap_val=\${$cap_env:-}"
      if [ -n "$cap_val" ]; then
        report_can "$cap_label"
      else
        report_cannot "$cap_label ($cap_env is not set)" "$cap_fallback"
      fi
    done <"$tmp_caps"
  fi
fi

echo
echo "=== End of preflight report ==="
exit 0
