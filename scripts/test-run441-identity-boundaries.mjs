#!/usr/bin/env node
/** RUN441 runtime regression: account switch, revocation, step-up scope and profile hydration races. */
import assert from 'node:assert/strict'
import { IdentityService, LOCAL_STUDIO_USER_ID } from '../lib/identity/identity-service.ts'
import {
  _resetSessionStoreForTests, createSession, listSessionsForUser,
  revokeSessionByIdForUser, revokeSessionByToken, toPublicSessionInfo, validateSession,
} from '../lib/server/identity/session-store.ts'
import {
  _resetStepUpStoreForTests, createStepUp, findValidStepUp,
  requireRecentStepUp, revokeStepUpsForSession,
} from '../lib/server/identity/step-up-store.ts'

process.env.NODE_ENV = 'test'
delete process.env.SUPABASE_URL
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY
delete process.env.DATABASE_URL
delete process.env.SUPABASE_DB_URL
_resetSessionStoreForTests()
_resetStepUpStoreForTests()

// Two devices may coexist for one account; revoking one cannot kill the other.
const deviceA = await createSession({ ghUserId: 'gh-run441-alice', userAgent: 'Android Pi Browser' })
const deviceB = await createSession({ ghUserId: 'gh-run441-alice', userAgent: 'Windows Chrome' })
assert.notEqual(deviceA.record.id, deviceB.record.id)
assert.equal((await listSessionsForUser('gh-run441-alice')).length, 2)
const publicA = toPublicSessionInfo(deviceA.record, deviceA.record.id)
assert.equal('tokenHash' in publicA, false)
assert.equal('rawToken' in publicA, false)
assert.equal(await revokeSessionByIdForUser('gh-run441-bob', deviceA.record.id), 'forbidden')
assert.equal((await validateSession(deviceA.rawToken, { touch: false }))?.id, deviceA.record.id)
assert.equal(await revokeSessionByToken(deviceA.rawToken), true)
assert.equal(await validateSession(deviceA.rawToken, { touch: false }), null)
assert.equal((await validateSession(deviceB.rawToken, { touch: false }))?.id, deviceB.record.id)
const deviceC = await createSession({ ghUserId: 'gh-run441-alice', userAgent: 'iPhone Safari' })
const deviceCProof = await createStepUp({ ghUserId: 'gh-run441-alice', sessionId: deviceC.record.id })
assert.equal(await revokeSessionByIdForUser('gh-run441-alice', deviceC.record.id), 'ok')
assert.equal(await validateSession(deviceC.rawToken, { touch: false }), null)
assert.equal(await revokeStepUpsForSession(deviceC.record.id), true)
assert.equal(await findValidStepUp('gh-run441-alice', deviceC.record.id), null)

// Step-up is scoped to both canonical account and session; it is not a bearer proof.
const step = await createStepUp({ ghUserId: 'gh-run441-alice', sessionId: deviceB.record.id })
assert.equal((await findValidStepUp('gh-run441-alice', deviceB.record.id))?.id, step.id)
assert.equal(await findValidStepUp('gh-run441-bob', deviceB.record.id), null)
assert.equal(await findValidStepUp('gh-run441-alice', deviceA.record.id), null)
const authB = { userId: 'gh-run441-alice', sessionId: deviceB.record.id, source: 'gh_session' }
assert.equal(await requireRecentStepUp(authB), null)
// Freshness proof can support multiple operations only within its exact account+session scope.
assert.equal(await requireRecentStepUp(authB), null)
assert.equal((await requireRecentStepUp({ ...authB, userId: 'gh-run441-bob' }))?.code, 'STEP_UP_REQUIRED')
assert.equal((await requireRecentStepUp({ ...authB, sessionId: deviceA.record.id }))?.code, 'STEP_UP_REQUIRED')
assert.equal(await revokeStepUpsForSession(deviceB.record.id), true)
assert.equal(await findValidStepUp('gh-run441-alice', deviceB.record.id), null)
assert.equal((await requireRecentStepUp(authB))?.code, 'STEP_UP_REQUIRED')

// Same provider UID rebound to a different canonical GH principal clears prior credentials/profile state.
IdentityService.clear()
IdentityService.setFromPi({ uid: 'pi-run441', canonicalUserId: 'gh-run441-a', username: 'alice', displayName: 'Alice', accessToken: 'secret-a', verifiedByServer: true })
const rebound = IdentityService.setFromPi({ uid: 'pi-run441', canonicalUserId: 'gh-run441-b', verifiedByServer: true })
assert.equal(rebound.userId, 'gh-run441-b')
assert.equal(rebound.accessToken, null)
assert.equal(rebound.username, null)
assert.equal(rebound.displayName, null)
assert.notEqual(IdentityService.getAuthHeaders().Authorization, 'Bearer secret-a')
assert.notEqual(rebound.userId, LOCAL_STUDIO_USER_ID)
// A delayed profile response from the previous account must not relabel the new principal.
const staleProfile = IdentityService.setFromProfile({ userId: 'gh-run441-a', username: 'old-alice', displayName: 'Old Alice' })
assert.equal(staleProfile.userId, 'gh-run441-b')
assert.equal(staleProfile.username, null)
assert.equal(staleProfile.displayName, null)
const missingProfileOwner = IdentityService.setFromProfile({ username: 'unbound-name', displayName: 'Unbound Name' })
assert.equal(missingProfileOwner.username, null)
const currentProfile = IdentityService.setFromProfile({ userId: 'gh-run441-b', username: 'beta', displayName: 'Beta Pioneer' })
assert.equal(currentProfile.username, 'beta')
assert.equal(currentProfile.displayName, 'Beta Pioneer')

// Deliberately overlap profile hydration requests and resolve them out of order.
process.env.SUPABASE_URL = 'https://run441.invalid'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'run441-test-only'
const originalFetch = globalThis.fetch
const requested = []
globalThis.fetch = async (url) => {
  const value = String(url)
  requested.push(value)
  const isAlice = value.includes('alice-gh')
  await new Promise((resolve) => setTimeout(resolve, isAlice ? 20 : 1))
  const rows = isAlice
    ? [{ gh_user_id: 'alice-gh', display_name: 'Alice Public', username: 'alice', photos: [], email: 'private@example.invalid' }]
    : [{ gh_user_id: 'bob-gh', display_name: 'Bob Public', username: 'bob', photos: [] }]
  return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
const { hydratePublicProfileIdentity } = await import('../lib/server/identity/public-profile-hydration.ts')
const aliceInput = [{ authorId: 'alice-gh', authorName: 'Persisted Alice', comments: [{ authorId: 'alice-gh', authorName: 'Old Alice' }] }]
const bobInput = [{ authorId: 'bob-gh', authorName: 'Persisted Bob' }]
const [aliceResult, bobResult] = await Promise.all([
  hydratePublicProfileIdentity(aliceInput),
  hydratePublicProfileIdentity(bobInput),
])
assert.equal(aliceResult[0].authorName, 'Alice Public')
assert.equal(aliceResult[0].comments[0].authorName, 'Alice Public')
assert.equal(bobResult[0].authorName, 'Bob Public')
assert.equal(aliceInput[0].authorName, 'Persisted Alice', 'hydration must not mutate cached/source rows')
assert.equal(bobInput[0].authorName, 'Persisted Bob', 'overlapping requests must not mutate another account row')
assert.equal(requested.length, 2)
assert.ok(requested.every((url) => url.includes('select=gh_user_id%2Cdisplay_name%2Cusername%2Cphotos')))
assert.equal(aliceResult[0].email, undefined, 'private profile attributes are never hydrated')
assert.equal(aliceResult[0].comments[0].email, undefined, 'private attributes are not copied into nested comments')
if (originalFetch) globalThis.fetch = originalFetch
else delete globalThis.fetch
_resetSessionStoreForTests()
_resetStepUpStoreForTests()
IdentityService.clear()
console.log('PASS — RUN441 identity boundaries (34 assertions)')
