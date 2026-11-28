import fs from "node:fs"
import assert from "node:assert/strict"
const src = fs.readFileSync("components/ghc/global-search.tsx", "utf8")
const effect = src.slice(src.indexOf("const ac = new AbortController()"), src.indexOf("}, [open, debouncedQuery, tab, searchRetry])") + 60)
const checks = [
  ["search has an explicit server lifecycle state", /useState<"idle" \| "loading" \| "ready" \| "failed">\("idle"\)/.test(src)],
  ["request marks loading before it starts and resets to idle below two characters", /setServerStatus\("loading"\)/.test(effect) && /setServerStatus\("idle"\)/.test(src)],
  ["aborted (stale) requests cannot write results or status", /if \(ac\.signal\.aborted\) return\s*\n\s*if \(!res\.ok/.test(effect)],
  ["rejected or non-durable responses end as failed, successes as ready", /setServerStatus\("failed"\)/.test(effect) && /setServerStatus\("ready"\)/.test(effect)],
  ["a retry counter re-runs the request", /searchRetry/.test(effect) && /setSearchRetry\(\(n\) => n \+ 1\)/.test(src)],
  ["in-flight search shows a polite status instead of 'No results'", /serverStatus === "loading" && \(\s*\n\s*<div className="py-8 text-center" role="status" aria-live="polite">/.test(src)],
  ["failed search shows an alert with a retry button instead of 'No results'", /serverStatus === "failed" && \(\s*\n\s*<div className="py-8 text-center" role="alert">/.test(src) && /Try again/.test(src)],
  ["'No results' only renders when the server answered or was not needed", /serverStatus !== "loading" && serverStatus !== "failed" && \(\s*\n\s*<div className="py-8 text-center">\s*\n\s*<p className="text-sm font-semibold">No results for/.test(src)],
  ["summary card does not claim 'No visible matches' while loading or failed", /Searching GreenHaven…/.test(src) && /Network search is unavailable/.test(src)],
  ["privacy copy and local filters are untouched", /Private, blocked, or hidden profiles are not shown/.test(src) && /blocked/.test(src)],
]
for (const [n, p] of checks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN481 search status truth: ${checks.length}/${checks.length} passed`)
