import assert from 'node:assert/strict'
import { operatorKeyAuthorized, operatorKeyValueAuthorized } from '../lib/server/security/operator-key.ts'

const operatorKey = 'operator-reconcile-key-'.padEnd(48, 'O')
const a2uKey = 'a2u-worker-key-'.padEnd(48, 'A')
process.env.GHC_OPERATOR_RECONCILE_KEY = operatorKey
process.env.GHC_A2U_ADMIN_KEY = a2uKey

assert.equal(operatorKeyValueAuthorized(operatorKey, 'GHC_OPERATOR_RECONCILE_KEY'), true)
assert.equal(operatorKeyValueAuthorized(a2uKey, 'GHC_OPERATOR_RECONCILE_KEY'), false)
assert.equal(operatorKeyValueAuthorized('short', 'GHC_OPERATOR_RECONCILE_KEY'), false)
assert.equal(operatorKeyValueAuthorized(operatorKey, 'GHC_MISSING_PURPOSE_KEY'), false)

const request = new Request('https://internal.invalid', { headers: { 'x-ghc-operator-key': operatorKey } })
assert.equal(operatorKeyAuthorized(request, { headers: ['x-ghc-operator-key'], envNames: ['GHC_OPERATOR_RECONCILE_KEY'] }), true)
assert.equal(operatorKeyAuthorized(request, { headers: ['x-ghc-operator-key'], envNames: ['GHC_OPERATOR_RECONCILE_KEY', 'GHC_A2U_ADMIN_KEY'] }), false)
console.log('RUN434 operator key isolation: 6 runtime assertions passed')
