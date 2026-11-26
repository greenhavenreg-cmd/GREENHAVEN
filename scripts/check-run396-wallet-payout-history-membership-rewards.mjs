#!/usr/bin/env node
/** Source-level regression gate for Run 396: Pi payout history + safe withdrawal outcomes. */
import fs from 'node:fs'
import path from 'node:path'
const read = (p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
const route = read('app/api/economy/earnings/withdrawals/route.ts')
const sheet = read('components/ghc/pi-withdraw-sheet.tsx')
const wallet = read('features/wallet/wallet-screen.tsx')
const membership = read('components/ghc/premium-membership-screen.tsx')
const rewards = read('components/ghc/rewards-centre-screen.tsx')
const checks = [
  ['withdrawal history is authenticated and rate limited', /export async function GET\(request: Request\)/.test(route) && /resolveAuthenticatedUser\(request\.headers\)/.test(route) && /pi-earnings-payout-history:\$\{auth\.userId\}/.test(route)],
  ['history query is server-side user scoped, bounded, and read-only', /gh_pi_earnings_payout_list_owned/.test(route) && /p_user_id: auth\.userId/.test(route) && /p_limit: 50/.test(route)],
  ['history response does not expose recipient UID, idempotency key, or provider receipt', read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql').includes("'grossAtomic', q.gross_atomic::text") && read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql').includes("'providerTxid', q.provider_txid") && !read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql').includes("'recipientPiAppUid'") && !read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql').includes("'idempotencyKey'")],
  ['history validates status and atomic amount strings before projection', /allowedStatuses/.test(route) && /validAtomic/.test(route) && /grossAtomic: gross/.test(route) && /p_limit integer DEFAULT 50/.test(read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql'))],
  ['history RPC is SECURITY DEFINER with a fixed search_path and service-role-only execution', /SECURITY DEFINER/.test(read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql')) && /SET search_path = pg_catalog, public/.test(read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql')) && /REVOKE ALL ON FUNCTION public\.gh_pi_earnings_payout_list_owned\(text, integer\) FROM PUBLIC, anon, authenticated/.test(read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql')) && /GRANT EXECUTE ON FUNCTION public\.gh_pi_earnings_payout_list_owned\(text, integer\) TO service_role/.test(read('supabase/migrations/20261125120000_run396_pi_payout_history_rpc.sql'))],
  ['source classification remains REVIEW_REQUIRED for other targets', /20261125120000_run396_pi_payout_history_rpc\.sql/.test(read('MIGRATION-SOURCE-MANIFEST.csv')) && /REVIEW_REQUIRED/.test(read('MIGRATION-SOURCE-MANIFEST.csv').split('\n').find((line) => line.includes('20261125120000_run396_pi_payout_history_rpc.sql')) || '')],
  ['Pi history loads withdrawal requests only while the Pi history view is open', /if \(!showFullHistory \|\| historyRail !== "pi"\) return/.test(wallet) && /\/api\/economy\/earnings\/withdrawals/.test(wallet) && /credentials: "include", cache: "no-store"/.test(wallet)],
  ['Pi withdrawal history is visibly separate from payment intents', /Pi withdrawals/.test(wallet) && /Pi payments & purchases/.test(wallet) && /Payment intents are shown separately from withdrawals/.test(wallet)],
  ['history presents gross, fee, net, status, and transaction ID without merging rails', /Gross/.test(wallet) && /Fee/.test(wallet) && /Net/.test(wallet) && /Verified transaction ID/.test(wallet) && /GHC ledger and π payments are kept on separate rails/.test(wallet)],
  ['atomic Pi history formatting avoids floating-point conversion', /function formatPiAtomicDisplay\(value: string\)/.test(wallet) && /BigInt\(value\)/.test(wallet)],
  ['uncertain withdrawal outcomes never falsely claim no transfer started', /outcome could not be confirmed because the connection failed/.test(sheet) && !/Network error\. No transfer was started\./.test(sheet)],
  ['withdrawal sheet remains open for non-terminal accepted requests', /let terminalOutcome = false/.test(sheet) && /if \(terminalOutcome\) onCompleted\?\.\(\)/.test(sheet)],
  ['withdrawal result copy tells user not to retry unresolved requests', /do not submit another withdrawal yet/.test(sheet) && /Check Wallet → History/.test(sheet)],
  ['membership continues to use authoritative server status before purchase', /\/api\/membership\/status/.test(membership) && /membershipAuthorityReady/.test(membership)],
  ['membership history stays read-only and separate from active entitlement', /refreshMembershipLifecycle/.test(membership) && /Lifecycle history is a\s*\n\s*\/\/ separate read-only stream/.test(membership)],
  ['rewards UI retains server-authoritative claim contract', /server evaluate\/claim/.test(read('features/rewards/index.ts')) && /\/api\/economy\/rewards/.test(rewards)],
  ['package, lock, and app release metadata are synchronized', (() => { const p = JSON.parse(read('package.json')); const l = JSON.parse(read('package-lock.json')); return p.version === l.version && l.packages?.['']?.version === p.version && read('lib/app-release.ts').includes(`APP_RELEASE_VERSION = "${p.version}"`) })()],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRun 396 wallet/payout/membership/rewards gate: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
