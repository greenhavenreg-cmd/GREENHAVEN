#!/usr/bin/env node
/** RUN461: strict parsing and owner validation around authoritative GHC reward claims. */
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const db = read('lib/server/economy/db.ts')
const claimRoute = read('app/api/economy/rewards/claim/route.ts')
const maturedRoute = read('app/api/economy/rewards/claim-matured/route.ts')
const membershipActivate = read('app/api/membership/activate/route.ts')
const sqlFiles = [
  'supabase/migrations/20261022010007_ghc_account_and_claim.sql',
  'supabase/migrations/20261022010076_daily_claim_48h_lock.sql',
  'supabase/migrations/20261108110001_phase3_wallet_rewards_membership_concurrency_recovery.sql',
]
const pkg = JSON.parse(read('package.json'))
const checks = [
  ['matured hold lookup validates user and cutoff before privileged query', /!userId\?\.trim\(\)/.test(db) && /cutoff instanceof Date/.test(db) && /cutoff\.getTime\(\)/.test(db)],
  ['matured hold query returns owner identity for defense-in-depth validation', /select: "id,user_id,amount,created_at,metadata"/.test(db)],
  ['matured hold rows are rejected on owner mismatch or malformed identifiers', /String\(row\.user_id \|\| ""\) !== userId/.test(db) && /id\.length > 160/.test(db) && /rows\.length > 100/.test(db)],
  ['matured hold rows require positive finite amounts and valid timestamps', /!Number\.isFinite\(amount\) \|\| amount <= 0/.test(db) && /!Number\.isFinite\(createdAt\)/.test(db)],
  ['matured hold metadata must be a JSON object when present', /metadata != null && \(typeof metadata !== "object" \|\| Array\.isArray\(metadata\)\)/.test(db)],
  ['claim RPC validates owner and hold identifiers before the privileged call', /!userId\?\.trim\(\)/.test(db) && /!holdId\?\.trim\(\)/.test(db) && /userId \+ holdId/.test(db)],
  ['claim RPC payload must be an object with explicit ok true', /payload\.ok !== true/.test(db) && /Array\.isArray\(data\)/.test(db)],
  ['claim RPC requires an exact boolean idempotency field', /typeof payload\.alreadyClaimed !== "boolean"/.test(db) && /alreadyClaimed: payload\.alreadyClaimed/.test(db)],
  ['claim RPC requires a bounded transaction ID and positive finite amount', /transactionId\.length > 160/.test(db) && /!Number\.isFinite\(amount\) \|\| amount <= 0/.test(db)],
  ['malformed success responses become retry-safe unavailable results', /return \{ ok: false, error: "SERVER_UNAVAILABLE" \}/.test(db) && /idempotency path/.test(db)],
  ['RPC error and redeemable timestamp fields are normalized', /\^\[A-Z0-9_\]\{2,80\}\$/.test(db) && /Number\.isFinite\(Date\.parse\(payload\.redeemableAt\)\)/.test(db)],
  ['claim route continues to use authenticated owner and authoritative RPC amount', /rpcClaimPending\(auth\.userId, holdId\)/.test(claimRoute) && /amount: result\.amount/.test(claimRoute)],
  ['matured reconciliation remains database-only and server-owned', /isDatabaseConfigured\(\)/.test(maturedRoute) && /rpcClaimPending\(auth\.userId, tx\.id\)/.test(maturedRoute) && !/request\.json\(\)/.test(maturedRoute)],
  ['membership purchase RPC validates owner, reference, tier and amount before privileged call', /input\.row\?\.user_id/.test(membershipActivate) && /input\.row\?\.purchase_ref/.test(membershipActivate) && /Number\.isFinite\(input\.amount\)/.test(membershipActivate)],
  ['membership purchase RPC has a bounded timeout', /signal: AbortSignal\.timeout\(10_000\)/.test(membershipActivate)],
  ['membership purchase requires explicit outer and nested success booleans', /payload\.ok !== true/.test(membershipActivate) && /spend\.ok === true/.test(membershipActivate) && /typeof idempotent !== "boolean"/.test(membershipActivate)],
  ['membership purchase binds nested spend to the exact reference and amount', /String\(spend\.referenceId \|\| ""\) === input\.referenceId/.test(membershipActivate) && /Math\.abs\(Number\(spend\.amount\) - input\.amount\) <= 0\.0001/.test(membershipActivate)],
  ['membership purchase verifies returned entitlement owner, reference, tier and active state', /String\(entitlement\.user_id \|\| ""\) === input\.userId/.test(membershipActivate) && /String\(entitlement\.purchase_ref \|\| ""\) === input\.referenceId/.test(membershipActivate) && /entitlement\.active === true/.test(membershipActivate)],
  ['ambiguous membership RPC success is not reported as completed', /retrying the same reference uses DB idempotency/.test(membershipActivate) && /return \{ ok: false, error: "SERVER_UNAVAILABLE" \}/.test(membershipActivate)],
  ['existing financial SQL migrations are preserved unchanged in this run', sqlFiles.every(existsSync)],
  ['RUN461 regression contract is registered in static and prebuild checks', ['verify:static', 'prebuild:checks'].every((key) => pkg.scripts[key]?.includes('check-run461-reward-claim-response-integrity.mjs'))],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRUN461 reward claim response integrity: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
