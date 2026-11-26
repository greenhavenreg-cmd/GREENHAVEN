#!/usr/bin/env node
/** Final source-level acceptance contract for the coordinated onboarding, Pi identity and Storage upgrade. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const pkg = JSON.parse(read('package.json'))
const lock = JSON.parse(read('package-lock.json'))
const appRelease = read('lib/app-release.ts')
const piAuth = read('app/api/auth/pi/route.ts')
const onboardingComplete = read('app/api/auth/onboarding-complete/route.ts')
const gate = read('lib/onboarding-local.ts')
const piContext = read('contexts/pi-auth-context.tsx')
const ghcContext = read('contexts/ghc-context.tsx')
const onboardingUi = read('components/ghc/onboarding.tsx')
const walletConsent = read('lib/server/identity/wallet-consent.ts')
const walletAuthorization = read('lib/server/identity/wallet-authorization.ts')
const storagePolicy = read('lib/server/media/path-policy.mjs')
const bucketEnsure = read('lib/server/media/ensure-bucket.ts')
const storageOps = read('docs/SUPABASE-STORAGE-OPERATIONS.md')
const storageSql = read('supabase/VALIDATE-STORAGE-CONTRACT.sql')
const phaseDReport = read('GREENHAVEN-0.338.118-PHASE-D-REPORT.md')

const checks = [
  ['package, lockfile and in-app release agree on current package version', /^\d+\.\d+\.\d+$/.test(pkg.version) && lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && appRelease.includes(`APP_RELEASE_VERSION = "${pkg.version}"`) ],
  ['production Pi authentication verifies the Platform identity before resolving a canonical user', /verifyPiAccessToken/.test(piAuth) && /findOrCreateFromVerifiedPi/.test(piAuth) && piAuth.indexOf('verifyPiAccessToken') < piAuth.indexOf('findOrCreateFromVerifiedPi')],
  ['returning users are classified from durable mapping existence, not optional profile shape', /const isReturning = !isNew/.test(piAuth) && /const identityExisted = !isNew/.test(piAuth)],
  ['optional Pi username projection preserves an existing display name', /username: record\.piUsername/.test(piAuth) && /displayName: existingProfile\?\.displayName \|\| record\.piUsername/.test(piAuth)],
  ['production auth fails closed when durable identity/session stores are unavailable', /prod && \(!isPiIdentityDurable\(\) \|\| !isSessionStoreDurable\(\)\)/.test(piAuth)],
  ['onboarding completion is identity-backed and no longer a profile questionnaire', /markOnboardingCompleted\(ghUserId\)/.test(onboardingComplete) && !/displayName|dateOfBirth|gender|city/.test(onboardingComplete)],
  ['unverified onboarding state remains unknown instead of being inferred from local profile shape', /if \(!input\.serverVerified\) return "unknown"/.test(gate)],
  ['client lifecycle requires server verification before marking the authenticated identity ready', /serverVerified: Boolean\(bridged\)/.test(piContext) && /serverVerified: true/.test(piContext)],
  ['app shell does not let local profile shape override explicit server-required onboarding', /if \(d\.serverVerified\)/.test(ghcContext) && /d\.onboardingStatus === "required"/.test(ghcContext)],
  ['onboarding offers direct entry and skippable progressive profile enrichment', /Enter GreenHaven now/.test(onboardingUi) && /Skip for now/.test(onboardingUi)],
  ['empty optional profile steps do not overwrite existing values', /Object\.keys\(profilePatch\)\.length \? await updateProfile/.test(onboardingUi)],
  ['wallet authorization requires explicit consent and fresh verified Pi proof', /consent !== true/.test(walletConsent) && /verifyPiAccessToken/.test(walletConsent)],
  ['browser-submitted wallet address is not accepted as independent proof of ownership', /platformWalletAddress/.test(walletConsent) && /wallet_address/.test(walletConsent) && /scope_only/.test(walletConsent)],
  ['withdrawal authorization binds canonical identity and verified wallet evidence', /piAppUid/.test(walletAuthorization) && /walletAddressSource/.test(walletAuthorization) && /walletAddressVerifiedAt/.test(walletAuthorization)],
  ['normal app access does not require a withdrawal wallet', /wallet consent/i.test(read('docs/RUN392-PI-IDENTITY-OPTIONAL-PROFILE-GATES-2026-11-24.md')) && /not silently granted during ordinary login/i.test(read('docs/RUN392-PI-IDENTITY-OPTIONAL-PROFILE-GATES-2026-11-24.md'))],
  ['Storage uses the established single private gh-media bucket architecture', /public: false/.test(storagePolicy) && /gh-media/.test(bucketEnsure) && /one private bucket/.test(storageOps)],
  ['Storage policy explicitly limits media size and MIME types', /fileSizeLimit: MAX_MEDIA_BYTES/.test(storagePolicy) && /allowedMimeTypes: MEDIA_ALLOWED_MIME_TYPES/.test(storagePolicy)],
  ['owner-scoped media paths reject traversal and cross-owner access', /parseOwnedMediaPath/.test(storagePolicy) && /parts\[0\] !== ownerId/.test(storagePolicy) && /part === "\.\."/.test(storagePolicy)],
  ['bucket provisioning creates only after confirmed 404 and verifies readback', /existing\.status !== 404/.test(bucketEnsure) && /const created = await readBucket\(\)/.test(bucketEnsure) && /const raced = await readBucket\(\)/.test(bucketEnsure)],
  ['existing bucket configuration drift fails closed without automatic mutation', /BUCKET_CONFIG_MISMATCH/.test(bucketEnsure) && !/method:\s*"PUT"|method:\s*"PATCH"/.test(bucketEnsure)],
  ['Storage operator runbook requires separate Testnet and Mainnet verification', /separately against the intended Testnet and Mainnet/.test(storageOps)],
  ['Storage SQL validation remains read-only', /FROM storage\.buckets/.test(storageSql) && /FROM pg_policies/.test(storageSql) && !/^\s*(?:INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)\b/im.test(storageSql)],
  ['no migration was introduced by the Phase D source implementation', /No SQL migration added, edited, replayed or applied\./.test(phaseDReport)],
  ['final acceptance gate is registered once in static and prebuild verification', (pkg.scripts['verify:static'].match(/check-run395-phase9-release-acceptance\.mjs/g) || []).length === 1 && (pkg.scripts['prebuild:checks'].match(/check-run395-phase9-release-acceptance\.mjs/g) || []).length === 1],
]

let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (!ok) failed++
}
console.log(`\nPhase 9 coordinated release acceptance: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
