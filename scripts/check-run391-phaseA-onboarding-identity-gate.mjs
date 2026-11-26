import fs from 'node:fs'
import assert from 'node:assert/strict'
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const local = read('lib/onboarding-local.ts')
const piAuth = read('contexts/pi-auth-context.tsx')
const ghContext = read('contexts/ghc-context.tsx')
const route = read('app/api/auth/pi/route.ts')
const lifecycle = read('lib/auth/auth-lifecycle.ts')

// Server verification must precede every client-side onboarding classification.
assert.match(local, /if \(!input\.serverVerified\) return "unknown"/)
assert.match(local, /if \(input\.isReturning \|\| input\.identityExisted === true \|\| input\.needsOnboarding === false\)\s*\{\s*return "complete"/)
assert.match(local, /if \(input\.needsOnboarding === true\) return "required"/)
assert.doesNotMatch(local.slice(local.indexOf('export function resolveUiOnboardingGate')), /hasLocalOnboardingStampForUser|findCompletedLocalProfileForUser|isStrongCompletedProfileShape/)

// A canonical GH id is returned for both new and returning users; its presence
// must not be mistaken for evidence that the identity existed before this login.
assert.match(piAuth, /identityExisted =\s*bridge\.identityExisted === true \|\|\s*bridge\.isReturning === true \|\|\s*completed/)
assert.doesNotMatch(piAuth.slice(piAuth.indexOf('identityExisted ='), piAuth.indexOf('identityExisted =') + 260), /Boolean\(bridgeIdentity\.ghUserId\)/)

// Explicit server-required state must not be overridden by cached local profile data.
const handler = ghContext.slice(ghContext.indexOf('// The verified server identity bridge'), ghContext.indexOf('return { ...prev, profile }'))
assert.match(handler, /d\.onboardingStatus === "required" \|\| d\.needsOnboarding === true/)
assert.doesNotMatch(handler, /hasLocalOnboardingStampForUser|findCompletedLocalProfileForUser|alreadyLocal/)

// API classification is based on whether the verified mapping was newly inserted.
assert.match(route, /const isReturning = !isNew/)
assert.match(route, /const needsOnboarding = isNew && record\.onboardingCompleted !== true/)
assert.match(lifecycle, /if \(input\.isReturning === true \|\| input\.needsOnboarding === false\) return "complete"/)
assert.match(lifecycle, /if \(input\.needsOnboarding === true\) return "required"/)
console.log('RUN391 Phase A identity/onboarding gate: PASS (12 assertions)')
