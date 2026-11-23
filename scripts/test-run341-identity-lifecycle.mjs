import assert from 'node:assert/strict'
import { IdentityService, resolveCanonicalUserId, LOCAL_STUDIO_USER_ID } from '../lib/identity/identity-service.ts'

IdentityService.clear()

// A provider subject is not a GreenHaven account id, even before server mapping.
const linked = IdentityService.setFromPi({ uid: 'pi-uid-alpha', username: 'alpha' })
assert.equal(linked.userId, LOCAL_STUDIO_USER_ID)
assert.equal(linked.piUserId, 'pi-uid-alpha')
assert.equal(linked.verificationState, 'pi_linked')
assert.equal(linked.authState, 'unknown')
assert.equal(linked.isLocalStudioId, true)
assert.equal(IdentityService.isProductionIdentity(), false)
assert.equal(resolveCanonicalUserId({ piUid: 'pi-uid-alpha' }), LOCAL_STUDIO_USER_ID)
assert.equal(resolveCanonicalUserId({ profileUserId: 'gh-user-alpha' }), 'gh-user-alpha')

// Neither profile hydration nor a falsely asserted serverVerified flag may
// promote an unmapped Pi UID into a GreenHaven account principal.
const hydrated = IdentityService.setFromProfile({ userId: 'profile-row-alpha', username: 'alpha' })
assert.equal(hydrated.userId, LOCAL_STUDIO_USER_ID)
const unboundVerified = IdentityService.setFromPi({
  uid: 'pi-uid-alpha', username: 'alpha', accessToken: 'alpha-secret-token',
  verifiedByServer: true, needsOnboarding: false,
})
assert.equal(unboundVerified.userId, LOCAL_STUDIO_USER_ID)
assert.equal(unboundVerified.verificationState, 'pi_linked')
assert.equal(unboundVerified.authState, 'unknown')
assert.equal(IdentityService.isProductionIdentity(), false)

// The durable server mapping establishes the single canonical app principal.
const alpha = IdentityService.setFromPi({
  uid: 'pi-uid-alpha', canonicalUserId: 'gh-user-alpha', username: 'alpha',
  displayName: 'Alpha Pioneer', accessToken: 'alpha-secret-token',
  verifiedByServer: true, needsOnboarding: false,
})
assert.equal(alpha.userId, 'gh-user-alpha')
assert.equal(alpha.piUserId, 'pi-uid-alpha')
assert.equal(alpha.accessToken, 'alpha-secret-token')
assert.equal(alpha.verificationState, 'server_verified')
assert.equal(alpha.authState, 'authenticated')
assert.equal(IdentityService.isProductionIdentity(), true)
assert.equal(IdentityService.matchesUserId('gh-user-alpha'), true)
assert.equal(IdentityService.matchesUserId('pi-uid-alpha'), true) // compatibility alias only

// A different Pi account without a newly-issued durable mapping must clear all
// prior account state and remain unbound; it must not inherit the previous ID.
const beta = IdentityService.setFromPi({ uid: 'pi-uid-beta', username: 'beta' })
assert.equal(beta.userId, LOCAL_STUDIO_USER_ID)
assert.equal(beta.piUserId, 'pi-uid-beta')
assert.equal(beta.accessToken, null)
assert.equal(beta.displayName, null)
assert.equal(beta.needsOnboarding, true)
assert.equal(beta.verificationState, 'pi_linked')
assert.equal(beta.authState, 'unknown')
assert.equal(IdentityService.isProductionIdentity(), false)
assert.equal(IdentityService.matchesUserId('pi-uid-alpha'), false)
assert.notEqual(IdentityService.getAuthHeaders().Authorization, 'Bearer alpha-secret-token')

const priorNodeEnv = process.env.NODE_ENV
process.env.NODE_ENV = 'production'
assert.deepEqual(IdentityService.getAuthHeaders(), {})
if (priorNodeEnv === undefined) delete process.env.NODE_ENV
else process.env.NODE_ENV = priorNodeEnv

const betaVerified = IdentityService.setFromPi({
  uid: 'pi-uid-beta', canonicalUserId: 'gh-user-beta', username: 'beta',
  accessToken: 'beta-secret-token', verifiedByServer: true, needsOnboarding: false,
})
assert.equal(betaVerified.userId, 'gh-user-beta')
assert.equal(betaVerified.piUserId, 'pi-uid-beta')
assert.equal(IdentityService.isProductionIdentity(), true)
assert.equal(resolveCanonicalUserId({ canonicalUserId: 'gh-user', profileUserId: 'profile-user' }), 'gh-user')

// Profile hydration cannot replace the established canonical account principal.
const afterHydration = IdentityService.setFromProfile({ userId: 'different-profile-id', username: 'beta' })
assert.equal(afterHydration.userId, 'gh-user-beta')

// Explicit local reset cannot retain the previously verified account or token.
const local = IdentityService.setFromPi({ uid: null, username: 'preview' })
assert.equal(local.userId, LOCAL_STUDIO_USER_ID)
assert.equal(local.piUserId, null)
assert.equal(local.accessToken, null)
assert.equal(local.verificationState, 'unverified')
assert.equal(IdentityService.isProductionIdentity(), false)

IdentityService.clear()
const noProviderSubject = IdentityService.setFromPi({ canonicalUserId: 'gh-user-unbound', verifiedByServer: true })
assert.equal(noProviderSubject.userId, LOCAL_STUDIO_USER_ID)
assert.equal(noProviderSubject.verificationState, 'unverified')

console.log('PASS — RUN342 canonical identity principal (44 assertions)')
IdentityService.clear()
