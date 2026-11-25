/**
 * GET /api/social/posts/[id]/reward
 * Authenticated Pioneer content-reward view. Amounts only from server-written state.
 * No mutation handlers — clients cannot set rewards (use system upsert RPC only).
 */
import { NextResponse } from "next/server"
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
  if (!postId || postId.length > 128) {
    return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
  }
  const reward = await getPublicContentReward(postId)
  return NextResponse.json(reward)
}
