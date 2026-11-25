import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const migrationPath = path.join(root, 'supabase/migrations/20261124143000_run390_marketplace_membership_feed_read_grants.sql')
const migration = fs.readFileSync(migrationPath, 'utf8')
const feed = fs.readFileSync(path.join(root, 'app/api/social/feed/route.ts'), 'utf8')
const membership = fs.readFileSync(path.join(root, 'lib/server/membership/entitlement-store.ts'), 'utf8')
const membershipWriter = fs.readFileSync(path.join(root, 'lib/server/economy/durable-emission.ts'), 'utf8')
const marketplace = fs.readFileSync(path.join(root, 'lib/server/marketplace/listing-store.ts'), 'utf8')
const membershipRoute = fs.readFileSync(path.join(root, 'app/api/membership/activate/route.ts'), 'utf8')
const membershipUi = fs.readFileSync(path.join(root, 'components/ghc/premium-membership-screen.tsx'), 'utf8')
const checks = [
  ['migration validates all four required tables before grants', ['ghc_membership_entitlements', 'gh_user_mutes', 'gh_marketplace_listings', 'gh_marketplace_variants'].every((name) => migration.includes(`'${name}'`)) && migration.includes('required table')],
  ['RLS remains enabled on every server-only table', ['ghc_membership_entitlements', 'gh_user_mutes', 'gh_marketplace_listings', 'gh_marketplace_variants'].every((name) => migration.includes(`ALTER TABLE public.${name} ENABLE ROW LEVEL SECURITY`))],
  ['client roles are explicitly revoked', /REVOKE ALL ON TABLE[\s\S]*FROM PUBLIC, anon, authenticated/.test(migration)],
  ['service role receives SELECT only', /GRANT SELECT ON TABLE[\s\S]*TO service_role/.test(migration) && !/GRANT (?:INSERT|UPDATE|DELETE|ALL)[\s\S]*TO service_role/.test(migration)],
  ['migration verifies server SELECT and client denial', migration.includes("has_table_privilege('service_role'") && migration.includes("has_table_privilege('anon'") && migration.includes("has_table_privilege('authenticated'")],
  ['feed privacy filter reads authoritative mute rows', feed.includes('gh_user_mutes?muter_id=eq.') && feed.includes('FEED_PRIVACY_FILTER_UNAVAILABLE')],
  ['membership authority reads durable entitlement table', membership.includes('ghc_membership_entitlements?user_id=eq.') && membership.includes('MEMBERSHIP_STORE_UNAVAILABLE')],
  ['membership writes remain RPC-mediated', membership.includes('durableMembershipUpsert') && membershipWriter.includes('ghc_membership_upsert')],
  ['Pi membership purchase requires completed, verified, catalog-bound payment intent', /method: z\.enum\(\[\"pi\", \"ghc\"\]\)/.test(membershipRoute) && membershipRoute.includes('isVerifiedPiMembershipIntent(intent)') && membershipRoute.includes('PAYMENT_NOT_COMPLETED') && membershipRoute.includes('PRODUCT_MISMATCH')],
  ['GHC membership purchase remains atomic through server RPC', membershipRoute.includes('ghc_purchase_membership') && membershipRoute.includes('ghc_purchase_membership') && membershipRoute.includes('INSUFFICIENT_BALANCE')],
  ['purchase UI waits for authoritative membership status before either rail', membershipUi.includes('membershipAuthorityReady') && membershipUi.includes('purchaseWithPiCoin') && membershipUi.includes('purchaseWithGhcCoin')],
  ['marketplace catalog reads server-filtered listing table', marketplace.includes('gh_marketplace_listings?') && marketplace.includes('gh_marketplace_variants?')],
  ['marketplace writes remain RPC-mediated', marketplace.includes('gh_marketplace_listing_upsert') && marketplace.includes('gh_marketplace_listing_upsert_with_variants')],
  ['no client-side bypass or financial mutation added', !/NEXT_PUBLIC_.*(?:SERVICE|ROLE|SECRET|KEY)/i.test(migration) && !/UPDATE\s+public\.(?:ghc_transactions|ghc_membership_entitlements)|INSERT\s+INTO\s+public\.ghc_transactions/i.test(migration)],
]
let failed = 0
for (const [label, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`)
  if (!pass) failed++
}
console.log(`RUN390 read-grant repair: ${checks.length - failed}/${checks.length} checks passed`)
if (failed) process.exit(1)
