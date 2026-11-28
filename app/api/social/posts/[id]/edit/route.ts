/**
 * PATCH /api/social/posts/[id]/edit — edit own post content only.
 * POST is accepted as an alias (same handler) so older clients do not get 405.
 */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { socialDbConfigured } from "@/lib/server/social/rpc"
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { nonDurableWriteResponse } from "@/lib/server/production-guard"

import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { enforceUserMutationRateLimit } from "@/lib/server/security/user-rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

const MAX_DATA_URL_CHARS = 900_000
const MAX_HTTPS_URL = 2000
const MEDIA_FACADE_PATH = /^\/api\/media\/media_[a-z0-9]+_[a-z0-9]+\/content\/?$/i
const DB_TIMEOUT_MS = 8_000

/**
 * First-party media references (/api/media/<id>/content) are accepted only when the
 * post already carries that exact reference: an edit must be able to round-trip existing
 * durable media, but it must not attach new media that never went through the
 * ownership-checked attach RPC used at creation time.
 */
function safeImage(ref: unknown, existing: Set<string>): string | null {
  const s = String(ref || "").trim()
  if (!s || s.startsWith("blob:")) return null
  if (MEDIA_FACADE_PATH.test(s)) return existing.has(s) ? s : null
  if (s.startsWith("data:image/") && s.length <= MAX_DATA_URL_CHARS) return s
  if (s.startsWith("https://") && s.length <= MAX_HTTPS_URL) return s
  return null
}
function safeVideo(ref: unknown, existing: Set<string>): string | null {
  if (ref == null || ref === "") return null
  const s = String(ref).trim()
  if (s.startsWith("blob:")) return null
  if (MEDIA_FACADE_PATH.test(s)) return existing.has(s) ? s : null
  if (s.startsWith("data:video/") && s.length <= 2_500_000) return s
  if (s.startsWith("https://") && s.length <= MAX_HTTPS_URL) return s
  return null
}

export async function POST(request: Request, ctx: Ctx) {
  return PATCH(request, ctx)
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401 })
  }
  const rateLimited = await enforceUserMutationRateLimit(auth.userId, "social/posts/[id]/edit:PATCH", 30, 60_000, { failClosed: false })
  if (rateLimited) return rateLimited
  const { id } = await ctx.params
  const postId = String(id || "").trim()
  if (!/^[a-zA-Z0-9_-]{1,180}$/.test(postId)) {
    return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
  }
  const parsedBody = await readBoundedJson(request, 64 * 1024)
  if (!parsedBody.ok) return NextResponse.json({ ok: false, error: parsedBody.error }, { status: parsedBody.error === "REQUEST_TOO_LARGE" ? 413 : 400 })
  const body = parsedBody.value
  if (body.content != null && typeof body.content !== "string") {
    return NextResponse.json({ ok: false, error: "INVALID_CONTENT" }, { status: 400 })
  }
  const content = String(body.content || "").trim()
  if (content.length > 5000) {
    return NextResponse.json({ ok: false, error: "INVALID_CONTENT" }, { status: 400 })
  }
  const hasImages = Object.prototype.hasOwnProperty.call(body, "images")
  const hasVideo = Object.prototype.hasOwnProperty.call(body, "video")
  if (hasImages && !Array.isArray(body.images)) {
    return NextResponse.json({ ok: false, error: "INVALID_MEDIA" }, { status: 400 })
  }

  if (!socialDbConfigured()) {
    const nd = nonDurableWriteResponse("Post edit")
    return NextResponse.json(nd.body, { status: nd.status })
  }

  const env = readGhcServerEnv()
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return NextResponse.json({ ok: false, error: "DB_UNAVAILABLE" }, { status: 503 })
  }
  const base = `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1`
  const dbHeaders = { apikey: env.supabaseServiceRoleKey, Authorization: `Bearer ${env.supabaseServiceRoleKey}` }

  let rows: Array<{ author_id?: string; deleted_at?: string | null; archived_at?: string | null; images?: unknown; video?: string | null; pdf?: string | null }>
  try {
    const getRes = await fetch(
      `${base}/gh_posts?id=eq.${encodeURIComponent(postId)}&select=author_id,deleted_at,archived_at,images,video,pdf`,
      { headers: dbHeaders, cache: "no-store", signal: AbortSignal.timeout(DB_TIMEOUT_MS) }
    )
    // A failed read is an outage, not a missing post.
    if (!getRes.ok) return NextResponse.json({ ok: false, error: "POST_UNAVAILABLE" }, { status: 503 })
    rows = (await getRes.json().catch(() => null)) as typeof rows
  } catch {
    return NextResponse.json({ ok: false, error: "POST_UNAVAILABLE" }, { status: 503 })
  }
  if (!Array.isArray(rows) || !rows[0] || rows[0].deleted_at) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })
  }
  if (rows[0].author_id !== auth.userId) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })
  }

  const existingImages = Array.isArray(rows[0].images) ? rows[0].images.map(String) : []
  const existingMedia = new Set<string>([...existingImages, ...(rows[0].video ? [String(rows[0].video)] : [])])

  const rawImages = hasImages ? (body.images as unknown[]) : []
  if (rawImages.length > 10) {
    return NextResponse.json({ ok: false, error: "INVALID_MEDIA" }, { status: 400 })
  }
  const images = rawImages.map((ref) => safeImage(ref, existingMedia))
  if (hasImages && images.some((x) => !x)) {
    return NextResponse.json({ ok: false, error: "INVALID_MEDIA" }, { status: 400 })
  }
  const video = hasVideo ? safeVideo(body.video, existingMedia) : null
  if (hasVideo && body.video && !video) {
    return NextResponse.json({ ok: false, error: "INVALID_MEDIA" }, { status: 400 })
  }

  // A post may be media-only (creation allows it), so text may be cleared as long as
  // some media remains after this edit.
  const finalImageCount = hasImages ? images.length : existingImages.length
  const finalHasVideo = hasVideo ? Boolean(video) : Boolean(rows[0].video)
  if (!content && finalImageCount === 0 && !finalHasVideo && !rows[0].pdf) {
    return NextResponse.json({ ok: false, error: "INVALID_CONTENT" }, { status: 400 })
  }

  let updatedRows: Array<{ id?: string; author_id?: string }>
  try {
    const patchRes = await fetch(
      // deleted_at filter closes the window between the read above and this write.
      `${base}/gh_posts?id=eq.${encodeURIComponent(postId)}&author_id=eq.${encodeURIComponent(auth.userId)}&deleted_at=is.null`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...dbHeaders, Prefer: "return=representation" },
        body: JSON.stringify({
          content,
          ...(hasImages ? { images } : {}),
          ...(hasVideo ? { video } : {}),
          is_edited: true,
          edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(DB_TIMEOUT_MS),
      }
    )
    if (!patchRes.ok) {
      return NextResponse.json({ ok: false, error: "EDIT_FAILED" }, { status: 503 })
    }
    updatedRows = (await patchRes.json().catch(() => [])) as typeof updatedRows
  } catch {
    return NextResponse.json({ ok: false, error: "EDIT_FAILED" }, { status: 503 })
  }
  if (!Array.isArray(updatedRows) || !updatedRows.some((row) => row.id === postId && row.author_id === auth.userId)) {
    return NextResponse.json({ ok: false, error: "EDIT_NOT_CONFIRMED" }, { status: 503 })
  }
  return NextResponse.json({ ok: true, durable: true, content, ...(hasImages ? { images } : {}), ...(hasVideo ? { video } : {}) }, { headers: { "Cache-Control": "no-store" } })
}
