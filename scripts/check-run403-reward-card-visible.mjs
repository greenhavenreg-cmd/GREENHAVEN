#!/usr/bin/env node
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const card = readFileSync("components/ghc/registration-bonus-card.tsx", "utf8")
const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"))
const release = readFileSync("lib/app-release.ts", "utf8")

const checks = [
  ["paused registration reward remains visible instead of returning null", /data-testid="registration-reward-paused"/.test(card) && !/Hide completely when disabled[\s\S]{0,180}return null/.test(card)],
  ["paused state explains claim availability without promising a credit", /Claims are temporarily unavailable in this environment/.test(card) && /No reward is credited by displaying this message/.test(card)],
  ["paused state preserves PI balance and history and offers a real refresh action", /existing PI balance and transaction history are unchanged/.test(card) && /onClick=\{\(\) => void refresh\(\)\}/.test(card)],
  ["registration claim still uses the server endpoint and sends no client amount", /fetch\("\/api\/economy\/earnings\/registration-bonus"/.test(card) && /body: JSON\.stringify\(\{\}\)/.test(card)],
  ["package, lockfile and app release versions agree", typeof pkg.version === "string" && lock.version === pkg.version && lock.packages?.["" ]?.version === pkg.version && release.includes(`APP_RELEASE_VERSION = "${pkg.version}"`)],
  ["Run 403 gate is registered exactly once in static and prebuild checks", (pkg.scripts["verify:static"].match(/check-run403-reward-card-visible\.mjs/g) || []).length === 1 && (pkg.scripts["prebuild:checks"].match(/check-run403-reward-card-visible\.mjs/g) || []).length === 1],
]
let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`)
  if (!ok) failed++
}
console.log(`\nRun 403 reward visibility: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
