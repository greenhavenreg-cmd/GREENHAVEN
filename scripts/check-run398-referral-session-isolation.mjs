#!/usr/bin/env node
/** Run 398 regression gate: referral request/session isolation and public response minimization. */
import fs from 'node:fs'
const read = (p) => fs.readFileSync(p, 'utf8')
const card = read('components/ghc/referral-share-card.tsx')
const client = read('lib/referral/client.ts')
const route = read('app/api/referral/status/route.ts')
const service = read('lib/server/referral/referral-service.ts')
const checks = [
  ['referral status fetch accepts an abort signal', /fetchReferralStatus\(signal\?: AbortSignal\)/.test(client) && /signal,/.test(client)],
  ['newer referral loads abort and supersede older requests', /requestSequenceRef/.test(card) && /requestControllerRef\.current\?\.abort\(\)/.test(card) && /isCurrent\(\)/.test(card)],
  ['fallback code request is aborted with the active session request', /signal: controller\.signal/.test(card)],
  ['account-auth changes trigger referral reload and cleanup', /addEventListener\("ghc:wallet-auth-changed", refresh\)/.test(card) && /removeEventListener\("ghc:wallet-auth-changed", refresh\)/.test(card)],
  ['custom referral refresh event has a matching listener', /addEventListener\("ghc:referral-refresh", refresh\)/.test(card)],
  ['unmounted referral card invalidates and aborts outstanding requests', /requestSequenceRef\.current \+= 1/.test(card) && /requestControllerRef\.current\?\.abort\(\)/.test(card)],
  ['public referral status does not expose internal referrer user IDs', !/referrerUserId/.test(route) && !/referrerUserId/.test(client)],
  ['server referral status summary does not serialize internal referrer IDs', !/referrerUserId: summary\.referrerUserId/.test(service)],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRun 398 referral session isolation: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
