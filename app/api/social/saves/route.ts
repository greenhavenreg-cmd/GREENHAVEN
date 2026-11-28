/**
 * GET  /api/social/saves — list saved post ids for session user
 * POST /api/social/saves — { postId } toggle save for session user
 */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { checkRateLimit } from "@/lib/server/economy/rate-limit"
import { socialDbConfigured, socialRpc } from "@/lib/server/social/rpc"
import { nonDurableWriteResponse, nonDurableReadResponse } from "@/lib/server/production-guard"
import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { canViewSocialPost, filterVisibleSocialPosts } from "@/lib/server/social/post-visibility"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"


/** True/false when the member's own save row exists; null when the lookup itself failed. */
async function ownSaveExists(userId: string, postId: string): Promise<boolean | null> {
  const env = readGhcServerEnv()
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null
  try {
    const params = new URLSearchParams({ select: "post_id", user_id: `eq.${userId}`, post_id: `eq.${postId}`, limit: "1" })
    const res = await fetch(`${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/gh_saves?${params}`, {
      headers: { apikey: env.supabaseServiceRoleKey, Authorization: `Bearer ${env.supabaseServiceRoleKey}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) return null
    const rows = await res.json().catch(() => null)
    return Array.isArray(rows) ? rows.length > 0 : null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }
  if (!socialDbConfigured()) {
    const nd = nonDurableReadResponse("Saved posts", { postIds: [], count: 0 })
    return NextResponse.json(nd.body, { status: nd.status, headers: { "Cache-Control": "no-store" } })
  }
  const env = readGhcServerEnv()
  const base = env.supabaseUrl!.replace(/\/$/, "")
  const limit = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get("limit") || 50) || 50))
  try {
    const params = new URLSearchParams({
      select: "post_id,created_at",
      user_id: `eq.${auth.userId}`,
      order: "created_at.desc",
      limit: String(limit),
    })
    const res = await fetch(`${base}/rest/v1/gh_saves?${params}`, {
      headers: {
        apikey: env.supabaseServiceRoleKey!,
        Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      return NextResponse.json(
        { ok: false, durable: false, error: "SAVES_LIST_FAILED", message: errText.slice(0, 120) },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      )
    }
    const rows = (await res.json().catch(() => [])) as Array<{ post_id?: string; created_at?: string }>
    const savedIds = Array.isArray(rows)
      ? rows.map((r) => String(r.post_id || "").trim()).filter(Boolean)
      : []
    // Hide saves whose post was deleted, archived, made private or blocked since it was saved, so the
    // saved list and its count only show posts the member can open. One batched policy read, not N+1.
    // If the policy data cannot be read the ids are still returned: they carry no post content, and
    // opening a post re-checks visibility.
    const visible = await filterVisibleSocialPosts(auth.userId, savedIds.map((id) => ({ id })))
    const visibleIds = visible === null
      ? null
      : new Set(visible.map((row) => String((row as { id?: unknown }).id || "")))
    const postIds = visibleIds ? savedIds.filter((id) => visibleIds.has(id)) : savedIds
    return NextResponse.json(
      { ok: true, durable: true, postIds, count: postIds.length, filtered: visibleIds !== null },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      { ok: false, durable: false, error: "SAVES_LIST_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401 })
  }
  const rl = checkRateLimit(`save:${auth.userId}`, 40, 60_000)
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "RATE_LIMITED" }, { status: 429 })
  }
  const parsedBody = await readBoundedJson(request, 4096)
  if (!parsedBody.ok) return NextResponse.json({ ok: false, error: parsedBody.error }, { status: parsedBody.error === "REQUEST_TOO_LARGE" ? 413 : 400, headers: { "Cache-Control": "no-store" } })
  const body = parsedBody.value
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ ok: false, error: "POST_REQUIRED" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  const postId = (typeof body.postId === "string" ? body.postId : "").trim()
  if (!postId || postId.length > 128) {
    return NextResponse.json({ ok: false, error: "POST_REQUIRED" }, { status: 400 })
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(postId)) return NextResponse.json({ ok: false, error: "POST_REQUIRED" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  if (!socialDbConfigured()) {
    const nd = nonDurableWriteResponse("Save post")
    return NextResponse.json(nd.body, { status: nd.status })
  }
  const canView = await canViewSocialPost(auth.userId, postId)
  if (canView === null) return NextResponse.json({ ok: false, error: "POST_VISIBILITY_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
  if (!canView) {
    // A post that was deleted, archived, made private or blocked since it was saved must still be removable
    // from the member's own list. New saves of an unreachable post stay refused.
    const alreadySaved = await ownSaveExists(auth.userId, postId)
    if (alreadySaved === null) return NextResponse.json({ ok: false, error: "SAVES_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
    if (!alreadySaved) return NextResponse.json({ ok: false, error: "POST_NOT_FOUND" }, { status: 404, headers: { "Cache-Control": "no-store" } })
  }
  const result = await socialRpc("gh_save_toggle", {
    p_user_id: auth.userId,
    p_post_id: postId,
  })
  const data = result.data as { ok?: boolean; saved?: boolean; error?: string }
  if (!result.ok || data?.ok === false) {
    const err = String(data?.error || result.error || "SAVE_FAILED")
    if (/_HTTP_404$/.test(err) || result.status === 404) {
      return NextResponse.json(
        {
          ok: false,
          error: "SOCIAL_RPC_UNAVAILABLE",
          diagnosticCode: result.diagnosticCode || null,
          diagnosticMessage: result.diagnosticMessage || null,
          message: "Save RPC is not installed. Apply supabase migration 20261022010099_ENSURE_social_engagement_rpcs.sql",
        },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { ok: false, error: err },
      { status: data?.error === "NOT_FOUND" ? 404 : data?.error === "FORBIDDEN" ? 403 : 503 }
    )
  }
  return NextResponse.json({
    ok: true,
    durable: true,
    saved: Boolean(data?.saved),
  })
}
