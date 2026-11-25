/**
 * GET /api/media/health — operator/diagnostic check for media pipeline.
 * Does not expose secrets. Reports storage + private-bucket readiness.
 */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { MEDIA_BUCKET_POLICY, matchesMediaBucketPolicy } from "@/lib/server/media/path-policy.mjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  // This diagnostic endpoint uses privileged storage credentials. Reject anonymous
  // callers before reading configuration or making any upstream request.
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json(
      { ok: false, error: "AUTH_REQUIRED" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    )
  }

  const env = readGhcServerEnv()
  const storageBucket = String(process.env.GH_MEDIA_BUCKET || "gh-media").trim() || "gh-media"
  const hasUrl = Boolean(env.supabaseUrl)
  const hasKey = Boolean(env.supabaseServiceRoleKey)

  let bucketReachable: boolean | null = null
  let bucketError: string | null = null
  let bucketPublic: boolean | null = null
  let fileSizeLimit: number | null = null
  let bucketConfigMatches: boolean | null = null

  if (hasUrl && hasKey) {
    try {
      // Health checks are read-only: never create or mutate infrastructure from GET.
      const res = await fetch(
        `${env.supabaseUrl!.replace(/\/$/, "")}/storage/v1/bucket/${encodeURIComponent(storageBucket)}`,
        {
          headers: {
            Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
            apikey: env.supabaseServiceRoleKey!,
          },
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
        }
      )
      bucketReachable = res.ok
      if (!res.ok) {
        bucketError = `HTTP_${res.status}`
      } else {
        const info = (await res.json().catch(() => null)) as {
          public?: boolean
          file_size_limit?: number
          allowed_mime_types?: unknown
        } | null
        if (info) {
          bucketPublic = typeof info.public === "boolean" ? info.public : null
          fileSizeLimit = typeof info.file_size_limit === "number" ? info.file_size_limit : null
          bucketConfigMatches = matchesMediaBucketPolicy(info)
        }
      }
    } catch {
      bucketReachable = false
      bucketError = "NETWORK"
    }
  }


  // Optional operator probe: /api/media/health?probeMediaId=media_xxx
  // Signs one known asset so we surface real storage sign errors (not just bucket list).
  let signProbe: {
    attempted: boolean
    ok: boolean
    error?: string
    detail?: string
    status?: number
  } = { attempted: false, ok: false }
  try {
    const probeId = new URL(request.url).searchParams.get("probeMediaId")?.trim() || ""
    if (probeId && /^media_[a-z0-9]+_[a-z0-9]+$/i.test(probeId) && auth && hasUrl && hasKey) {
      signProbe.attempted = true
      const origin = new URL(request.url).origin
      const res = await fetch(`${origin}/api/media/${encodeURIComponent(probeId)}/signed-url`, {
        method: "GET",
        headers: {
          ...(request.headers.get("cookie") ? { cookie: request.headers.get("cookie")! } : {}),
          ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      })
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        detail?: string
        status?: number
        url?: string
      } | null
      signProbe.status = res.status
      if (res.ok && body?.ok === true && typeof body.url === "string") {
        signProbe.ok = true
      } else {
        signProbe.error = body?.error || `HTTP_${res.status}`
        signProbe.detail = typeof body?.detail === "string" ? body.detail.slice(0, 180) : undefined
      }
    }
  } catch {
    signProbe = { attempted: true, ok: false, error: "PROBE_EXCEPTION" }
  }

  const ready = hasUrl && hasKey && bucketReachable === true && bucketConfigMatches === true

  return NextResponse.json(
    {
      ok: true,
      ready,
      authenticated: Boolean(auth),
      userIdPresent: Boolean(auth?.userId),
      storageConfigured: hasUrl && hasKey,
      bucket: storageBucket,
      bucketReachable,
      bucketError,
      // Kept null for response-shape compatibility; GET intentionally does not provision buckets.
      bucketEnsured: null,
      bucketProvisioning: "read-only",
      /** Operator expects private=true for GreenHaven. Public buckets still work via signed facade. */
      bucketPublic,
      fileSizeLimitBytes: fileSizeLimit,
      bucketConfigMatches,
      allowedMimeTypes: MEDIA_BUCKET_POLICY.allowedMimeTypes,
      signProbe,
      privacy: "private-bucket-via-authorized-facade",
      folders: ["avatars", "images", "videos", "audio", "documents"],
      pathPattern: "{ownerUserId}/{folder}/{uuid}.{ext}",
      limits: {
        proxyMaxMb: 4,
        imageMaxMb: 50,
        videoMaxMb: 40,
        audioMaxMb: 50,
        fileMaxMb: 50,
        bucketMaxMb: 50,
        directUpload: true,
      },
      routes: {
        proxy: "/api/media",
        directIntent: "/api/media/direct-upload-intent",
        directComplete: "/api/media/direct-upload-complete",
        content: "/api/media/{id}/content",
        signedUrl: "/api/media/{id}/signed-url",
        health: "/api/media/health",
      },
      migrationsRequired: [
        "20261022010049_gh_media_assets.sql",
        "20261023040001_gh_pulse_media_platform_v2.sql",
        "20261027010001_gh_media_upload_session_immutable_identity.sql",
        "20261027010002_gh_media_asset_create_immutable_identity.sql",
        "20261027010003_gh_media_upload_finalize_identity.sql",
        "20261022010087_gh_private_media_references_and_viewer_authz.sql",
        "20261022010089_gh_comment_media_attachments.sql",
      ],
      hint: !auth
        ? "Open while signed in. If authenticated is false, session/cookies are the first problem."
        : !hasUrl || !hasKey
          ? "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel (server secrets), plus GH_MEDIA_BUCKET."
          : bucketReachable !== true
            ? "Bucket not reachable — verify GH_MEDIA_BUCKET and server-side Storage credentials."
            : bucketConfigMatches !== true
              ? "Bucket settings do not match the required private visibility, size limit and MIME allowlist; reconcile manually after auditing existing consumers."
              : ready
              ? "Media pipeline looks ready. Uploads use owner folders; display uses /api/media/{id}/content (auth required)."
              : "Check migrations and bucket privacy settings.",
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
