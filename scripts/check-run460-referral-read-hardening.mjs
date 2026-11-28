#!/usr/bin/env node
/** RUN460: protect referral reads and permanent attribution from abuse/cache leakage. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const status = read('app/api/referral/status/route.ts')
const code = read('app/api/referral/code/route.ts')
const attribute = read('app/api/referral/attribute/route.ts')
const service = read('lib/server/referral/referral-service.ts')
const pkg = JSON.parse(read('package.json'))

const checks = [
  ['referral status reads use a per-user durable fail-closed rate limit', status.includes('referral-status:${auth.userId}') && status.includes('onUnavailable: "deny"')],
  ['referral code creation/read uses a separate per-user durable fail-closed rate limit', code.includes('referral-code:${auth.userId}') && code.includes('onUnavailable: "deny"')],
  ['referral status and code responses are explicitly non-cacheable', status.includes('private, no-store, no-cache') && code.includes('private, no-store, no-cache')],
  ['rate-limited referral reads return retry guidance', status.includes('"Retry-After"') && code.includes('"Retry-After"')],
  ['permanent referral attribution fails closed if durable rate limiting is unavailable', attribute.includes('failClosed: true') && attribute.includes('"referral/attribute:POST", 30, 60_000')],
  ['referral code RPC output is validated against the canonical issued format', service.includes('/^GH[A-Z0-9]{8}$/') && service.includes('INVALID_REFERRAL_CODE_RESPONSE')],
  ['referral aggregate counts and amounts reject non-finite or negative values', service.includes('Number.isFinite(parsed)') && service.includes('nonNegativeCount(summary.invitedCount)') && service.includes('nonNegativeFinite(summary.pendingRewardGhc)')],
  ['RUN460 contract is registered in static and prebuild verification', ['verify:static', 'prebuild:checks'].every((key) => pkg.scripts[key]?.includes('check-run460-referral-read-hardening.mjs'))],
]

let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`)
  if (!ok) failed++
}
console.log(`\nRUN460 referral read hardening: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
