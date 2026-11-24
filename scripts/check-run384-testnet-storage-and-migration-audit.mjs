#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const unlock = read('lib/server/economy/testnet-unlock.ts')
const env = read('.env.example')
const media = read('app/api/media/direct-upload-intent/route.ts')
const dailyPrompt = read('components/ghc/daily-claim-prompt.tsx')
const recovered = read('supabase/migrations/20261111064320_gh_direct_call_tables_foundation.sql')
const recoveredIndex = read('supabase/migrations/20261122133100_gh_call_sessions_conversation_fk_index.sql')
const indexes = read('supabase/migrations/20261124110000_run384_research_foreign_key_indexes.sql')
const restGrants = read('supabase/migrations/20261124120000_run384_server_rest_table_grants.sql')
const pkg = JSON.parse(read('package.json'))
const checklist = read('docs/MIGRATION_CHECKLIST.md')
const checks = [
  ['Testnet product unlock requires PI_NETWORK=testnet and denies Vercel Production', /network === "testnet" && vercelEnvironment !== "production"/.test(unlock)],
  ['sandbox and operator flags cannot bypass unknown/Mainnet network fence', /if \(!isTestnetRuntime\(\)\) return false/.test(unlock) && /isTestnetRuntime\(\) && \(isExplicitTestnetUnlock\(\) \|\| isPiSandboxEnv\(\)\)/.test(unlock)],
  ['explicit false financial feature flags override sandbox fallback', unlock.includes('configuredFlag("GHC_ACTIVITY_REWARDS_ENABLED")') && unlock.includes('configuredFlag("GHC_BUY_WITH_PI_ENABLED")') && unlock.includes('return configured ?? isTestnetProductUnlocked()')],
  ['example financial and optional feature flags default off', [
    'NEXT_PUBLIC_GHC_TESTNET_UNLOCK=false','NEXT_PUBLIC_GHC_REFERRAL_SETTLEMENT_ENABLED=false',
    'NEXT_PUBLIC_GHC_BUY_WITH_PI=false','NEXT_PUBLIC_GHC_CURATION_REDISTRIBUTE_ENABLED=false',
    'GHC_WITHDRAWALS_ENABLED=false','GHC_BUY_WITH_PI_ENABLED=false','GHC_TESTNET_UNLOCK=0',
    'GHC_CURATION_REDISTRIBUTE_ENABLED=0','GHC_REFERRAL_SETTLEMENT_ENABLED=0',
    'GHC_ACTIVITY_REWARDS_ENABLED=0','GHC_MARKETPLACE_GHC_PAYOUTS_ENABLED=false','GHC_TIPS_ENABLED=false',
  ].every((line) => env.split(/\r?\n/).includes(line))],
  ['direct upload stops when private bucket provisioning fails', /const bucketReady = await ensureMediaBucket\(storageBucket\)/.test(media) && /if \(!bucketReady\.ok\)[\s\S]{0,160}MEDIA_BUCKET_UNAVAILABLE/.test(media) && media.indexOf('if (!bucketReady.ok)') < media.indexOf('const signRes = await fetch')],
  ['daily GHC claim FAB falls back to canonical verified identity when profile hydration is unavailable', dailyPrompt.includes('IdentityService.getCurrentUserId()') && /identityUserId !== \"current-user\"/.test(dailyPrompt) && /identityUserId !== \"anonymous\"/.test(dailyPrompt) && /const showFab = Boolean\(userId\)/.test(dailyPrompt)],
  ['recovered direct-call foundation and follow-up index migrations are explicitly identified as catalog reconstructions', /reconstructed from the live PostgreSQL catalog/.test(recovered) && /not[^.]*byte-identical/.test(recovered) && /DO NOT re-apply it there/.test(recovered) && /catalog-derived reconstruction/.test(recoveredIndex) && /DO NOT replay it there/.test(recoveredIndex)],
  ['recovered direct-call tables retain deny-client RLS and server-only grants', ['gh_call_sessions','gh_call_signals'].every((table) => recovered.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`) && recovered.includes(`${table}_no_client`)) && /GRANT ALL ON TABLE public\.gh_call_sessions TO service_role/.test(recovered) && /GRANT SELECT, INSERT, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLE public\.gh_call_signals TO service_role/.test(recovered) && /FROM PUBLIC, anon, authenticated/.test(recovered)],
  ['all 17 advisor-identified research/evidence foreign keys receive indexes', (indexes.match(/CREATE INDEX IF NOT EXISTS/g) || []).length === 17 && !/^\s*DROP\b/im.test(indexes)],
  ['13 additional direct-REST tables receive method-scoped server grants with client access revoked', ['gh_conversation_members','gh_marketplace_variants','gh_media_assets','gh_pi_a2u_executions','gh_pi_wallet_authorizations','gh_post_comments','gh_posts','gh_saves','gh_seller_payout_requests','gh_step_ups','gh_webauthn_challenges','gh_webauthn_credentials','ghc_community_reports'].every((table) => restGrants.includes(`public.${table}`) && restGrants.includes(`TO service_role`)) && (restGrants.match(/REVOKE ALL ON TABLE/g) || []).length === 13 && /GRANT SELECT, INSERT, UPDATE ON TABLE public\.gh_step_ups TO service_role/.test(restGrants) && /GRANT SELECT ON TABLE public\.gh_seller_payout_requests TO service_role/.test(restGrants) && /GRANT INSERT ON TABLE public\.ghc_community_reports TO service_role/.test(restGrants)],
  ['financial execution and payout records receive read-only grants; no broad grants are issued', /GRANT SELECT ON TABLE public\.gh_pi_a2u_executions TO service_role/.test(restGrants) && /GRANT SELECT ON TABLE public\.gh_pi_wallet_authorizations TO service_role/.test(restGrants) && /GRANT SELECT ON TABLE public\.gh_seller_payout_requests TO service_role/.test(restGrants) && !/GRANT (?:ALL|[^;]*(?:INSERT|UPDATE|DELETE)) ON TABLE public\.(?:gh_pi_a2u_executions|gh_pi_wallet_authorizations|gh_seller_payout_requests)/.test(restGrants) && !/GRANT ALL ON TABLE/.test(restGrants)],
  ['recovered and new migrations are held for review in generated checklist', /20261111064320_gh_direct_call_tables_foundation\.sql[\s\S]{0,100}REVIEW_REQUIRED/.test(checklist) && /20261122133100_gh_call_sessions_conversation_fk_index\.sql[\s\S]{0,100}REVIEW_REQUIRED/.test(checklist) && /20261124110000_run384_research_foreign_key_indexes\.sql[\s\S]{0,100}REVIEW_REQUIRED/.test(checklist) && /20261124120000_run384_server_rest_table_grants\.sql[\s\S]{0,100}REVIEW_REQUIRED/.test(checklist)],
  ['RUN384 static and runtime checks are registered once in static and prebuild gates', ['prebuild:checks','verify:static'].every((key) => ['check-run384-testnet-storage-and-migration-audit.mjs','test-run384-testnet-unlock-fence.mjs'].every((script) => (pkg.scripts[key].match(new RegExp(script, 'g')) || []).length === 1))],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN384 Testnet/storage/migration hardening: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
