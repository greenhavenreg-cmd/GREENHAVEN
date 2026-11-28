#!/usr/bin/env node
/**
 * RUN512: config/testnet-payments.env.example must enable every flag the code
 * gates withdrawals, curation, referral earnings and the welcome Pi bonus on,
 * must stay Testnet-only, and must never carry secrets.
 */
import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const raw = readFileSync("config/testnet-payments.env.example", "utf8")
const env = new Map()
for (const line of raw.split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (m) env.set(m[1], m[2].trim())
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (/\.(ts|tsx|mjs)$/.test(name)) out.push(p)
  }
  return out
}
const sources = [...walk("app"), ...walk("lib")].map((p) => [p, readFileSync(p, "utf8")])
const codeMentions = (name) => sources.some(([, text]) => text.includes(name))
const codeComparesToTrue = (name) =>
  sources.some(([, text]) => new RegExp(`${name}[^\\n]{0,120}["']true["']`).test(text))

// Compared to the exact string "true" in code.
const strictTrue = [
  "GHC_WITHDRAWALS_ENABLED",
  "PI_A2U_ENABLED",
  "PI_A2U_TESTNET_ONLY",
  "PI_EARNINGS_PAYOUT_REQUESTS_ENABLED",
  "PI_EARNINGS_PAYOUT_EXECUTION_ENABLED",
  "PI_EARNINGS_ADAPTERS_ENABLED",
  "NEXT_PUBLIC_PI_SANDBOX",
]
// Accept 1/true/yes/on in code.
const truthy = [
  "GHC_TESTNET_UNLOCK",
  "GHC_REGISTRATION_BONUS_ENABLED",
  "GHC_REFERRAL_SETTLEMENT_ENABLED",
  "GHC_CURATION_REDISTRIBUTE_ENABLED",
  "GHC_ACTIVITY_REWARDS_ENABLED",
]
const secrets = [
  "PI_API_KEY", "PI_SERVER_API_KEY", "PI_WALLET_PRIVATE_SEED", "GH_PIN_PROOF_SECRET",
  "PI_EARNINGS_EXECUTOR_KEY", "PAYSTACK_SECRET_KEY", "GHC_PAYOUT_RECONCILIATION_KEY",
]
const guard = (p) => readFileSync(p, "utf8")

const checks = [
  ...strictTrue.map((k) => [`${k} is exactly "true" in the Testnet profile`, env.get(k) === "true"]),
  ...strictTrue.map((k) => [`code still gates on ${k}`, codeMentions(k)]),
  // RUN513: operator flags resolve through the shared Testnet gate (explicit value wins; unset = on only in a Testnet runtime).
  ...strictTrue.filter((k) => k !== "NEXT_PUBLIC_PI_SANDBOX" && k !== "GHC_WITHDRAWALS_ENABLED").map((k) => [`code gates ${k} ("true" or the shared Testnet gate)`, codeComparesToTrue(k) || (guard("lib/server/economy/testnet-unlock.ts").includes(`"${k}"`) && /testnetOperatorFlag|a2uTestnetGate/.test(guard("lib/server/economy/testnet-unlock.ts")))]),
  ["GHC_WITHDRAWALS_ENABLED is still compared to exactly \"true\"", codeComparesToTrue("GHC_WITHDRAWALS_ENABLED")],
  ...truthy.map((k) => [`${k} is enabled in the Testnet profile`, ["1", "true", "yes", "on"].includes((env.get(k) || "").toLowerCase())]),
  ...truthy.map((k) => [`code still gates on ${k}`, codeMentions(k)]),
  ["NEXT_PUBLIC curation and referral flags mirror the server flags", env.get("NEXT_PUBLIC_GHC_CURATION_REDISTRIBUTE_ENABLED") === "true" && env.get("NEXT_PUBLIC_GHC_REFERRAL_SETTLEMENT_ENABLED") === "true"],
  ["PI_NETWORK is testnet", env.get("PI_NETWORK") === "testnet"],
  ["PI_ENV is production (A2U routes require it)", env.get("PI_ENV") === "production" && sources.some(([, t]) => /(PI_ENV|piEnv)\s*!==\s*"production"/.test(t))],
  ["profile never sets VERCEL_ENV", !env.has("VERCEL_ENV")],
  ["live Paystack transfers stay unapproved", env.get("PAYSTACK_LIVE_TRANSFERS_APPROVED") === "false"],
  ["profile header forbids Production use", /Never copy this profile into Vercel Production/.test(raw)],
  ["profile documents Preview environment and NEXT_PUBLIC rebuild", /Preview environment/.test(raw) && /Redeploy after changing them/.test(raw)],
  ["withdrawal operator ids and rate keys are present", env.has("GH_WITHDRAWAL_OPERATOR_IDS") && env.has("GHC_WITHDRAWAL_GHC_PER_PI")],
  ...secrets.map((k) => [`secret ${k} is present and blank`, env.has(k) && env.get(k) === ""]),
  ["no live provider key value in the profile", ![...env.values()].some((v) => /sk_live|pk_live/.test(v))],
  ["code fails closed in Production for the unlock", /vercelEnvironment\s*!==\s*"production"/.test(guard("lib/server/economy/testnet-unlock.ts"))],
  ["code fails closed in Production for withdrawals", /VERCEL_ENV\s*!==\s*"production"/.test(guard("lib/server/economy/withdrawal.ts"))],
  ["welcome bonus campaign migration is in the repo", existsSync("supabase/migrations/20261125130000_run397_testnet_registration_bonus_100_pi.sql")],
]
for (const [label, pass] of checks) { assert.ok(pass, label); console.log(`PASS ${label}`) }
console.log(`RUN512 testnet profile parity: ${checks.length}/${checks.length} passed`)
