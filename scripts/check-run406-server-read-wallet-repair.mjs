import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const migration = readFileSync("supabase/migrations/20261125160000_run406_server_read_privilege_reconciliation.sql", "utf8")
const profileRoute = readFileSync("app/api/social/profile/[userId]/posts/route.ts", "utf8")
const profile = readFileSync("components/ghc/profile-screen.tsx", "utf8")
const visibility = readFileSync("lib/server/social/post-visibility.ts", "utf8")
const listings = readFileSync("lib/server/marketplace/listing-store.ts", "utf8")
const wallet = readFileSync("features/wallet/wallet-screen.tsx", "utf8")
const bonus = readFileSync("components/ghc/registration-bonus-card.tsx", "utf8")
const balance = readFileSync("features/wallet/wallet-balance.tsx", "utf8")
const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"))
const release = readFileSync("lib/app-release.ts", "utf8")

const serverTables = ["gh_posts", "gh_post_comments", "gh_post_reactions", "gh_post_curations", "gh_follows", "ghc_user_blocks", "gh_community_members", "gh_saves", "gh_marketplace_listings", "gh_marketplace_variants", "ghc_membership_entitlements"]
const checks = [
  ["least-privilege migration grants server SELECT for every directly-read policy/catalog table", serverTables.every((t) => migration.includes(t)) && migration.includes("GRANT SELECT")],
  ["migration keeps RLS enabled and explicitly denies client table access", migration.includes("ENABLE ROW LEVEL SECURITY") && migration.includes("FROM PUBLIC, anon, authenticated") && migration.includes("has_table_privilege('anon'")],
  ["profile visibility failures remain fail-closed and explain the repair", visibility.includes("return null") && profileRoute.includes("POST_VISIBILITY_UNAVAILABLE") && profile.includes("post privacy rules")],
  ["marketplace catalog remains server-authoritative", listings.includes("supabaseRest(`${q}`") && listings.includes("Marketplace listing query failed")],
  ["registration reward is directly visible from wallet across asset rails", wallet.includes("<RegistrationBonusCard compact={false} />") && wallet.includes("RegistrationBonusCard")],
  ["registration rewards require explicit user action and never auto-claim on mount", !bonus.includes("autoClaimStarted") && !bonus.includes("Automatically reconcile the one-time campaign") && bonus.includes("onClick={() => void onClaim()}")],
  ["wallet hero uses GreenHaven forest styling while keeping PI/GHC rails separate", balance.includes("bg-[#08251e]") && balance.includes("PI and GHC are never added together")],
  ["package, lockfile and app release agree on 0.338.136", pkg.version === "0.338.136" && lock.version === pkg.version && lock.packages?.[""]?.version === pkg.version && release.includes(`APP_RELEASE_VERSION = "${pkg.version}"`)],
  ["Run 406 check is registered once in static and prebuild chains", (pkg.scripts["verify:static"].match(/check-run406-server-read-wallet-repair\.mjs/g) || []).length === 1 && (pkg.scripts["prebuild:checks"].match(/check-run406-server-read-wallet-repair\.mjs/g) || []).length === 1],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) failed++ }
console.log(`\nRun 406 server-read and wallet repair: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
