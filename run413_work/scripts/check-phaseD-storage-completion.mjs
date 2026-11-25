#!/usr/bin/env node
/** Phase D Supabase Storage and media lifecycle safety gate. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MEDIA_BUCKET_POLICY, MEDIA_CATEGORIES, matchesMediaBucketPolicy, maxMediaBytesForMime, parseOwnedMediaPath } from '../lib/server/media/path-policy.mjs'
const read = (path) => readFileSync(path, 'utf8')
const ensure = read('lib/server/media/ensure-bucket.ts')
const audit = read('scripts/audit-supabase-storage.mjs')
const intent = read('app/api/media/direct-upload-intent/route.ts')
const complete = read('app/api/media/direct-upload-complete/route.ts')
const content = read('app/api/media/[id]/content/route.ts')
const signedUrl = read('app/api/media/[id]/signed-url/route.ts')
const health = read('app/api/media/health/route.ts')
const sql = read('supabase/VALIDATE-STORAGE-CONTRACT.sql')
const docs = read('docs/SUPABASE-STORAGE-OPERATIONS.md')
const pkg = JSON.parse(read('package.json'))
const expected = { public: false, file_size_limit: 52_428_800, allowed_mime_types: [...MEDIA_BUCKET_POLICY.allowedMimeTypes] }
const checks = [
  ['canonical media bucket remains private with a 50 MiB ceiling and explicit MIME allowlist', MEDIA_BUCKET_POLICY.public === false && MEDIA_BUCKET_POLICY.fileSizeLimit === 52_428_800 && MEDIA_BUCKET_POLICY.allowedMimeTypes.length === 16],
  ['bucket policy matcher requires exact visibility, size and complete MIME allowlist', matchesMediaBucketPolicy(expected) && !matchesMediaBucketPolicy({ ...expected, public: true }) && !matchesMediaBucketPolicy({ ...expected, file_size_limit: 1 }) && !matchesMediaBucketPolicy({ ...expected, allowed_mime_types: [] })],
  ['bucket provisioning creates only after confirmed 404 and verifies created or raced bucket', ensure.includes('existing.status !== 404') && ensure.includes('const created = await readBucket()') && ensure.includes('const raced = await readBucket()')],
  ['existing bucket drift is rejected without automatic update or overwrite', ensure.includes('BUCKET_CONFIG_MISMATCH') && !/method:\s*"(?:PUT|PATCH)"/.test(ensure)],
  ['operator audit is read-only by default and provisions only when --provision is explicit', audit.includes('process.argv.includes("--provision")') && audit.includes('response.status === 404 && provision') && /never mutates an existing bucket/i.test(audit)],
  ['upload intent authenticates, validates bounded payload, and creates owner-scoped upload session before signing', intent.includes('resolveAuthenticatedUser') && intent.includes('readBoundedJson') && intent.includes('buildOwnedMediaPath(auth.userId') && intent.includes('gh_media_upload_session_create') && intent.indexOf('gh_media_upload_session_create') < intent.indexOf('/object/upload/sign/')],
  ['signed upload URL is restricted to configured Supabase origin and signed-upload endpoint', intent.includes('parsedUploadUrl.origin !== new URL(base).origin') && intent.includes('/storage/v1/object/upload/sign/')],
  ['completion validates caller-owned session, bucket, object path and idempotent finalized state', complete.includes('gh_media_upload_session_get') && complete.includes('p_owner_id: auth.userId') && complete.includes('UPLOAD_SESSION_MISMATCH') && complete.includes('idempotent: true')],
  ['completion verifies stored object byte count and MIME before durable asset finalization', complete.includes('storedSize !== byteSize') && complete.includes('storedMime !== mime') && complete.includes('gh_media_upload_session_finalize')],
  ['private media delivery remains behind viewer authorization facade', signedUrl.includes('gh_media_authorize_viewer') && content.includes('Cache-Control') && content.includes('redirect: "manual"') && !content.includes('/storage/v1/object/public/')],
  ['health endpoint is read-only and verifies canonical bucket settings', health.includes('bucketProvisioning: "read-only"') && health.includes('bucketConfigMatches === true') && !health.includes('ensureMediaBucket')],
  ['all media categories remain path prefixes within one existing bucket', MEDIA_CATEGORIES.join(',') === 'audio,documents,avatars,images,videos' && docs.includes('not separate buckets')],
  ['owner-scoped path rejects cross-owner access and traversal', parseOwnedMediaPath('owner-a', 'owner-a/images/550e8400-e29b-41d4-a716-446655440000.jpg') !== null && parseOwnedMediaPath('owner-a', 'owner-b/images/550e8400-e29b-41d4-a716-446655440000.jpg') === null && parseOwnedMediaPath('owner-a', 'owner-a/../x.jpg') === null],
  ['server limits preserve 40 MiB video and 50 MiB image/PDF policy', maxMediaBytesForMime('video/mp4') === 41_943_040 && maxMediaBytesForMime('image/jpeg') === 52_428_800 && maxMediaBytesForMime('application/pdf') === 52_428_800],
  ['read-only catalog SQL audits bucket inventory, object policies, RLS, grants and lifecycle counts', ['FROM storage.buckets','FROM pg_policies','FROM pg_tables','role_table_grants','gh_media_upload_sessions'].every((part) => sql.includes(part)) && !/^\s*(?:INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)\b/im.test(sql)],
  ['Storage runbook separates bucket API state from SQL policy and live Testnet/Mainnet acceptance', docs.includes('Storage object policies are PostgreSQL policies') && docs.includes('Testnet and Mainnet') && docs.includes('does not prove live RLS/policy state')],
  ['Phase D Storage gate is registered exactly once in prebuild and static verification', ['prebuild:checks','verify:static'].every((key) => (pkg.scripts[key].match(/check-phaseD-storage-completion\.mjs/g) || []).length === 1)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nPhase D Supabase Storage completion: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
