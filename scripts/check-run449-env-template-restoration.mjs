#!/usr/bin/env node
/** RUN449 guards the credential-free root environment template required by CI and Vercel prebuild. */
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

assert.equal(existsSync('.env.example'), true, 'root .env.example must be present in the release source tree')
const env = readFileSync('.env.example', 'utf8')
const profile = readFileSync('config/testnet-payments.env.example', 'utf8')
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const checks = [
  ['canonical root template is restored and non-empty', env.trim().length > 0],
  ['all privileged credential placeholders remain blank', ['SUPABASE_SERVICE_ROLE_KEY=', 'PI_SERVER_API_KEY=', 'PI_WALLET_PRIVATE_SEED=', 'PI_EARNINGS_EXECUTOR_KEY=', 'CRON_SECRET='].every((key) => new RegExp(`^${key.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')}\\s*$`, 'm').test(env))],
  ['generic Pi payout and A2U defaults remain disabled', /PI_A2U_ENABLED=0/.test(env) && /PI_EARNINGS_PAYOUT_REQUESTS_ENABLED=0/.test(env) && /PI_EARNINGS_PAYOUT_EXECUTION_ENABLED=0/.test(env)],
  ['generic template remains Testnet sandbox and does not copy activation flags', /PI_NETWORK=testnet/.test(env) && /NEXT_PUBLIC_PI_SANDBOX=true/.test(env) && !/^PI_A2U_ENABLED=true$/m.test(env)],
  ['dedicated Testnet activation profile remains separate and Preview-only', /PI_A2U_ENABLED=true/.test(profile) && /PI_A2U_TESTNET_ONLY=true/.test(profile) && /Never copy this profile into Vercel Production/.test(profile)],
  ['restoration check is wired into static and prebuild contracts', ['verify:static', 'prebuild:checks'].every((key) => pkg.scripts[key].includes('check-run449-env-template-restoration.mjs'))],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN449 environment template restoration: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
