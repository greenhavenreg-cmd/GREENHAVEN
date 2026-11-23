#!/usr/bin/env node
/** RUN341 — identity mapping, account-switch isolation and durable activity maintenance. */
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(path, 'utf8')
const identity = read('lib/identity/identity-service.ts')
const auth = read('contexts/pi-auth-context.tsx')
const store = read('lib/server/identity/pi-identity-store.ts')
const runtime = read('lib/pi-runtime.ts')
const pkg = JSON.parse(read('package.json'))
const checks = [
  ['canonical GH ID is distinct from the external Pi UID', /canonicalUserId\?: string \| null/.test(identity) && /input\?\.canonicalUserId/.test(identity)],
  ['identity mapping retains the actual Pi UID as its alias', /uid: identity\.uid,[\s\S]{0,100}canonicalUserId: ghUserId/.test(auth)],
  ['App Studio bridge carries Pi UID and canonical GH ID separately', /piAppUid: String\(b\.identity\.piAppUid\)/.test(auth) && /canonicalUserId: bridged\?\.ghUserId/.test(auth)],
  ['account switch resets prior token and account-bound state', /const accountChanged =[\s\S]*?const base = accountChanged \? defaultIdentity\(\) : identity/.test(identity)],
  ['production identity requires server verification', /verificationState === "server_verified"/.test(identity)],
  ['App Studio bridge requires durable mapping and session plus cookie round-trip', /b\.durable === true && b\.sessionDurable === true/.test(auth) && /session\.identity\?\.serverVerified === true && session\.session\?\.ghUserId === ghUserId/.test(auth)],
  ['production App Studio auth fails closed without durable bridge', /if \(!bridged && !allowLocalAuthFallback\(\)\)/.test(auth)],
  ['Pi last-seen persistence uses bounded central Supabase REST client', /supabaseRest\([\s\S]*?gh_pi_identities\?gh_user_id=eq\.[\s\S]*?timeoutMs: 5_000/.test(store) && !/await fetch\(url/.test(store)],
  ['Pi Sandbox iframe detection trusts only the exact Developer Sandbox host, not the SDK CDN host', /isTrustedPiSandboxReferrerHost[\s\S]*?sandbox\.minepi\.com/.test(runtime) && !/referrerHost === "app-cdn\.minepi\.com"/.test(runtime)],
  ['identity regression check is registered in prebuild and static verification', pkg.scripts['prebuild:checks'].includes('check-run341-identity-audit.mjs') && pkg.scripts['verify:static'].includes('check-run341-identity-audit.mjs')],
  ['identity runtime regression is registered in prebuild and static verification', pkg.scripts['prebuild:checks'].includes('test-run341-identity-lifecycle.mjs') && pkg.scripts['verify:static'].includes('test-run341-identity-lifecycle.mjs')],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRUN341 identity audit contract: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
