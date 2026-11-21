#!/usr/bin/env node
/** Enforces feature-enabled Testnet Preview flags, Testnet fences and held SQL gates. */
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const profile = read('docs/TESTNET-PREVIEW-ENVIRONMENT.template')
const guide = read('TESTNET-VERCEL-ENVIRONMENT.md')
const policy = read('docs/ENVIRONMENT-VARIABLES.md')
const env = read('.env.example')
const checks = [
  ['Pi platform API mode and Testnet network remain explicitly separated', /PI_ENV=production/.test(profile) && /PI_NETWORK=testnet/.test(profile) && /NEXT_PUBLIC_PI_SANDBOX=true/.test(profile)],
  ['Testnet-only unlock is enabled without enabling Mainnet', /GHC_ENV=testnet/.test(profile) && /GHC_TESTNET_UNLOCK=1/.test(profile)],
  ['Pi purchase surfaces are enabled for Testnet exercise', /NEXT_PUBLIC_GHC_BUY_WITH_PI=true/.test(profile) && /NEXT_PUBLIC_GHC_BUY_WITH_PI_ENABLED=true/.test(profile) && /GHC_BUY_WITH_PI_ENABLED=true/.test(profile)],
  ['Supported rewards, referral settlement and tips are enabled for Testnet', /GHC_REGISTRATION_BONUS_ENABLED=1/.test(profile) && /GHC_ACTIVITY_REWARDS_ENABLED=1/.test(profile) && /GHC_REFERRAL_SETTLEMENT_ENABLED=1/.test(profile) && /GHC_TIPS_ENABLED=true/.test(profile)],
  ['Curation surface is enabled while unverified V2 RPC remains held', /GHC_CURATION_REDISTRIBUTE_ENABLED=1/.test(profile) && /GHC_CURATION_REDISTRIBUTE_V2_ENABLED=false/.test(profile)],
  ['Daily calibration cap V2 and atomic emission V13 remain fail-closed', /GH_GHPV_CALIBRATION_DAILY_CAP_V2_ENABLED=false/.test(profile) && /GHC_ATOMIC_GLOBAL_EMISSION_V13_ENABLED=false/.test(profile)],
  ['Pi payout requests and operator-triggered A2U are enabled; unattended execution remains off', /PI_EARNINGS_ADAPTERS_ENABLED=true/.test(profile) && /PI_EARNINGS_PAYOUT_REQUESTS_ENABLED=true/.test(profile) && /PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=true/.test(profile) && /PI_A2U_ENABLED=true/.test(profile) && /PI_A2U_TESTNET_ONLY=true/.test(profile) && /PI_EARNINGS_AUTO_EXECUTE=false/.test(profile)],
  ['GHC-to-Pi withdrawals are enabled and Testnet-fenced at the documented reference rate', /GHC_WITHDRAWALS_ENABLED=true/.test(profile) && /GHC_WITHDRAWALS_TESTNET_ONLY=true/.test(profile) && /GHC_WITHDRAWAL_GHC_PER_PI=100/.test(profile)],
  ['Internal GHC marketplace payouts and Paystack test route are enabled; live approval is false', /GHC_MARKETPLACE_GHC_PAYOUTS_ENABLED=true/.test(profile) && /PAYSTACK_TRANSFERS_ENABLED=true/.test(profile) && /PAYSTACK_LIVE_TRANSFERS_APPROVED=false/.test(profile)],
  ['Pi domain-validation and API credentials are documented as private provider inputs', /DOMAIN_VALIDATION_KEY/.test(profile) && /PI_API_KEY/.test(profile) && /DOMAIN_VALIDATION_KEY/.test(env) && /PI_API_KEY/.test(env) && /server-only/.test(guide)],
  ['Profile documents Testnet feature enablement and held database-dependent gates', /feature-enabled Testnet Preview overlay/.test(guide) && /SQL-dependent V2\/atomic allocator gates remain disabled/.test(policy)],
  ['E2E flags do not fabricate authenticated identities or session values', /GHC_E2E_ALLOW_TESTNET=1/.test(profile) && /GHC_E2E_COOKIE_A=\s*(?:\r?\n|$)/.test(profile) && /GHC_E2E_COOKIE_B=\s*(?:\r?\n|$)/.test(profile)],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nTestnet profile safety: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
