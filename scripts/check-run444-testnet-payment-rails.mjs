#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(p, 'utf8')
const profile = read('config/testnet-payments.env.example')
const paystack = read('lib/server/payouts/paystack.ts')
const ghcWithdraw = read('lib/server/economy/withdrawal.ts')
const marketplace = read('app/api/marketplace/payouts/[requestId]/reconcile-ghc/route.ts')
const safe = read('.env.example')
const checks = [
  ['dedicated activation profile is explicitly Testnet and Preview-only', /GHC_ENV=testnet/.test(profile) && /PI_NETWORK=testnet/.test(profile) && /NEXT_PUBLIC_PI_SANDBOX=true/.test(profile) && /Never copy this profile into Vercel Production/.test(profile)],
  ['Pi A2U and earnings payout request/execution rails are enabled in the Testnet profile', ['PI_A2U_ENABLED=true','PI_A2U_TESTNET_ONLY=true','PI_EARNINGS_PAYOUT_REQUESTS_ENABLED=true','PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=true','PI_EARNINGS_AUTO_EXECUTE=true'].every((x) => profile.split(/\r?\n/).includes(x))],
  ['GHC buy-with-Pi, tips, referral settlement and Testnet economy unlock are enabled', ['GHC_TESTNET_UNLOCK=1','GHC_BUY_WITH_PI_ENABLED=true','GHC_TIPS_ENABLED=true','GHC_REFERRAL_SETTLEMENT_ENABLED=1','GHC_ACTIVITY_REWARDS_ENABLED=1','GHC_CURATION_REDISTRIBUTE_ENABLED=1'].every((x) => profile.split(/\r?\n/).includes(x))],
  ['GHC withdrawals and marketplace GHC seller payouts are enabled in the Testnet profile', ['GHC_WITHDRAWALS_ENABLED=true','GHC_MARKETPLACE_GHC_PAYOUTS_ENABLED=true'].every((x) => profile.split(/\r?\n/).includes(x))],
  ['NGN bank payout profile requires a test secret and keeps live approval disabled', /PAYSTACK_TRANSFERS_ENABLED=true/.test(profile) && /PAYSTACK_LIVE_TRANSFERS_APPROVED=false/.test(profile) && /^PAYSTACK_SECRET_KEY=$/m.test(profile)],
  ['Testnet Paystack transfers reject Production and any live secret', /PI_NETWORK === "testnet"/.test(paystack) && /VERCEL_ENV !== "production"/.test(paystack) && /key\.startsWith\("sk_test_"\)/.test(paystack)],
  ['Testnet GHC-to-Pi withdrawals cannot activate on Vercel Production or Mainnet', /PI_NETWORK === "testnet"/.test(ghcWithdraw) && /VERCEL_ENV !== "production"/.test(ghcWithdraw)],
  ['marketplace GHC seller settlement is fenced to non-Production Testnet', /PI_NETWORK !== "testnet"/.test(marketplace) && /VERCEL_ENV === "production"/.test(marketplace)],
  ['generic .env.example remains fail-closed and contains no privileged secrets', /PI_A2U_ENABLED=0/.test(safe) && /PI_EARNINGS_PAYOUT_REQUESTS_ENABLED=0/.test(safe) && /PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=0/.test(safe) && /^PI_WALLET_PRIVATE_SEED=$/m.test(safe) && /^PI_EARNINGS_EXECUTOR_KEY=$/m.test(safe)],
]
let failed=0
for (const [name,ok] of checks) { console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok) failed++ }
console.log(`\nRUN444 Testnet payment/withdrawal rails: ${checks.length-failed}/${checks.length} passed`)
assert.equal(failed,0)
