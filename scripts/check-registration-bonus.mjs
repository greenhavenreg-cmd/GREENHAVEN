#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const root = process.cwd()
const read = (p) => readFileSync(join(root, p), 'utf8')
const checks = []
const test = (n, ok) => { checks.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${n}`) }

const mod = read('lib/server/earnings/registration-bonus.ts')
const route = read('app/api/economy/earnings/registration-bonus/route.ts')
const card = read('components/ghc/registration-bonus-card.tsx')
const env = read('.env.example')
const migration = read('supabase/migrations/20261125130000_run397_testnet_registration_bonus_100_pi.sql')
const legacyMigration = read('supabase/migrations/20261030010001_registration_bonus_v2_reconciliation.sql')
const ledger = read('lib/server/earnings/unified-ledger.ts')
const backfill = read('scripts/ops/phase2-registration-bonus-backfill-testnet.sql')

test('registration bonus module exists', existsSync(join(root, 'lib/server/earnings/registration-bonus.ts')))
test('new Testnet cumulative registration target is 100 PI (1000000000 atomic)', /REGISTRATION_BONUS_PI = 100/.test(mod) && /1_000_000_000/.test(mod) && /1000000000/.test(migration))
test('legacy v1/v2 credits count toward the cumulative 100 PI top-up', /v_target - v_prior/.test(migration) && /source_table = 'registration_bonus'/.test(migration) && /priorAmountPi/.test(migration))
test('new campaign has a separate account-scoped idempotency reference', /registration_bonus:\$\{REGISTRATION_BONUS_POLICY_VERSION\}/.test(mod) && /registration_bonus:testnet_100:v1:/.test(migration) && /registration_bonus:v2_topup:/.test(legacyMigration))
test('claims use privileged database-side reconciliation RPCs', /claimRegistrationBonusPolicy/.test(mod) && /gh_earnings_registration_bonus_claim/.test(ledger) && /gh_earnings_post_credit/.test(migration))
test('never trusts client amount', /Body ignored|server-derived/.test(route))
test('GET and POST routes exist', /export async function GET/.test(route) && /export async function POST/.test(route))
test('claim UI on rewards', /RegistrationBonusCard/.test(read('components/ghc/rewards-centre-screen.tsx')))
test('claim UI is reachable from both Rewards and Wallet', (() => {
  const rewards = /RegistrationBonusCard/.test(read('components/ghc/rewards-centre-screen.tsx'))
  const walletHasCard = /<RegistrationBonusCard compact={false} \/>/.test(read('features/wallet/wallet-screen.tsx'))
  // Wallet surfaces the claim directly; Rewards remains the full programme hub.
  return rewards && walletHasCard
})())
test('flag documented in env example', /GHC_REGISTRATION_BONUS_ENABLED/.test(env))
test('bonus fails closed unless explicitly enabled and Pi sandbox is true', /GHC_REGISTRATION_BONUS_ENABLED \?\? \"0\"/.test(mod) && /sandbox === \"true\"/.test(mod) && /GHC_REGISTRATION_BONUS_ENABLED=0/.test(env))
test('status lookup is direct and not limited to statement pagination', /gh_earnings_registration_bonus_status/.test(ledger) && /gh_earnings_registration_bonus_status/.test(migration))
test('claim RPC serializes concurrent same-user requests', /pg_advisory_xact_lock/.test(migration))
test('historical v1 exact-credit reconciliation remains preserved', /amount_atomic = 500000/.test(legacyMigration) && /asset = 'PI'/.test(legacyMigration) && /source_table = 'registration_bonus'/.test(legacyMigration) && /LEGACY_BONUS_REVIEW_REQUIRED/.test(legacyMigration))
test('claim RPC restricted to service role', /REVOKE ALL ON FUNCTION public\.gh_earnings_registration_bonus_claim\(text\) FROM PUBLIC, anon, authenticated/.test(migration) && /GRANT EXECUTE ON FUNCTION public\.gh_earnings_registration_bonus_claim\(text\) TO service_role/.test(migration))
test('migration does not auto-credit accounts merely by being applied', /operator-only bounded backfill/i.test(migration) && /p_confirmation text/.test(migration) && /I_CONFIRM_THIS_IS_THE_INTENDED_TESTNET_PROJECT/.test(migration))
test('operator backfill is explicitly Testnet-only and calls the bounded idempotent RPC', /INTENDED TESTNET PROJECT ONLY; NEVER MAINNET/.test(backfill) && /gh_earnings_testnet_registration_bonus_backfill/.test(backfill) && /registration_bonus:testnet_100:v1:/.test(backfill))
test('operator backfill fails closed if any batch or cursor fails', /RAISE EXCEPTION/.test(backfill) && /cursor failed to advance/.test(backfill))

const failed = checks.filter((x) => !x).length
console.log(`\nRegistration bonus: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
