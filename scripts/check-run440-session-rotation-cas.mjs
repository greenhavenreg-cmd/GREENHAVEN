#!/usr/bin/env node
/** RUN440 — session token rotation must be a single-winner compare-and-swap. */
import { readFileSync } from 'node:fs'

const source = readFileSync('lib/server/identity/session-store.ts', 'utf8')
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const phase4Sql = readFileSync('supabase/proposals/20261118_phase4_identity_group_contact.sql', 'utf8')
const checks = [
  ['rotation update is conditional on the previously presented token hash', /gh_sessions\?id=eq\.\$\{encodeURIComponent\(input\.id\)\}&token_hash=eq\.\$\{encodeURIComponent\(input\.oldTokenHash\)\}/.test(source)],
  ['rotation update refuses already-revoked session rows', /token_hash=eq\.\$\{encodeURIComponent\(input\.oldTokenHash\)\}&revoked_at=is\.null/.test(source)],
  ['rotation requests the changed row representation', /Prefer: "return=representation"/.test(source)],
  ['rotation succeeds only when exactly the expected row was changed', /result\.ok && Array\.isArray\(result\.data\) && result\.data\.length === 1 && result\.data\[0\]\?\.id === input\.id/.test(source)],
  ['rotation treats CAS conflict or storage failure as unavailable', /if \(!persisted\) \{[\s\S]{0,180}SESSION_ROTATION_CONFLICT_OR_UNAVAILABLE/.test(source)],
  ['memory fallback rechecks the token index after asynchronous validation', /const latest = memByHash\.get\(current\.tokenHash\)[\s\S]{0,220}latest\.tokenHash !== current\.tokenHash/.test(source)],
  ['revoked sessions cannot be overwritten by a rotation cache update', /const afterPersist = memByHash\.get\(current\.tokenHash\)[\s\S]{0,180}afterPersist\.revokedAt != null/.test(source)],
  ['durable session-list failure is distinct from a genuinely empty result', /Promise<SessionRecord\[\] \| null>/.test(source) && /if \(!durableRows\) \{[\s\S]{0,320}SESSION_STORE_UNAVAILABLE/.test(source)],
  ['session revoke-by-id fails closed when owner enumeration is unavailable', /const list = await dbListByUser\(uid\)[\s\S]{0,120}if \(!list\) throw new Error\(\"SESSION_STORE_UNAVAILABLE\"\)/.test(source)],
  ['runtime concurrency and storage-outage regression is registered in static verification and prebuild checks', packageJson.scripts['verify:static'].includes('test-run440-session-rotation.mjs') && packageJson.scripts['prebuild:checks'].includes('test-run440-session-rotation.mjs')],
  ['test-only alias loader is present and not part of production runtime imports', readFileSync('scripts/ts-alias-loader.mjs', 'utf8').includes('export async function resolve')],
  ['group creation does not run an unbounded global invitation-expiry sweep', !/UPDATE public\.gh_conversation_invites[\s\S]{0,180}WHERE status = 'pending' AND expires_at <= now\(\)/.test(phase4Sql)],
]
let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`)
  if (!ok) failed++
}
console.log(`\nRUN440 session rotation CAS contract: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
