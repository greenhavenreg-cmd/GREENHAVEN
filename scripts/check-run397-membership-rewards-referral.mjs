#!/usr/bin/env node
/** Source-level release gate for Run 397 Testnet rewards and referral hardening. */
import fs from 'node:fs'
import path from 'node:path'
const read = (p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
const bonus = read('lib/server/earnings/registration-bonus.ts')
const ledger = read('lib/server/earnings/unified-ledger.ts')
const bonusCard = read('components/ghc/registration-bonus-card.tsx')
const referral = read('lib/server/referral/referral-service.ts')
const referralCard = read('components/ghc/referral-share-card.tsx')
const bonusSql = read('supabase/migrations/20261125130000_run397_testnet_registration_bonus_100_pi.sql')
const referralSql = read('supabase/migrations/20261125140000_run397_referral_quality_caps_and_summary.sql')
const inventory = read('MIGRATION-SOURCE-MANIFEST.csv')
const checks = [
  ['registration reward target is 100 PI in 1e-7 atomic units', /REGISTRATION_BONUS_PI = 100/.test(bonus) && /1_000_000_000/.test(bonus)],
  ['reward remains fail-closed unless explicit bonus flag and Pi sandbox are enabled', /GHC_REGISTRATION_BONUS_ENABLED/.test(bonus) && /sandbox === "true"/.test(bonus) && /isPiSandboxEnv\(\)/.test(bonus) && /PI_NETWORK/.test(read('lib/server/economy/testnet-unlock.ts'))],
  ['old 3 PI RPC response cannot be mistaken for the new campaign', /REGISTRATION_BONUS_MIGRATION_REQUIRED/.test(bonus) && /status\.campaign !== "testnet_registration_100_v1"/.test(bonus)],
  ['campaign uses distinct account-scoped idempotency references', /registration_bonus:testnet_100:v1:/.test(bonusSql) && /pg_advisory_xact_lock/.test(bonusSql)],
  ['historical valid registration credits count toward cumulative target', /SUM\(GREATEST\(amount_atomic, 0\)\)/.test(bonusSql) && /v_target - v_prior/.test(bonusSql)],
  ['operator backfill is bounded, paginated, and requires explicit Testnet confirmation', /p_confirmation text/.test(bonusSql) && /I_CONFIRM_THIS_IS_THE_INTENDED_TESTNET_PROJECT/.test(bonusSql) && /LEAST\(GREATEST\(COALESCE\(p_limit, 250\), 1\), 500\)/.test(bonusSql) && /nextCursor/.test(bonusSql)],
  ['bonus status/claim/backfill RPCs are service-role-only', /REVOKE ALL ON FUNCTION public\.gh_earnings_registration_bonus_status\(text\) FROM PUBLIC, anon, authenticated/.test(bonusSql) && /GRANT EXECUTE ON FUNCTION public\.gh_earnings_testnet_registration_bonus_backfill\(text, text, integer\) TO service_role/.test(bonusSql)],
  ['registration claim requires explicit user action and never auto-claims on surface open', !/Automatically reconcile the one-time campaign/.test(bonusCard) && !/autoClaimStarted/.test(bonusCard) && /onClick=\{\(\) => void onClaim\(\)\}/.test(bonusCard)],
  ['UI describes cumulative target and preserves wallet authorization requirements', /100 π/.test(bonusCard) && /withdrawal remains subject to wallet authorization/.test(bonusCard)],
  ['referral reward has serialized rolling cap and maximum amount', /pg_advisory_xact_lock/.test(referralSql) && /v_recent_count >= 50/.test(referralSql) && /LEAST\(round\(p_charged_ghc \* 0\.05, 4\), 25\.0000\)/.test(referralSql)],
  ['referral summary and queue responses do not return internal referrer IDs', /ghc_referral_summary/.test(referralSql) && /rpc\("ghc_referral_summary"/.test(referral) && !/referrerUserId/.test(referralSql.slice(referralSql.indexOf('CREATE OR REPLACE FUNCTION public.ghc_referral_summary'))) && !/referrerUserId/.test(referralSql.slice(referralSql.indexOf('CREATE OR REPLACE FUNCTION public.ghc_referral_queue_reward')))],
  ['referral status lock is server-authoritative, not shared localStorage state', !/localStorage\.getItem\("ghc\.referral\.locked"\)/.test(referralCard) && !/localStorage\.setItem\("ghc\.referral\.locked"/.test(referralCard)],
  ['referral migration has explicit client revocation and service-role grants', /REVOKE ALL ON FUNCTION public\.ghc_referral_summary\(text\) FROM PUBLIC, anon, authenticated/.test(referralSql) && /GRANT EXECUTE ON FUNCTION public\.ghc_referral_summary\(text\) TO service_role/.test(referralSql)],
  ['Run 397 campaign and referral migrations are classified for operator review and marked Testnet-applied in the canonical apply guide', inventory.includes('20261125130000_run397_testnet_registration_bonus_100_pi.sql,REQUIRED') && inventory.includes('20261125140000_run397_referral_quality_caps_and_summary.sql,REQUIRED') && read('supabase/TESTNET_APPLY_ORDER.md').includes('20261125140000_run397_referral_quality_caps_and_summary.sql') && read('supabase/TESTNET_APPLY_ORDER.md').includes('APPLIED_TESTNET_ONLY_HOLD_OTHER_TARGETS')],
  ['Run 397 gate is registered exactly once in static and prebuild verification', (() => { const p = JSON.parse(read('package.json')); return (p.scripts['verify:static'].match(/check-run397-membership-rewards-referral\.mjs/g) || []).length === 1 && (p.scripts['prebuild:checks'].match(/check-run397-membership-rewards-referral\.mjs/g) || []).length === 1 })()],
  ['package, lockfile and app release metadata match', (() => { const p = JSON.parse(read('package.json')); const l = JSON.parse(read('package-lock.json')); return p.version === l.version && l.packages?.['']?.version === p.version && read('lib/app-release.ts').includes(`APP_RELEASE_VERSION = "${p.version}"`) })()],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRun 397 membership/rewards/referral gate: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
