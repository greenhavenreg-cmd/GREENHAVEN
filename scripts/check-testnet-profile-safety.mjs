#!/usr/bin/env node
/** Enforces one fail-closed Testnet Preview profile and server-only Pi credentials. */
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const profile = read('docs/TESTNET-PREVIEW-ENVIRONMENT.template')
const guide = read('TESTNET-VERCEL-ENVIRONMENT.md')
const policy = read('docs/ENVIRONMENT-VARIABLES.md')
const env = read('.env.example')
const checks = [
  ['Pi platform API mode and Testnet network remain explicitly separated', /PI_ENV=production/.test(profile) && /PI_NETWORK=testnet/.test(profile) && /NEXT_PUBLIC_PI_SANDBOX=true/.test(profile)],
  ['Testnet-only unlock is enabled without enabling Mainnet', /GHC_ENV=testnet/.test(profile) && /GHC_TESTNET_UNLOCK=1/.test(profile)],
  ['Pi purchase surfaces remain fail-closed', /NEXT_PUBLIC_GHC_BUY_WITH_PI=false/.test(profile) && /GHC_BUY_WITH_PI_ENABLED=false/.test(profile)],
  ['Rewards, referral settlement and tips remain fail-closed', /GHC_REGISTRATION_BONUS_ENABLED=0/.test(profile) && /GHC_ACTIVITY_REWARDS_ENABLED=0/.test(profile) && /GHC_REFERRAL_SETTLEMENT_ENABLED=0/.test(profile) && /GHC_TIPS_ENABLED=false/.test(profile)],
  ['Curation redistribution and V2 remain fail-closed', /GHC_CURATION_REDISTRIBUTE_ENABLED=0/.test(profile) && /GHC_CURATION_REDISTRIBUTE_V2_ENABLED=false/.test(profile)],
  ['Daily calibration cap V2 and atomic emission V13 remain fail-closed', /GH_GHPV_CALIBRATION_DAILY_CAP_V2_ENABLED=false/.test(profile) && /GHC_ATOMIC_GLOBAL_EMISSION_V13_ENABLED=false/.test(profile)],
  ['Pi payout adapters, requests, execution and A2U remain disabled', /PI_EARNINGS_ADAPTERS_ENABLED=false/.test(profile) && /PI_EARNINGS_PAYOUT_REQUESTS_ENABLED=false/.test(profile) && /PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=false/.test(profile) && /PI_A2U_ENABLED=false/.test(profile) && /PI_EARNINGS_AUTO_EXECUTE=false/.test(profile)],
  ['GHC withdrawal intake remains disabled and Testnet-fenced', /GHC_WITHDRAWALS_ENABLED=false/.test(profile) && /GHC_WITHDRAWALS_TESTNET_ONLY=true/.test(profile) && /GHC_WITHDRAWAL_GHC_PER_PI=\s*(?:\r?\n|$)/.test(profile)],
  ['Marketplace payout and Paystack transfers remain disabled; live approval is false', /GHC_MARKETPLACE_GHC_PAYOUTS_ENABLED=false/.test(profile) && /PAYSTACK_TRANSFERS_ENABLED=false/.test(profile) && /PAYSTACK_LIVE_TRANSFERS_APPROVED=false/.test(profile)],
  ['Pi domain-validation and API credentials are documented as private provider inputs', /DOMAIN_VALIDATION_KEY/.test(profile) && /PI_API_KEY/.test(profile) && /DOMAIN_VALIDATION_KEY/.test(env) && /PI_API_KEY/.test(env) && /server-only/.test(guide)],
  ['Profile and operator guide explicitly prohibit blanket feature enablement', /connectivity and verification overlay/.test(guide) && /fail-closed/.test(policy)],
  ['E2E flags do not fabricate authenticated identities or session values', /GHC_E2E_ALLOW_TESTNET=1/.test(profile) && /GHC_E2E_COOKIE_A=\s*(?:\r?\n|$)/.test(profile) && /GHC_E2E_COOKIE_B=\s*(?:\r?\n|$)/.test(profile)],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nTestnet profile safety: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
