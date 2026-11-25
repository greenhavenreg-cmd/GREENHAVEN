import fs from "node:fs"
import assert from "node:assert/strict"

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const onboarding = read("components/ghc/onboarding.tsx")
const context = read("contexts/ghc-context.tsx")
const completionRoute = read("app/api/auth/onboarding-complete/route.ts")
const identityStore = read("lib/server/identity/pi-identity-store.ts")
const piAuthRoute = read("app/api/auth/pi/route.ts")

// Profile enrichment remains available, but it is no longer a prerequisite for entry.
assert.match(onboarding, /finishSetupForNow/)
assert.match(onboarding, /Skip for now/)
assert.match(onboarding, /A few optional details can personalize your experience\. You can enter GreenHaven now and finish anytime\./)
assert.match(onboarding, /uploadDurableMedia\(blob/)
assert.match(context, /Profile enrichment is optional and is saved independently/i)
assert.doesNotMatch(context, /serverRejectedIncompleteProfile/)
assert.doesNotMatch(completionRoute, /getOnboardingProfileGaps|ONBOARDING_PROFILE_INCOMPLETE/)
assert.match(completionRoute, /resolveAuthenticatedUser\(request\.headers\)/)
assert.match(completionRoute, /markOnboardingCompleted\(ghUserId\)/)
assert.match(identityStore, /onboardingCompleted/)
assert.match(piAuthRoute, /const isReturning = !isNew/)
assert.match(piAuthRoute, /const needsOnboarding = isNew && record\.onboardingCompleted !== true/)

console.log("RUN296 onboarding progressive-completion contract: PASS (12 assertions)")
