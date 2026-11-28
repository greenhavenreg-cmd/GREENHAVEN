#!/usr/bin/env node
/** RUN451: explicit Testnet Preview activation for rewards, referrals, curation, commerce and payout rails. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const profile = readFileSync('config/testnet-payments.env.example', 'utf8')
const root = readFileSync('.env.example', 'utf8')
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const required = [
  'GHC_ENV=testnet', 'GHC_TESTNET_UNLOCK=1', 'NEXT_PUBLIC_GHC_TESTNET_UNLOCK=true',
  'GHC_ACTIVITY_REWARDS_ENABLED=1', 'GHC_REGISTRATION_BONUS_ENABLED=1',
  'GHC_CURATION_REDISTRIBUTE_ENABLED=1', 'NEXT_PUBLIC_GHC_CURATION_REDISTRIBUTE_ENABLED=true',
  'GHC_REFERRAL_SETTLEMENT_ENABLED=1', 'NEXT_PUBLIC_GHC_REFERRAL_SETTLEMENT_ENABLED=true',
  'GHC_BUY_WITH_PI_ENABLED=true', 'NEXT_PUBLIC_GHC_BUY_WITH_PI_ENABLED=true',
  'GHC_TIPS_ENABLED=true', 'GHC_WITHDRAWALS_ENABLED=true',
  'GHC_MARKETPLACE_GHC_PAYOUTS_ENABLED=true', 'PI_A2U_ENABLED=true',
  'PI_A2U_TESTNET_ONLY=true', 'PI_EARNINGS_PAYOUT_REQUESTS_ENABLED=true',
  'PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=true', 'PI_EARNINGS_AUTO_EXECUTE=true',
  'PAYSTACK_TRANSFERS_ENABLED=true', 'PI_NETWORK=testnet',
  'NEXT_PUBLIC_PI_SANDBOX=true', 'PI_ENV=production',
]
const checks = [
  ['Testnet profile explicitly enables all configured GHC reward, referral, curation, purchase, withdrawal and payout flags', required.every((line) => profile.split(/\r?\n/).includes(line))],
  ['server-only secrets are not replaced with fake values in the profile', ['PI_EARNINGS_EXECUTOR_KEY=', 'PI_API_KEY=', 'PI_SERVER_API_KEY=', 'PI_WALLET_PRIVATE_SEED=', 'GH_PIN_PROOF_SECRET='].every((line) => profile.split(/\r?\n/).includes(line))],
  ['activation profile explicitly forbids Production/Mainnet use', profile.includes('Never copy this profile into Vercel Production') && profile.includes('PI_NETWORK=testnet') && profile.includes('NEXT_PUBLIC_PI_SANDBOX=true')],
  ['generic root environment remains fail-closed for production safety', /GHC_REGISTRATION_BONUS_ENABLED=0/.test(root) && /GHC_REFERRAL_SETTLEMENT_ENABLED=0/.test(root) && /PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=0/.test(root)],
  ['RUN451 check is registered in static and prebuild suites', ['verify:static', 'prebuild:checks'].every((key) => pkg.scripts[key]?.includes('check-run451-testnet-economy-activation.mjs'))],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN451 Testnet economy activation: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
