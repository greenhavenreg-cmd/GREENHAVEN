#!/usr/bin/env node
/** RUN440 runtime regression: concurrent session rotation and durable-read fail-closed behavior. */
import assert from 'node:assert/strict'
import {
  _resetSessionStoreForTests,
  createSession,
  listSessionsForUser,
  revokeSessionByIdForUser,
  rotateSession,
  validateSession,
} from '../lib/server/identity/session-store.ts'

process.env.NODE_ENV = 'test'
delete process.env.SUPABASE_URL
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY
_resetSessionStoreForTests()

const issued = await createSession({ ghUserId: 'gh-run440-race', userAgent: 'GreenHaven Test Browser' })
const rotations = await Promise.all([
  rotateSession({ rawToken: issued.rawToken, userAgent: 'GreenHaven Test Browser' }),
  rotateSession({ rawToken: issued.rawToken, userAgent: 'GreenHaven Test Browser' }),
])
assert.equal(rotations.filter(Boolean).length, 1, 'exactly one concurrent rotation must win')
assert.equal(await validateSession(issued.rawToken, { touch: false }), null, 'old token must be invalidated')
const winner = rotations.find(Boolean)
assert.ok(winner, 'winning rotation must return its replacement token')
assert.equal((await validateSession(winner.rawToken, { touch: false }))?.id, issued.record.id, 'winning replacement token must validate')
assert.equal((await validateSession(winner.rawToken, { touch: false }))?.ghUserId, issued.record.ghUserId, 'rotation must preserve the canonical account principal')

// A configured durable store that cannot be read is not an empty session list.
const originalFetch = globalThis.fetch
process.env.SUPABASE_URL = 'https://supabase.invalid'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'run440-test-only'
globalThis.fetch = async () => new Response(JSON.stringify({ message: 'unavailable' }), { status: 503 })
await assert.rejects(listSessionsForUser('gh-run440-outage'), { message: 'SESSION_STORE_UNAVAILABLE' })
await assert.rejects(revokeSessionByIdForUser('gh-run440-outage', 'missing-session'), { message: 'SESSION_STORE_UNAVAILABLE' })
if (originalFetch) globalThis.fetch = originalFetch
else delete globalThis.fetch
_resetSessionStoreForTests()
console.log('PASS — RUN440 session rotation and durable-read failure runtime (7 assertions)')
