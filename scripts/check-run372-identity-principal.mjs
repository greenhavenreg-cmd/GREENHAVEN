#!/usr/bin/env node
/** RUN372 — single canonical GreenHaven principal; Pi UID is provider subject only. */
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(p, 'utf8')
const identity = read('lib/identity/identity-service.ts')
const auth = read('app/api/auth/pi/route.ts')
const sessions = read('lib/server/identity/session-store.ts')
const checks = [
  ['canonical ID resolver excludes Pi provider UID', /const candidates = \[\s*input\?\.canonicalUserId,\s*input\?\.explicitUserId,\s*input\?\.profileUserId,?\s*\]/s.test(identity)],
  ['unmapped Pi SDK identity remains a local placeholder', /A Pi SDK UID alone is not a GreenHaven account identifier/.test(identity)],
  ['server verification requires Pi UID and canonical account ID', /input\.verifiedByServer === true && hasTrustedCanonicalId/.test(identity) && /const hasTrustedCanonicalId = Boolean\(piUid\) && !isStudioPlaceholderId\(userId\)/.test(identity)],
  ['production identity requires server verification', /verificationState === "server_verified"/.test(identity)],
  ['account switch resets prior account state', /const base = accountChanged \? defaultIdentity\(\) : identity/.test(identity)],
  ['auth bridge creates session against canonical mapped ID', /createSession\(\{\s*ghUserId: record\.ghUserId/.test(auth)],
  ['auth bridge returns canonical ID separately from Pi provider subject', /ghUserId: record\.ghUserId,[\s\S]*?piAppUid: record\.piAppUid/.test(auth)],
  ['durable session stores canonical account ID', /gh_user_id: rec\.ghUserId/.test(sessions)],
  ['legacy aliases are explicitly non-authoritative for financial authorization', /must never authorize server-side ownership,[\s\S]*?financial operations/.test(identity)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN372 identity principal checks: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
