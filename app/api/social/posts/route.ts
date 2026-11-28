/**
 * POST /api/social/posts — create post (author = session user only).
 * GET  /api/social/posts — feed alias.
 *
 * Media: accepts https URLs or compressed data:image/* URLs under size caps.
 * Rejects blob: and client ownership fields. Idempotent when client sends stable id.
 */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { checkRateLimit } from "@/lib/server/economy/rate-limit"
import { socialDbConfigured, socialRpc } from "@/lib/server/social/rpc"
import { resolveMediaAssets } from "@/lib/server/media/asset-store"
import { nonDurableWriteResponse, nonDurableReadResponse } from "@/lib/server/production-guard"
import { getServerProfile } from "@/lib/server/identity/profile-store"
import { hydratePublicProfileIdentity } from "@/lib/server/identity/public-profile-hydration"
import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { canViewSocialPost } from "@/lib/server/social/post-visibility"
import { supabaseRest, supabaseRpc } from "@/lib/server/supabase/rest-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_DATA_URL_CHARS = 900_000
const MAX_HTTPS_URL = 2000

function genId(): string {
  return `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

const MEDIA_FACADE_PATH = /^\/api\/media\/(media_[a-z0-9]+_[a-z0-9]+)\/content\/?$/i

function isSafeImageRef(ref: string): boolean {
  const s = String(ref || "").trim()
  if (!s || s.length > MAX_DATA_URL_CHARS || s.startsWith("blob:")) return false
  if (s.startsWith("data:image/")) return s.length <= MAX_DATA_URL_CHARS
  if (MEDIA_FACADE_PATH.test(s)) return true
  if (s.startsWith("https://")) return s.length <= MAX_HTTPS_URL
  return false
}

function isSafeVideoRef(ref: string | null): boolean {
  if (!ref) return true
  const s = String(ref).trim()
  if (!s || s.startsWith("blob:")) return !s
  if (s.startsWith("data:video/")) return s.length <= 2_500_000
  if (MEDIA_FACADE_PATH.test(s)) return true
  if (s.startsWith("https://")) return s.length <= MAX_HTTPS_URL
  return false
}

function isSafePdfRef(ref: string | null): boolean {
  if (!ref) return true
  const s = String(ref).trim()
  if (!s || s.startsWith("blob:")) return !s
  if (MEDIA_FACADE_PATH.test(s)) return true
  if (s.startsWith("data:application/pdf;base64,")) return s.length <= 600_000
  if (s.startsWith("https://")) return s.length <= MAX_HTTPS_URL
  return false
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401 })
  }
  if (!socialDbConfigured()) {
    const nd = nonDurableReadResponse("Posts list", { posts: [] })
    return NextResponse.json(nd.body, { status: nd.status })
  }
  const result = await socialRpc("gh_post_list_feed", {
    p_viewer_id: auth.userId,
    p_limit: 40,
    p_before_ms: null,
  })
  const payload = result.data as { posts?: unknown[] }
  const rawPosts = Array.isArray(payload?.posts) ? payload.posts : []
  const posts = await hydratePublicProfileIdentity(rawPosts.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")))
  return NextResponse.json({
    ok: true,
    durable: result.ok,
    posts,
  }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const rl = checkRateLimit(`post-create:${auth.userId}`, 20, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMITED", retryAfterSec: rl.retryAfterSec },
      { status: 429 }
    )
  }

  const parsedBody = await readBoundedJson(request, 12 * 1024 * 1024)
  if (!parsedBody.ok) return NextResponse.json({ ok: false, error: parsedBody.error }, { status: parsedBody.error === "REQUEST_TOO_LARGE" ? 413 : 400, headers: { "Cache-Control": "no-store" } })
  const body = parsedBody.value
  // Cheap shape checks first, before any media/database work.
  if (body.content != null && typeof body.content !== "string") {
    return NextResponse.json({ ok: false, error: "INVALID_CONTENT" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }
  const content = String(body.content || "").trim()
  if (content.length > 5000) {
    return NextResponse.json({ ok: false, error: "CONTENT_TOO_LONG" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }
  const suppliedImages = Array.isArray(body.images) ? body.images : []
  if (suppliedImages.length > 10) return NextResponse.json({ ok: false, error: "TOO_MANY_IMAGES" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  const rawImages = suppliedImages.map(String)
  const images = rawImages.filter(isSafeImageRef)
  if (images.length !== rawImages.length) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_MEDIA",
        message:
          "Images must be optimized data URLs, HTTPS URLs, or owned GreenHaven media references. Blob URLs are not durable.",
      },
      { status: 400 }
    )
  }

  const pdf = body.pdf ? String(body.pdf) : null
  if (pdf && !isSafePdfRef(pdf)) {
    return NextResponse.json({ ok: false, error: "INVALID_ATTACHMENT" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  // Optional durable media IDs (session must own or public_url available)
  let videoFromMedia: string | null = null
  if (Array.isArray(body.mediaIds) && body.mediaIds.length > 20) {
    return NextResponse.json({ ok: false, error: "TOO_MANY_MEDIA_IDS" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }
  const mediaIds = Array.isArray(body.mediaIds)
    ? [...new Set(body.mediaIds.map(String).map((s) => s.trim()).filter(Boolean))]
    : []
  if (mediaIds.length > 0) {
    const resolved = await resolveMediaAssets(auth.userId, mediaIds)
    if (!resolved.ok) {
      return NextResponse.json({ ok: false, error: "MEDIA_RESOLUTION_UNAVAILABLE" }, { status: 503 })
    }
    const byId = new Map(resolved.assets.map((a) => [String(a.id || ""), a]))
    for (const mediaId of mediaIds) {
      const asset = byId.get(mediaId)
      // Durable private attachments must belong to the authenticated author.
      if (!asset || asset.owned !== true || asset.status !== "ready") {
        return NextResponse.json({ ok: false, error: "MEDIA_NOT_OWNED_OR_READY" }, { status: 403 })
      }
      const url = `${new URL(request.url).origin}/api/media/${encodeURIComponent(mediaId)}/content`
      if (String(asset.kind) === "video" && !videoFromMedia) videoFromMedia = url
      else if (String(asset.kind) === "image" && images.length < 10) images.push(url)
    }
  }
  // De-duplicate before the row snapshot and attachment RPC so a repeated URL cannot
  // consume the attachment cap or create inconsistent display metadata.
  const uniqueImages = [...new Set(images)].slice(0, 10)
  images.splice(0, images.length, ...uniqueImages)
  // Older composer versions only send the stable delivery URL. Recover the opaque media ID
  // from that first-party URL so the post gets a durable media relation as well.
  const mediaReferenceUrls = [...images, ...(videoFromMedia ? [videoFromMedia] : []), ...(body.video ? [String(body.video)] : []), ...(pdf ? [pdf] : [])]
  const mediaIdsFromUrls = mediaReferenceUrls
    .map((value) => {
      try {
        const origin = new URL(request.url).origin
        const parsed = new URL(value, origin)
        const match = parsed.pathname.match(/^\/api\/media\/(media_[a-z0-9]+_[a-z0-9]+)\/content\/?$/i)
        return parsed.origin === origin ? match?.[1] || "" : ""
      } catch { return "" }
    }).filter(Boolean)
  const durableMediaIds = [...new Set([...mediaIds, ...mediaIdsFromUrls])].slice(0, 20)

  const video = videoFromMedia || (body.video ? String(body.video) : null)
  if (video && !isSafeVideoRef(video)) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_VIDEO",
        message: "Video must be an HTTPS URL, a bounded data:video URL, or a GreenHaven media reference. Blob URLs are not durable.",
      },
      { status: 400 }
    )
  }

  const hasMedia = images.length > 0 || Boolean(video) || Boolean(pdf)
  if (!content && !hasMedia) {
    return NextResponse.json({ ok: false, error: "EMPTY_POST" }, { status: 400 })
  }
  if (content.length > 5000) {
    return NextResponse.json({ ok: false, error: "CONTENT_TOO_LONG" }, { status: 400 })
  }

  const visibility = ["public", "followers", "mutuals", "private"].includes(
    String(body.visibility || "")
  )
    ? String(body.visibility)
    : "public"

  let contentType = body.contentType ? String(body.contentType).slice(0, 40) : "standard"
  if (!hasMedia && content.length > 0 && content.length <= 280 && contentType === "standard") {
    contentType = "status"
  }
  // Short-form: durable video with little/no image gallery
  if (
    contentType === "standard" &&
    Boolean(video) &&
    images.length === 0 &&
    !pdf
  ) {
    contentType = "short_video"
  }
  if (contentType === "reel") contentType = "short_video"

  const clientId = String(body.id || "").trim()
  const id =
    clientId && /^post_[a-zA-Z0-9_-]{6,80}$/.test(clientId) ? clientId : genId()

  // Quote reference: only accept a stable post id string (server does not trust client content of original)
  const quoteOfRaw = body.quoteOf != null ? String(body.quoteOf).trim() : ""
  const quoteOf =
    quoteOfRaw && /^[a-zA-Z0-9_-]{6,120}$/.test(quoteOfRaw) ? quoteOfRaw : null

  // Community posts: require active membership (session user) — never trust client role claims
  const communityId =
    body.communityId != null ? String(body.communityId).trim() : ""
  if (communityId && !/^[a-zA-Z0-9_-]{1,180}$/.test(communityId)) {
    return NextResponse.json({ ok: false, error: "INVALID_COMMUNITY" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }
  if (communityId) {
    if (!socialDbConfigured()) {
      return NextResponse.json(
        { ok: false, error: "SOCIAL_DB_UNAVAILABLE", durable: false },
        { status: 503 }
      )
    }
    const roleRes = await socialRpc("gh_community_member_role", {
      p_community_id: communityId,
      p_user_id: auth.userId,
    })
    const roleData = roleRes.data as {
      ok?: boolean
      role?: string
      status?: string
      error?: string
    }
    const status = String(roleData?.status || "").toLowerCase()
    const role = String(roleData?.role || "").toLowerCase()
    const activeMember =
      roleRes.ok &&
      (status === "active" || (!status && Boolean(role))) &&
      status !== "banned" &&
      status !== "pending" &&
      status !== "rejected"
    if (!activeMember) {
      return NextResponse.json(
        { ok: false, error: "NOT_A_MEMBER", message: "Join this community before posting." },
        { status: 403 }
      )
    }
  }

  // Presentation identity is server-derived. Never let a post creation request
  // impersonate another display name/avatar via client-supplied snapshot fields.
  const serverProfile = await getServerProfile(auth.userId).catch(() => null)
  const authorName = String(serverProfile?.displayName || serverProfile?.username || auth.username || "Member").slice(0, 120)
  const authorPhoto = String(serverProfile?.photos?.[0] || "").slice(0, 2000)

  const row = {
    id,
    authorId: auth.userId,
    authorName,
    authorPhoto,
    content,
    images,
    video,
    pdf,
    pdfName: body.pdfName ? String(body.pdfName).slice(0, 200) : null,
    visibility,
    listingId: body.listingId ? String(body.listingId).slice(0, 180) : null,
    listingKind: body.listingKind ? String(body.listingKind).slice(0, 40) : null,
    communityId: communityId || null,
    communityName: body.communityName ? String(body.communityName).slice(0, 120) : null,
    contentType,
    createdAt: Date.now(),
    ...(quoteOf ? { quoteOf } : {}),
  }

  if (!socialDbConfigured()) {
    return NextResponse.json({
      ok: true,
      durable: false,
      post: row,
      message: "SOCIAL_DB_UNAVAILABLE — local session remains until migration",
    })
  }

  const result = await socialRpc("gh_post_create", { p_row: row })
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "CREATE_FAILED", durable: false },
      { status: 503 }
    )
  }
  const data = result.data as { ok?: boolean; error?: string }
  if (data && data.ok === false) {
    const err = String(data.error || "")
    if (err.toLowerCase().includes("duplicate") || err.toLowerCase().includes("unique")) {
      return NextResponse.json({ ok: true, durable: true, post: row, duplicate: true })
    }
    const error = String(data.error || "CREATE_REJECTED")
    return NextResponse.json(
      { ok: false, error },
      { status: error === "ID_CONFLICT" || error === "ID_RETIRED" ? 409 : 400, headers: { "Cache-Control": "no-store" } }
    )
  }

  // Persist durable media-ID references after post creation. The RPC re-checks author,
  // media ownership, readiness and deleted state in one database transaction. On failure,
  // hide the just-created post rather than leave an unauthorized half-published attachment.
  if (durableMediaIds.length > 0) {
    const attach = await supabaseRpc<{ ok?: boolean }>(
      "gh_post_media_attach",
      { p_actor_id: auth.userId, p_post_id: id, p_media_ids: durableMediaIds },
      { timeoutMs: 12_000 },
    )
    const attached = attach.ok && attach.data?.ok === true
    if (!attached) {
      // Hide the just-created post so an unauthorized half-published attachment is never
      // visible. The hide result is verified: a failed rollback is reported, never swallowed.
      const hide = await supabaseRest(
        `gh_posts?id=eq.${encodeURIComponent(id)}&author_id=eq.${encodeURIComponent(auth.userId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
          timeoutMs: 8_000,
        },
      )
      if (!hide.ok) console.error("[social/posts] media attach rollback failed", { postId: id, status: hide.status, error: hide.error })
      return NextResponse.json(
        {
          ok: false,
          error: "MEDIA_ATTACH_FAILED",
          message: "The post was not published because media authorization could not be persisted.",
          ...(hide.ok ? {} : { cleanupPending: true }),
        },
        { status: 503 },
      )
    }
  }

  // Attach quote_of_post_id. Only a quote the author is allowed to see is attached; a private
  // or blocked original must not become reachable through the quoting post. The post itself is
  // already durable, so a failed quote link is reported (quoteAttached:false) instead of silently lost.
  let quoteAttached: boolean | undefined
  if (quoteOf) {
    quoteAttached = false
    if ((await canViewSocialPost(auth.userId, quoteOf)) === true) {
      const original = await supabaseRest<unknown[]>(
        `gh_posts?id=eq.${encodeURIComponent(quoteOf)}&deleted_at=is.null&select=id&limit=1`,
        { timeoutMs: 8_000 },
      )
      if (original.ok && Array.isArray(original.data) && original.data.length > 0) {
        const link = await supabaseRest(
          `gh_posts?id=eq.${encodeURIComponent(id)}&author_id=eq.${encodeURIComponent(auth.userId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ quote_of_post_id: quoteOf }),
            timeoutMs: 8_000,
          },
        )
        quoteAttached = link.ok
        if (!link.ok) console.error("[social/posts] quote link failed", { postId: id, status: link.status, error: link.error })
      }
    }
  }

  // Durable post-created alerts go only to followers who are allowed to see
  // this post. The RPC skips blocked relationships and enforces mutual-only
  // visibility in SQL; community/private posts never fan out to all followers.
  if (!communityId && visibility !== "private") {
    const preview = content || (images.length ? "Shared a photo" : video ? "Shared a video" : "Shared a post")
    await socialRpc("gh_social_notify_post_followers", {
      p_author_id: auth.userId,
      p_post_id: id,
      p_body: preview.slice(0, 180),
      p_dedupe_key: `post_created:${id}`,
      p_visibility: visibility,
    }).catch(() => null)
  }

  return NextResponse.json({ ok: true, durable: true, post: row, ...(quoteAttached === undefined ? {} : { quoteAttached }) })
}
