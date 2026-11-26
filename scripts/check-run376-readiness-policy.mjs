#!/usr/bin/env node
/** RUN376 source regression gate: Preview uses the same effective auth policy as runtime. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const readiness = read('lib/server/readiness.ts')
const paymentHealth = read('app/api/payments/health/route.ts')
const envSource = read('lib/server/economy/env.ts')

assert.match(readiness, /const allowDevAuth = ghcEnv\.allowDevAuth/)
assert.doesNotMatch(readiness, /const allowDevAuth =\s*process\.env\.GHC_ALLOW_DEV_AUTH/)
assert.match(readiness, /devAuthFlagConfigured/)
assert.match(envSource, /allowDevAuth:\s*!isProduction\s*&&/)
console.log('PASS readiness uses effective server-side dev-auth policy')

assert.match(paymentHealth, /const paymentConfigurationReady = paymentBlockers\.length === 0/)
assert.match(paymentHealth, /const platformReady = foundation\.ready/)
assert.match(paymentHealth, /const overallReady = paymentConfigurationReady && platformReady/)
assert.match(paymentHealth, /diagnosticsDetailAllowed\(request\)/)
assert.match(paymentHealth, /paymentConfigurationReady,/)
assert.match(paymentHealth, /platformReady,/)
console.log('PASS payment config and platform readiness are reported separately')
console.log('PASS operator-only diagnostics gate remains in place')

// Exercise the actual server environment policy under Vercel Preview's
// production Node runtime. The raw opt-in must not enable development auth.
const envModule = await import('../lib/server/economy/env.ts')
const keys = ['NODE_ENV', 'VERCEL_ENV', 'GHC_ENV', 'GHC_ALLOW_DEV_AUTH']
const before = Object.fromEntries(keys.map((key) => [key, process.env[key]]))
try {
  process.env.NODE_ENV = 'production'
  process.env.VERCEL_ENV = 'preview'
  delete process.env.GHC_ENV
  process.env.GHC_ALLOW_DEV_AUTH = '1'
  const preview = envModule.readGhcServerEnv()
  assert.equal(preview.isProduction, true)
  assert.equal(preview.allowDevAuth, false)
  console.log('PASS Vercel Preview + NODE_ENV=production hard-denies dev auth despite raw opt-in')

  process.env.NODE_ENV = 'development'
  process.env.VERCEL_ENV = 'preview'
  const localPreview = envModule.readGhcServerEnv()
  assert.equal(localPreview.isProduction, false)
  assert.equal(localPreview.allowDevAuth, true)
  console.log('PASS non-production runtime retains explicit dev-auth opt-in behavior')
} finally {
  for (const key of keys) {
    if (before[key] === undefined) delete process.env[key]
    else process.env[key] = before[key]
  }
}

console.log('\nRUN376 readiness policy: 14 assertions passed')
