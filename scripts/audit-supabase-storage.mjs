#!/usr/bin/env node
/**
 * Read-only by default. With --provision, creates ONLY a missing canonical
 * bucket; it never mutates an existing bucket or changes visibility/policies.
 */
import { MEDIA_BUCKET_POLICY, isSafeMediaBucket, matchesMediaBucketPolicy } from "../lib/server/media/path-policy.mjs"

const bucket = String(process.env.GH_MEDIA_BUCKET || "gh-media").trim() || "gh-media"
const baseValue = String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim()
const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
const provision = process.argv.includes("--provision")

function fail(message) {
  console.error(`FAIL ${message}`)
  process.exitCode = 1
}

if (process.argv.includes("--help")) {
  console.log("Usage: node scripts/audit-supabase-storage.mjs [--provision]")
  console.log("Default: read-only bucket audit. --provision creates the bucket only when absent.")
  process.exit(0)
}

if (!isSafeMediaBucket(bucket)) fail("GH_MEDIA_BUCKET is not a valid Storage bucket identifier")
let base
try {
  base = new URL(baseValue)
  if (base.protocol !== "https:") throw new Error("HTTPS required")
} catch {
  fail("Set SUPABASE_URL (HTTPS) before running the Storage audit")
}
if (!serviceKey) fail("Set SUPABASE_SERVICE_ROLE_KEY in the operator environment; never expose it to the browser")
if (process.exitCode) process.exit(process.exitCode)

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" }
const root = base.toString().replace(/\/$/, "")
const endpoint = `${root}/storage/v1/bucket/${encodeURIComponent(bucket)}`

async function readBucket() {
  return fetch(endpoint, { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) })
}

async function listBuckets() {
  return fetch(`${root}/storage/v1/bucket`, { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) })
}

try {
  const inventoryResponse = await listBuckets()
  if (!inventoryResponse.ok) {
    fail(`bucket inventory read failed (${inventoryResponse.status}); no provisioning or mutation was attempted`)
    process.exit(process.exitCode || 1)
  }
  const inventory = await inventoryResponse.json()
  if (!Array.isArray(inventory)) {
    fail("bucket inventory response was not an array")
    process.exit(process.exitCode || 1)
  }
  console.log(`Storage bucket inventory (${inventory.length}):`)
  for (const item of inventory) {
    console.log(`- ${String(item?.id || item?.name || "<unknown>")} | public=${String(item?.public)} | sizeLimit=${String(item?.file_size_limit ?? "unlimited")}`)
  }

  let response = await readBucket()
  if (response.status === 404 && provision) {
    const create = await fetch(`${root}/storage/v1/bucket`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: MEDIA_BUCKET_POLICY.public,
        file_size_limit: MEDIA_BUCKET_POLICY.fileSizeLimit,
        allowed_mime_types: MEDIA_BUCKET_POLICY.allowedMimeTypes,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    if (!create.ok && create.status !== 409) {
      fail(`bucket provisioning rejected (${create.status}); no existing bucket settings were changed`)
      process.exit(process.exitCode || 1)
    }
    response = await readBucket()
  }
  if (response.status === 404) {
    fail(`bucket '${bucket}' is missing; rerun with --provision to create only this missing bucket`)
    process.exit(process.exitCode || 1)
  }
  if (!response.ok) {
    fail(`bucket read failed (${response.status}); no provisioning or mutation was attempted`)
    process.exit(process.exitCode || 1)
  }
  const actual = await response.json()
  if (!matchesMediaBucketPolicy(actual)) {
    fail(`bucket '${bucket}' does not match canonical private policy; inspect the report and reconcile manually after auditing consumers`)
    console.error(JSON.stringify({
      bucket,
      actual: {
        public: actual?.public ?? null,
        file_size_limit: actual?.file_size_limit ?? null,
        allowed_mime_types: actual?.allowed_mime_types ?? null,
      },
      expected: {
        public: MEDIA_BUCKET_POLICY.public,
        file_size_limit: MEDIA_BUCKET_POLICY.fileSizeLimit,
        allowed_mime_types: MEDIA_BUCKET_POLICY.allowedMimeTypes,
      },
    }, null, 2))
    process.exit(process.exitCode || 1)
  }
  console.log(`PASS bucket '${bucket}' exists and matches canonical private policy`)
  console.log(`PASS visibility=private; max=${MEDIA_BUCKET_POLICY.fileSizeLimit} bytes; MIME allowlist=${MEDIA_BUCKET_POLICY.allowedMimeTypes.length}`)
  console.log("NOTE Storage object policies and media metadata integrity require the separate SQL/catalog validation workflow.")
} catch (error) {
  fail(error instanceof Error && error.name === "TimeoutError" ? "Storage API request timed out" : "Storage API request failed")
}
