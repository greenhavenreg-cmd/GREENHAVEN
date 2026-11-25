#!/usr/bin/env node
import assert from 'node:assert/strict'
import {
  activityRewardsEnabled,
  buyGhcWithPiEnabled,
  curationRedistributeEnabled,
  isExplicitTestnetUnlock,
  isPiSandboxEnv,
  isTestnetProductUnlocked,
  referralSettlementEnabled,
} from '../lib/server/economy/testnet-unlock.ts'

const keys = [
  'PI_NETWORK', 'VERCEL_ENV', 'NEXT_PUBLIC_PI_SANDBOX', 'PI_ENV',
  'GHC_TESTNET_UNLOCK', 'NEXT_PUBLIC_GHC_TESTNET_UNLOCK',
  'GHC_ACTIVITY_REWARDS_ENABLED', 'GHC_CURATION_REDISTRIBUTE_ENABLED', 'NEXT_PUBLIC_GHC_CURATION_REDISTRIBUTE_ENABLED',
  'GHC_REFERRAL_SETTLEMENT_ENABLED', 'NEXT_PUBLIC_GHC_REFERRAL_SETTLEMENT_ENABLED', 'GHC_BUY_WITH_PI_ENABLED',
]
const before = Object.fromEntries(keys.map((key) => [key, process.env[key]]))
const set = (values) => {
  for (const key of keys) {
    if (Object.hasOwn(values, key)) process.env[key] = values[key]
    else delete process.env[key]
  }
}
const cases = [
  ['Testnet Preview with explicit SDK sandbox unlocks product exercise', { PI_NETWORK: 'testnet', VERCEL_ENV: 'preview', NEXT_PUBLIC_PI_SANDBOX: 'true' }, true],
  ['Testnet Preview with explicit operator unlock works', { PI_NETWORK: 'testnet', VERCEL_ENV: 'preview', GHC_TESTNET_UNLOCK: '1' }, true],
  ['Mainnet Preview cannot inherit sandbox or explicit unlock', { PI_NETWORK: 'mainnet', VERCEL_ENV: 'preview', NEXT_PUBLIC_PI_SANDBOX: 'true', GHC_TESTNET_UNLOCK: '1' }, false],
  ['Unknown network cannot inherit Preview sandbox', { PI_NETWORK: '', VERCEL_ENV: 'preview', NEXT_PUBLIC_PI_SANDBOX: 'true' }, false],
  ['Production cannot inherit Testnet sandbox or explicit unlock', { PI_NETWORK: 'testnet', VERCEL_ENV: 'production', NEXT_PUBLIC_PI_SANDBOX: 'true', GHC_TESTNET_UNLOCK: '1' }, false],
  ['Local development can exercise explicit Testnet sandbox', { PI_NETWORK: 'testnet', VERCEL_ENV: 'development', NEXT_PUBLIC_PI_SANDBOX: 'true' }, true],
]

try {
  for (const [name, env, expected] of cases) {
    set(env)
    assert.equal(isTestnetProductUnlocked(), expected, name)
    const expectedSandbox = expected && (env.NEXT_PUBLIC_PI_SANDBOX === 'true' || env.PI_ENV === 'sandbox' || env.VERCEL_ENV === 'preview')
    assert.equal(isPiSandboxEnv(), expectedSandbox, `${name}: sandbox status`)
    if (env.GHC_TESTNET_UNLOCK === '1') {
      assert.equal(isExplicitTestnetUnlock(), expected, `${name}: operator unlock status`)
    }
    console.log(`PASS ${name}`)
  }
  set({ PI_NETWORK: 'testnet', VERCEL_ENV: 'preview', NEXT_PUBLIC_PI_SANDBOX: 'true' })
  assert.equal(isTestnetProductUnlocked(), true)
  assert.equal(activityRewardsEnabled(), true)
  assert.equal(curationRedistributeEnabled(), true)
  assert.equal(referralSettlementEnabled(), true)
  assert.equal(buyGhcWithPiEnabled(), true)
  console.log('PASS Testnet sandbox fallback works when no individual feature override is configured')

  set({ PI_NETWORK: 'testnet', VERCEL_ENV: 'preview', NEXT_PUBLIC_PI_SANDBOX: 'true', GHC_ACTIVITY_REWARDS_ENABLED: 'false', GHC_CURATION_REDISTRIBUTE_ENABLED: 'false', GHC_REFERRAL_SETTLEMENT_ENABLED: 'false', GHC_BUY_WITH_PI_ENABLED: 'false' })
  assert.equal(isTestnetProductUnlocked(), true)
  assert.equal(activityRewardsEnabled(), false)
  assert.equal(curationRedistributeEnabled(), false)
  assert.equal(referralSettlementEnabled(), false)
  assert.equal(buyGhcWithPiEnabled(), false)
  console.log('PASS explicit financial feature-off flags override the general Testnet sandbox unlock')

  set({ PI_NETWORK: 'testnet', VERCEL_ENV: 'preview', NEXT_PUBLIC_PI_SANDBOX: 'true', GHC_CURATION_REDISTRIBUTE_ENABLED: 'false', NEXT_PUBLIC_GHC_CURATION_REDISTRIBUTE_ENABLED: 'true' })
  assert.equal(curationRedistributeEnabled(), false)
  console.log('PASS server-side feature-off flag takes precedence over public UI flag')
} finally {
  for (const key of keys) {
    if (before[key] === undefined) delete process.env[key]
    else process.env[key] = before[key]
  }
}
console.log(`\nRUN384 Testnet unlock network fence: ${cases.length + 3} runtime cases passed`)
