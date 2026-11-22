#!/usr/bin/env node
/** Enforces the authoritative connectivity-only Testnet Preview profile. */
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const profile = read('docs/TESTNET-PREVIEW-ENVIRONMENT.template')
const guide = read('TESTNET-VERCEL-ENVIRONMENT.md')
const policy = read('docs/ENVIRONMENT-VARIABLES.md')
const env = read('.env.example')
const config = read('lib/system-config.ts')
const checks = [
  ['Pi platform API mode and Testnet network remain explicitly separated', /PI_ENV=production/.test(profile) && /PI_NETWORK=testnet/.test(profile) && /NEXT_PUBLIC_PI_SANDBOX=true/.test(profile)],
  ['Testnet identity unlock is explicitly scoped to Testnet', /GHC_ENV=testnet/.test(profile) && /GHC_TESTNET_UNLOCK=1/.test(profile) && /NEXT_PUBLIC_GHC_TESTNET_UNLOCK=true/.test(profile)],
  ['Registered Pi Developer Portal app slug matches the GREENHAVEN Sandbox app', /APP_SLUG:\s*"greenhaven-2tm2"/.test(config) && /greenhaven-2tm2/.test(guide)],
  ['Pi purchase surfaces remain disabled in the connectivity-only profile', /NEXT_PUBLIC_GHC_BUY_WITH_PI=false/.test(profile) && /NEXT_PUBLIC_GHC_BUY_WITH_PI_ENABLED=false/.test(profile) && /GHC_BUY_WITH_PI_ENABLED=false/.test(profile)],
  ['Rewards, referrals, tips and curation remain disabled', /GHC_REGISTRATION_BONUS_ENABLED=0/.test(profile) && /GHC_ACTIVITY_REWARDS_ENABLED=0/.test(profile) && /GHC_REFERRAL_SETTLEMENT_ENABLED=0/.test(profile) && /GHC_TIPS_ENABLED=false/.test(profile) && /GHC_CURATION_REDISTRIBUTE_ENABLED=0/.test(profile)],
  ['Unreconciled curation and emission SQL gates remain fail-closed', /GHC_CURATION_REDISTRIBUTE_V2_ENABLED=false/.test(profile) && /GH_GHPV_CALIBRATION_DAILY_CAP_V2_ENABLED=false/.test(profile) && /GHC_ATOMIC_GLOBAL_EMISSION_V13_ENABLED=false/.test(profile)],
  ['Pi payout, A2U and unattended execution remain disabled', /PI_EARNINGS_ADAPTERS_ENABLED=false/.test(profile) && /PI_EARNINGS_PAYOUT_REQUESTS_ENABLED=false/.test(profile) && /PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=false/.test(profile) && /PI_A2U_ENABLED=false/.test(profile) && /PI_A2U_TESTNET_ONLY=true/.test(profile) && /PI_EARNINGS_AUTO_EXECUTE=false/.test(profile)],
  ['GHC-to-Pi withdrawal intake remains disabled and Testnet-fenced', /GHC_WITHDRAWALS_ENABLED=false/.test(profile) && /GHC_WITHDRAWALS_TESTNET_ONLY=true/.test(profile)],
  ['Marketplace payouts and Paystack transfers remain disabled; live approval is false', /GHC_MARKETPLACE_GHC_PAYOUTS_ENABLED=false/.test(profile) && /PAYSTACK_TRANSFERS_ENABLED=false/.test(profile) && /PAYSTACK_LIVE_TRANSFERS_APPROVED=false/.test(profile)],
  ['Private Pi and Supabase credentials are documented, blank in templates and server-only', /DOMAIN_VALIDATION_KEY=/.test(profile) && /PI_API_KEY=/.test(profile) && /SUPABASE_SERVICE_ROLE_KEY=/.test(profile) && /DOMAIN_VALIDATION_KEY/.test(env) && /PI_API_KEY/.test(env) && /server-only/.test(guide)],
  ['Guide describes connectivity-only profile and correct bearer-token /v2/me semantics', /connectivity\/authentication-only/.test(guide) && /bearer access token/.test(guide)],
  ['E2E scaffolding does not fabricate authenticated identities or sessions', /GHC_E2E_ALLOW_TESTNET=1/.test(profile) && /GHC_E2E_COOKIE_A=\s*(?:\r?\n|$)/.test(profile) && /GHC_E2E_COOKIE_B=\s*(?:\r?\n|$)/.test(profile)],
  ['Canonical environment policy keeps financial rails fail-closed', /GHC_WITHDRAWALS_ENABLED=false/.test(policy) && /canonical `\.env.example` intentionally defaults/.test(policy)],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nTestnet profile safety: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
