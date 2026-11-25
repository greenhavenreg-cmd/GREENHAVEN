/**
 * Ensure the canonical private media bucket exists and matches policy.
 * Existing bucket settings are never mutated automatically: a mismatch is an
 * operator action because changing visibility/limits can affect stored assets.
 */
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { MEDIA_BUCKET_POLICY, isSafeMediaBucket, matchesMediaBucketPolicy } from "@/lib/server/media/path-policy.mjs"

type BucketRecord = {
  id?: unknown
  name?: unknown
  public?: unknown
  file_size_limit?: unknown
  allowed_mime_types?: unknown
}

export async function ensureMediaBucket(
  bucketName?: string
): Promise<{ ok: boolean; created?: boolean; error?: string; bucket: string }> {
  const env = readGhcServerEnv()
  const bucket = String(bucketName || process.env.GH_MEDIA_BUCKET || "gh-media").trim() || "gh-media"
  if (!isSafeMediaBucket(bucket)) return { ok: false, error: "BUCKET_NAME_INVALID", bucket }
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return { ok: false, error: "STORAGE_NOT_CONFIGURED", bucket }
  }

  const base = env.supabaseUrl.replace(/\/$/, "")
  const headers = {
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    apikey: env.supabaseServiceRoleKey,
    "Content-Type": "application/json",
  }
  const readBucket = async () => fetch(`${base}/storage/v1/bucket/${encodeURIComponent(bucket)}`, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  })
  const verifyExisting = async (response: Response) => {
    if (!response.ok) return { ok: false as const, error: `BUCKET_READ_${response.status}` }
    const value = await response.json().catch(() => null) as BucketRecord | null
    if (!value || String(value.id || value.name || "") !== bucket) {
      return { ok: false as const, error: "BUCKET_RESPONSE_INVALID" }
    }
    if (!matchesMediaBucketPolicy(value)) {
      return { ok: false as const, error: "BUCKET_CONFIG_MISMATCH" }
    }
    return { ok: true as const }
  }

  try {
    const existing = await readBucket()
    if (existing.ok) {
      const verified = await verifyExisting(existing)
      return verified.ok
        ? { ok: true, created: false, bucket }
        : { ok: false, error: verified.error, bucket }
    }
    // Only a confirmed not-found response is permission to provision. Auth,
    // network, rate-limit and server errors must not trigger a create attempt.
    if (existing.status !== 404) {
      return { ok: false, error: `BUCKET_READ_${existing.status}`, bucket }
    }

    const create = await fetch(`${base}/storage/v1/bucket`, {
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
      signal: AbortSignal.timeout(8_000),
    })

    if (create.ok) {
      const created = await readBucket()
      const verified = await verifyExisting(created)
      return verified.ok
        ? { ok: true, created: true, bucket }
        : { ok: false, error: verified.error, bucket }
    }
    if (create.status === 409) {
      // Another worker may have created it. Re-read and verify; never assume a
      // conflict means the bucket has the correct privacy or upload settings.
      const raced = await readBucket()
      const verified = await verifyExisting(raced)
      return verified.ok
        ? { ok: true, created: false, bucket }
        : { ok: false, error: verified.error, bucket }
    }
    return { ok: false, error: `BUCKET_CREATE_${create.status}`, bucket }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error && error.name === "TimeoutError" ? "BUCKET_TIMEOUT" : "BUCKET_NETWORK",
      bucket,
    }
  }
}
