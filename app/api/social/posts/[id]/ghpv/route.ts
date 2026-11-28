/**
 * GET /api/social/posts/[id]/ghpv
 * Safe Pioneer-authenticated quality status. No private calibration, no vote weights, no GHC.
 */
import { NextResponse } from "next/server"
import { canViewSocialPost } from "@/lib/server/social/post-visibility"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { socialDbConfigured, socialRpc } from "@/lib/server/social/rpc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  const { id } = await ctx.params
  const postId = String(id || "").trim()
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(postId)) {
    return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
  }
  // Review status and reward amounts follow the post's own visibility rules.
  const canView = await canViewSocialPost(access.auth.userId, postId)
  if (canView === null) return NextResponse.json({ ok: false, error: "POST_VISIBILITY_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
  if (!canView) return NextResponse.json({ ok: false, error: "POST_NOT_FOUND" }, { status: 404, headers: { "Cache-Control": "no-store" } })
  if (!socialDbConfigured()) {
    return NextResponse.json({
      ok: true,
      durable: false,
      status: "open",
      confidence: null,
      reason: "DB_UNAVAILABLE",
    })
  }
  const snap = await socialRpc("gh_ghpv_settlement_snapshot", { p_content_id: postId })
  const data = snap.data as {
    ok?: boolean
    error?: string
    settlementStatus?: string
    judgmentMode?: string
    votes?: unknown[]
  } | null
  if (!snap.ok || data?.ok === false) {
    const err = data?.error || "NOT_FOUND"
    return NextResponse.json({ ok: false, error: err }, { status: err === "NOT_FOUND" ? 404 : 503 })
  }
  const voters = Array.isArray(data?.votes) ? data.votes.length : 0
  const status = data?.settlementStatus || "open"
  const statusLabel =
    status === "settled"
      ? "Community review complete"
      : status === "unresolved"
        ? "Community review unresolved"
        : status === "pending"
          ? "Community review in progress"
          : "Community review open"
  return NextResponse.json({
    ok: true,
    durable: true,
    status,
    statusLabel,
    judgmentMode: data?.judgmentMode || "useful",
    participantCount: voters,
    // Public labels only — no per-reviewer weights, JCS, integrity, or power.
    settled: status === "settled" || status === "unresolved",
  })
}
