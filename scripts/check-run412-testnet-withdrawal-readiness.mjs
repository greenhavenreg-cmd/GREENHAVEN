#!/usr/bin/env node
/** Run 412 — Testnet Pi withdrawal PIN-proof configuration contract. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(p, 'utf8')
const proof = read('lib/server/identity/withdrawal-pin-proof.ts')
const pinRoute = read('app/api/identity/withdrawal-pin/route.ts')
const requestRoute = read('app/api/economy/earnings/withdrawals/route.ts')
const sheet = read('components/ghc/pi-withdraw-sheet.tsx')
const env = read('.env.example')
const pkg = JSON.parse(read('package.json'))
const release = read('lib/app-release.ts')
const checks = [
  ['Canonical server-only PIN-proof key is supported', /process\.env\.GH_PIN_PROOF_SECRET/.test(proof)],
  ['Legacy server-only key is accepted as fallback', /process\.env\.GHC_PIN_PROOF_SECRET/.test(proof)],
  ['PIN proof still requires at least 32 characters', /secret\(\)\.length >= 32/.test(proof)],
  ['Missing-key response names the required environment variable', /requiredEnv: "GH_PIN_PROOF_SECRET"/.test(pinRoute) && /PIN_PROOF_SECRET_MISSING/.test(requestRoute)],
  ['Missing-key response confirms no balance reservation occurred', /balance has not been reserved/.test(requestRoute)],
  ['Wallet error gives actionable Testnet environment guidance', /Set GH_PIN_PROOF_SECRET/.test(sheet) && /funds are unchanged/.test(sheet)],
  ['Environment template keeps payout gates fail-closed by default', /PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=0/.test(env) && /PI_A2U_ENABLED=0/.test(env)],
  ['Package and source contract use coordinated release version', /^0\.338\.\d+$/.test(pkg.version) && release.includes(`APP_RELEASE_VERSION = \"${pkg.version}\"`)],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
assert.equal(failed, 0, `${failed} Run 412 checks failed`)
console.log(`Run 412 Testnet Pi withdrawal readiness: ${checks.length}/${checks.length} passed`)
