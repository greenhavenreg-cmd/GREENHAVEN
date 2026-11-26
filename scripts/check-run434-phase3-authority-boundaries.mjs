#!/usr/bin/env node
/** RUN434 Phase 3: authoritative identity, purpose-key isolation and single writer transport. */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const spend = read('lib/server/economy/execute-spend-rpc.ts')
const walletSpend = read('app/api/economy/ledger/spend/route.ts')
const marketplacePay = read('app/api/marketplace/orders/[orderId]/pay/route.ts')
const operatorKey = read('lib/server/security/operator-key.ts')
const operationalRpc = read('lib/server/marketplace/operational-rpc.ts')
const actor = read('lib/server/security/operator-audit-actor.ts')
const disputes = read('app/api/operator/operational/disputes/route.ts')
const corrections = read('app/api/operator/operational/payout-corrections/route.ts')
const refunds = read('app/api/operator/operational/refunds/route.ts')
const auth = read('lib/server/economy/auth.ts')
const identity = read('lib/server/identity/pi-identity-store.ts')
const session = read('lib/server/identity/session-store.ts')
const integrity = read('lib/server/identity/auth-integrity.ts')
const outbox = read('docs/proposals/PHASE-I-TRANSACTIONAL-OUTBOX-DESIGN.sql')
const migrations = readdirSync(new URL('../supabase/migrations/', import.meta.url)).map((name) => read(`supabase/migrations/${name}`)).join('\n')
const checks = [
  ['single shared GHC spend transport owns the RPC endpoint', spend.includes('/rest/v1/rpc/ghc_execute_spend') && walletSpend.includes('executeGhcSpendRpc') && marketplacePay.includes('executeGhcSpendRpc')],
  ['shared spend transport uses the canonical response contract', spend.includes('parseGhcSpendRpcResult(data, input)')],
  ['shared spend transport has a bounded timeout and no-store request', spend.includes('AbortSignal.timeout(10_000)') && spend.includes('cache: "no-store"')],
  ['shared spend transport binds server-supplied user and stable reference', spend.includes('p_user_id: userId') && spend.includes('p_reference_id: referenceId') && spend.includes('INVALID_SPEND_BINDING')],
  ['Wallet spend passes the authenticated canonical account ID', /executeGhcSpendRpc\(\{\s*userId:\s*auth\.userId/.test(walletSpend)],
  ['Marketplace GHC payment uses the authenticated buyer and durable order total', /executeGhcSpendRpc\(\{\s*userId:\s*auth\.userId/.test(marketplacePay) && /const amount = Number\(order\.totalAmount\)/.test(marketplacePay)],
  ['duplicate route-local GHC spend RPC wrappers are removed', !walletSpend.includes('/rest/v1/rpc/ghc_execute_spend') && !marketplacePay.includes('/rest/v1/rpc/ghc_execute_spend')],
  ['operator key helper compares against one configured purpose key', operatorKey.includes('operatorKeyValueAuthorized') && /options\.envNames\.length !== 1/.test(operatorKey)],
  ['operational financial routes use only the dedicated reconciliation key', /operatorKeyValueAuthorized\(headerValue, "GHC_OPERATOR_RECONCILE_KEY"\)/.test(operationalRpc) && !/GHC_A2U_ADMIN_KEY/.test(operationalRpc)],
  ['shared operator key cannot be mistaken for a human actor', actor.includes('service:operator-key') && actor.includes('not an individual')],
  ['dispute audit actor is server-owned, not caller-supplied', disputes.includes('actorId: OPERATOR_KEY_AUDIT_ACTOR') && !/body\.(actorId|decidedBy)/.test(disputes)],
  ['payout correction approver is server-owned, not caller-supplied', corrections.includes('approvedBy: OPERATOR_KEY_AUDIT_ACTOR') && !/body\.approvedBy/.test(corrections)],
  ['refund audit actor is server-owned, not caller-supplied', refunds.includes('actorId: OPERATOR_KEY_AUDIT_ACTOR') && !/body\.actorId/.test(refunds)],
  ['Pi UID is mapped to canonical GH identity through the durable identity store', auth.includes('verifyPiAccessToken(token)') && auth.includes('getByPiAppUid(piUser.uid)') && identity.includes('dbInsertNew')],
  ['production session validation re-reads durable storage and rejects memory-only sessions', session.includes('always re-read so revocation') && session.includes('SESSION_DURABILITY_UNAVAILABLE')],
  ['session-grade security requires durable session store and gh_session', integrity.includes('requireDurableSessionStore()') && integrity.includes('return requireGhSession(headers)')],
  ['generic transactional outbox remains proposal-only and not a duplicate migration', outbox.includes('PROPOSAL ONLY') && !migrations.includes('gh_domain_outbox')],
]
let failed = 0
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`)
  if (!pass) failed++
}
console.log(`RUN434 Phase 3 authority boundary: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exitCode = 1
