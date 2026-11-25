#!/usr/bin/env node
/** Static + runtime contract checks for Run 394 Phase 5/6. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  MEDIA_BUCKET_POLICY,
  MEDIA_CATEGORIES,
  matchesMediaBucketPolicy,
  maxMediaBytesForMime,
  parseOwnedMediaPath,
  validateMediaMetadata,
} from '../lib/server/media/path-policy.mjs'

const read = (path) => readFileSync(path, 'utf8')
const profileMetrics = read('lib/profile-enhancements.ts')
const profileStore = read('lib/server/identity/profile-store.ts')
const profileRoute = read('app/api/profile/me/route.ts')
const onboardingComplete = read('app/api/auth/onboarding-complete/route.ts')
const bucketEnsure = read('lib/server/media/ensure-bucket.ts')
const mediaIntent = read('app/api/media/direct-upload-intent/route.ts')
const mediaHealth = read('app/api/media/health/route.ts')
const clientMediaLimits = read('lib/media/limits.ts')
const mediaUploadClient = read('lib/media/upload-client.ts')
const mediaComplete = read('app/api/media/direct-upload-complete/route.ts')
const mediaAssetMigration = read('supabase/migrations/20261022010049_gh_media_assets.sql')
const uploadSessionMigration = read('supabase/migrations/20261023040001_gh_pulse_media_platform_v2.sql')
const privateMediaMigration = read('supabase/migrations/20261022010087_gh_private_media_references_and_viewer_authz.sql')
const storageOps = read('docs/SUPABASE-STORAGE-OPERATIONS.md')
const storageAudit = read('scripts/audit-supabase-storage.mjs')
const storageSql = read('supabase/VALIDATE-STORAGE-CONTRACT.sql')
const packageJson = JSON.parse(read('package.json'))
const packageLock = JSON.parse(read('package-lock.json'))
const appRelease = read('lib/app-release.ts')

const checks = [
  ['profile completion is optional enrichment and excludes verification, DOB and age gates', !/bornDate|verified\s*:\s*\{\s*weight/.test(profileMetrics) && /optional profile enrichment only/.test(profileMetrics)],
  ['profile completion weights sum to 100 and retain meaningful profile fields', /displayName: \{ weight: 15/.test(profileMetrics) && /bio: \{ weight: 20/.test(profileMetrics) && /photos: \{ weight: 20/.test(profileMetrics) && /location: \{ weight: 15/.test(profileMetrics) && /interests: \{ weight: 15/.test(profileMetrics) && /education: \{ weight: 7/.test(profileMetrics) && /profession: \{ weight: 8/.test(profileMetrics)],
  ['onboarding profile gaps never become a general access gate', /export function getOnboardingProfileGaps\([\s\S]*?return \[\]/.test(profileStore)],
  ['profile edits preserve omitted fields and permit explicit clearing of optional text', /function mergeOptionalText/.test(profileStore) && ['bio','city','country','profession','hometown','education','status','gender'].every((field) => new RegExp(`${field}: mergeOptionalText\\(input`).test(profileStore))],
  ['profile PATCH derives owner from authenticated session and strips lifecycle state', /resolveAuthenticatedUser/.test(profileRoute) && /delete input\.onboarded/.test(profileRoute) && /upsertServerProfile\(auth\.userId/.test(profileRoute)],
  ['onboarding completion remains an identity lifecycle action, not a profile questionnaire', /markOnboardingCompleted\(ghUserId\)/.test(onboardingComplete) && !/displayName|dateOfBirth|gender|city/.test(onboardingComplete)],
  ['canonical bucket policy is private with a fixed 50 MiB ceiling and explicit MIME allowlist', MEDIA_BUCKET_POLICY.public === false && MEDIA_BUCKET_POLICY.fileSizeLimit === 50 * 1024 * 1024 && MEDIA_BUCKET_POLICY.allowedMimeTypes.length === 16],
  ['shared bucket-policy matcher rejects public, wrong-size and incomplete-MIME configurations', matchesMediaBucketPolicy({ public: false, file_size_limit: 52428800, allowed_mime_types: MEDIA_BUCKET_POLICY.allowedMimeTypes }) && !matchesMediaBucketPolicy({ public: true, file_size_limit: 52428800, allowed_mime_types: MEDIA_BUCKET_POLICY.allowedMimeTypes }) && !matchesMediaBucketPolicy({ public: false, file_size_limit: 1024, allowed_mime_types: MEDIA_BUCKET_POLICY.allowedMimeTypes }) && !matchesMediaBucketPolicy({ public: false, file_size_limit: 52428800, allowed_mime_types: [] })],
  ['bucket ensure validates existing configuration instead of silently accepting drift', /matchesMediaBucketPolicy/.test(bucketEnsure) && /BUCKET_CONFIG_MISMATCH/.test(bucketEnsure) && /existing\.status !== 404/.test(bucketEnsure)],
  ['media health readiness requires the exact private bucket policy and reports the correct video limit', /bucketConfigMatches/.test(mediaHealth) && /bucketConfigMatches === true/.test(mediaHealth) && /videoMaxMb: 40/.test(mediaHealth) && /allowedMimeTypes: MEDIA_BUCKET_POLICY\.allowedMimeTypes/.test(mediaHealth)],
  ['bucket ensure does not mutate existing bucket settings', !/method:\s*"PUT"|method:\s*"PATCH"/.test(bucketEnsure) && /Only a confirmed not-found response/.test(bucketEnsure)],
  ['bucket creation is read back and verified, including conflict races', /const created = await readBucket\(\)/.test(bucketEnsure) && /const raced = await readBucket\(\)/.test(bucketEnsure)],
  ['all media categories remain prefixes within the existing bucket', MEDIA_CATEGORIES.join(',') === 'audio,documents,avatars,images,videos' && storageOps.includes('not separate buckets')],
  ['owner path rejects traversal and enforces exact owner/category structure', parseOwnedMediaPath('owner-1', 'owner-1/avatars/550e8400-e29b-41d4-a716-446655440000.jpg') !== null && parseOwnedMediaPath('owner-1', 'owner-2/avatars/550e8400-e29b-41d4-a716-446655440000.jpg') === null && parseOwnedMediaPath('owner-1', 'owner-1/../x.jpg') === null],
  ['video byte ceiling remains 40 MiB and image/PDF ceiling remains 50 MiB across server and client limits', maxMediaBytesForMime('video/mp4') === 40 * 1024 * 1024 && maxMediaBytesForMime('image/jpeg') === 50 * 1024 * 1024 && maxMediaBytesForMime('application/pdf') === 50 * 1024 * 1024 && /MEDIA_VIDEO_MAX_BYTES = 40 \* 1024 \* 1024/.test(clientMediaLimits) && /MAX_DIRECT_VIDEO_BYTES = 40 \* 1024 \* 1024/.test(mediaUploadClient)],
  ['server upload intent validates MIME and creates an owner-scoped signed upload session', mediaIntent.includes('resolveAuthenticatedUser') && mediaIntent.includes('buildOwnedMediaPath(auth.userId') && mediaIntent.includes('gh_media_upload_session_create') && mediaIntent.includes('/object/upload/sign/')],
  ['upload completion validates session owner, bucket, path, bytes and stored object metadata', mediaComplete.includes('gh_media_upload_session_get') && mediaComplete.includes('UPLOAD_SESSION_MISMATCH') && mediaComplete.includes('storedSize !== byteSize') && mediaComplete.includes('gh_media_upload_session_finalize')],
  ['media asset and upload session tables retain deny-client RLS policies', /ALTER TABLE public\.gh_media_assets ENABLE ROW LEVEL SECURITY/.test(mediaAssetMigration) && /gh_media_assets_no_client[\s\S]*?USING \(false\) WITH CHECK \(false\)/.test(mediaAssetMigration) && /ALTER TABLE public\.gh_media_upload_sessions ENABLE ROW LEVEL SECURITY/.test(uploadSessionMigration) && /gh_media_upload_sessions_no_client[\s\S]*?USING \(false\) WITH CHECK \(false\)/.test(uploadSessionMigration)],
  ['private media delivery continues to authorize the viewer and does not switch bucket visibility', /gh_media_authorize_viewer/.test(privateMediaMigration) && /must not be switched private until/.test(privateMediaMigration) && storageOps.includes('Do not make it public')],
  ['operator audit is read-only by default and provisions only a missing bucket', /const provision = process\.argv\.includes\("--provision"\)/.test(storageAudit) && /response\.status === 404 && provision/.test(storageAudit) && /never mutates an existing bucket/i.test(storageAudit)],
  ['storage operations document distinguishes bucket metadata from SQL policies and live verification', storageOps.includes('Storage object policies are PostgreSQL policies') && storageOps.includes('does not prove live RLS/policy state')],
  ['read-only SQL validation covers bucket policy, Storage object policies, media RLS and client grants', storageSql.includes('FROM storage.buckets') && storageSql.includes('FROM pg_policies') && storageSql.includes('FROM public.gh_media_assets') && storageSql.includes('FROM public.gh_media_upload_sessions') && storageSql.includes('rowsecurity') && storageSql.includes('role_table_grants') && !/^\s*(?:INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)\b/im.test(storageSql)],
  ['Run 394 check is registered in static verification', packageJson.scripts['verify:static'].includes('check-run394-phase5-6-profile-storage.mjs')],
  ['application, package and lockfile release versions agree', packageLock.version === packageJson.version && packageLock.packages[''].version === packageJson.version && appRelease.includes(`APP_RELEASE_VERSION = \"${packageJson.version}\"`)],
]

let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (!ok) failed++
}
console.log(`\nRUN394 Phase 5/6 profile + Storage checks: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
