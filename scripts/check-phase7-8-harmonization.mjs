#!/usr/bin/env node
/**
 * GreenHaven Phase 7/8 harmonization contract.
 * Verifies programme ownership, release identity, and complete registration of
 * the existing focused source/runtime gates. It performs no network or DB work.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const read = (p) => readFileSync(join(root, p), "utf8")
const pkg = JSON.parse(read("package.json"))
const lock = JSON.parse(read("package-lock.json"))
const release = read("lib/app-release.ts")
const programme = read("docs/PHASE-7-8-HARMONIZED-PROGRAM-2026-11-24.md")
const prebuild = pkg.scripts?.["prebuild:checks"] || ""
const verify = pkg.scripts?.["verify:static"] || ""
const checks = []
const test = (name, ok) => {
  checks.push(Boolean(ok))
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`)
}

const requiredGates = [
  "check-phase7-community-cache-isolation.mjs",
  "test-phase7-community-cache-isolation.mjs",
  "check-phase7-governance-closeout.mjs",
  "check-phase7-premium-profile-experience.mjs",
  "test-phase7-professional-identity-sanitizer.mjs",
  "test-phase7-public-profile-privacy.mjs",
  "check-phase7-identity-showcase.mjs",
  "check-phase7-marketplace-commerce.mjs",
  "check-phase7-social-experience.mjs",
  "check-phase7-pi-identity-withdrawal.mjs",
  "check-phase7-a2u-orchestration.mjs",
  "check-phase7-treasury-operations.mjs",
  "check-phase7-treasury-completion.mjs",
  "check-phase8-profile-matching.mjs",
  "check-phase8-cross-domain-settlement.mjs",
  "test-phase8-cross-domain-settlement.mjs",
  "check-phase8-earnings-dashboard.mjs",
  "check-phase8-rewards-entry.mjs",
  "check-phase8-rewards-history.mjs",
  "check-phase8-rewards-release-gate.mjs",
  "check-phase8-verified-missions.mjs",
  "check-phase8-trust-notification-results.mjs",
  "check-phase8-wallet-history-foundation.mjs",
]

test("package, lockfile and app release versions agree", pkg.version === lock.version && lock.packages?.[""].version === pkg.version && release.includes(`APP_RELEASE_VERSION = "${pkg.version}"`))
test("harmonized programme document exists and declares the phase-numbering rule", programme.includes("Phase numbers are historical labels") && programme.includes("one programme register"))
test("programme preserves separate identity, community, commerce and financial authorities", ["Pi UID must never be substituted for GH user ID", "server-side", "financial ledger", "account-scoped"].every((term) => programme.includes(term)))
test("all focused Phase 7/8 gates are registered exactly once in prebuild", requiredGates.every((gate) => (prebuild.match(new RegExp(gate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length === 1))
test("all focused Phase 7/8 gates are registered exactly once in static verification", requiredGates.every((gate) => (verify.match(new RegExp(gate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length === 1))
test("the harmonization gate itself is registered once in both release pipelines", (prebuild.match(/check-phase7-8-harmonization\.mjs/g) || []).length === 1 && (verify.match(/check-phase7-8-harmonization\.mjs/g) || []).length === 1)
test("source programme explicitly prohibits automatic migration replay and live financial execution", programme.includes("No automatic migration replay") && programme.includes("No live financial execution"))
test("release blockers remain explicit rather than inferred from static passes", programme.includes("NOT production approved") && programme.includes("24.15.x"))

const failed = checks.filter((ok) => !ok).length
console.log(`\nPhase 7/8 harmonization: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
