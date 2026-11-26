import fs from 'node:fs'
import assert from 'node:assert/strict'
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const auth = read('app/api/auth/pi/route.ts')
const profiles = read('lib/server/identity/profile-store.ts')
const walletClient = read('lib/client/pi-wallet-consent.ts')
const walletRoute = read('app/api/identity/wallet-authorization/route.ts')
const walletCard = read('components/ghc/pi-payout-authorization-card.tsx')
const completion = read('app/api/auth/onboarding-complete/route.ts')

// Verified Pi username is synchronized to the canonical profile on login.
assert.match(auth, /getServerProfile, upsertServerProfile/)
assert.match(auth, /username: record\.piUsername/)
assert.match(auth, /displayName: existingProfile\?\.displayName \|\| record\.piUsername/)
assert.match(auth, /PI_USERNAME_PROFILE_SYNC_DEFERRED/)

// No generic profile-completeness requirement may block app access.
assert.match(profiles, /export function getOnboardingProfileGaps[\s\S]*?return \[\]/)
assert.doesNotMatch(profiles, /REQUIRED_ONBOARDING_GENDERS|REQUIRED_ONBOARDING_MODES|REQUIRED_CONNECTION_INTENTS/)
assert.match(completion, /Optional profile fields are saved independently/)

// Wallet authorization remains an explicit, fresh Pi consent flow; it is not silently granted at login.
assert.match(walletClient, /piAuthenticateOfficial\(\["wallet_address"\]\)/)
assert.match(walletClient, /consent: true/)
assert.match(walletRoute, /verifyWalletConsentProof/)
assert.match(walletRoute, /grantWalletAuthorization/)
assert.match(walletCard, /if \(!consent\)/)
assert.match(walletCard, /requestPiWalletConsent\(\)/)
assert.doesNotMatch(auth, /wallet_address|requestPiWalletConsent|grantWalletAuthorization/)

console.log('RUN392 Pi identity sync + optional profile gates + explicit wallet consent: PASS (14 assertions)')
