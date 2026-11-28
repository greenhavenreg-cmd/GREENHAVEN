#!/usr/bin/env node
/** RUN513/RUN514: shared Testnet A2U gate, tap=like / hold=curation vote button, one-line action row. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
const r = (p) => readFileSync(p, "utf8")
const bar = r("components/ghc/post-action-bar.tsx")
const card = r("components/ghc/enhanced-post-card.tsx")
const gate = r("lib/server/economy/testnet-unlock.ts")
const wd = r("app/api/economy/earnings/withdrawals/route.ts")
const routes = [
  "app/api/economy/earnings/withdrawals/readiness/route.ts",
  "app/api/economy/earnings/withdrawals/execute/route.ts",
  "app/api/payments/a2u/create/route.ts",
  "app/api/payments/a2u/complete/route.ts",
  "app/api/economy/rewards/pi-cashback/claim/route.ts",
  "lib/server/earnings/reward-adapters.ts",
  "lib/server/payments/a2u-orchestration.ts",
].map((p) => [p, r(p)])
const checks = [
  ["shared gate exports testnetOperatorFlag and a2uTestnetGate", /export function testnetOperatorFlag/.test(gate) && /export function a2uTestnetGate/.test(gate)],
  ["unset operator flags default on only in a Testnet runtime", /configuredFlag\(name\) \?\? isTestnetRuntime\(\)/.test(gate)],
  ["Testnet runtime still excludes Vercel Production and requires PI_NETWORK=testnet", /network === "testnet" && vercelEnvironment !== "production"/.test(gate)],
  ["withdrawal route uses the shared gate and reports missing names", /a2uTestnetGate\(resolvePiSandbox\(\)\)/.test(wd) && /missing: gate\.missing/.test(wd)],
  ["every A2U surface uses the shared gate", routes.every(([, t]) => /a2uTestnetGate/.test(t))],
  ["secrets are never defaulted (executor key, API key, seed, PIN proof stay required)", /PI_EARNINGS_EXECUTOR_NOT_CONFIGURED/.test(wd) && /PI_SERVER_CREDENTIALS_MISSING/.test(wd) && /PIN_PROOF_SECRET_MISSING/.test(wd)],
  ["GHC withdrawals flag still exactly true", /GHC_WITHDRAWALS_ENABLED === "true"/.test(r("lib/server/economy/withdrawal.ts"))],
  ["vote button tap calls like, never curation", /onLike\?\.\(\)/.test(bar) && /Tap = social like/.test(card)],
  ["vote button hold opens curation after 450ms", /CURATION_HOLD_MS = 450/.test(bar) && /openCuration/.test(bar) && /onContextMenu/.test(bar)],
  ["quality chip is the keyboard route into curation", /aria-label=\{`Community curation, quality/.test(bar)],
  ["curation panel keeps upvote, downvote, weight and server-confirmed votes", /voteBtn\("upvote"\)/.test(bar) && /voteBtn\("downvote"\)/.test(bar) && /aria-label="Vote weight"/.test(bar) && /void handleCuration\(c\)/.test(card)],
  ["vote, quality, comment, save and share share one non-wrapping line", /gh-post-action-line flex min-w-0 flex-nowrap/.test(bar) && /aria-label="Respond to post"/.test(bar)],
  ["reaction tray closes itself", /setTimeout\(\(\) => setShowReactions\(false\), 6000\)/.test(card)],
  ["story rail uses compact 88x128 cards", /h-\[128px\] w-\[88px\]/.test(r("components/ghc/profile-story-section.tsx"))],
]
for (const [label, pass] of checks) { assert.ok(pass, label); console.log(`PASS ${label}`) }
console.log(`RUN513/514 checks: ${checks.length}/${checks.length} passed`)
