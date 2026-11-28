/**
 * GET /api/social/posts/[id]/reward
 * Authenticated Pioneer content-reward view. Amounts only from server-written state.
 * No mutation handlers — clients cannot set rewards (use system upsert RPC only).
 */
import { NextResponse } from "next/server"
import { canViewSocialPost } from "@/lib/server/social/post-visibility"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { getPublicContentReward } from "@/lib/server/content-reward/store"

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
  const reward = await getPublicContentReward(postId)
  return NextResponse.json(reward)
}
