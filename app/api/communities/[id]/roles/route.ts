/**
 * POST /api/communities/[id]/roles
 * Body: { targetUserId, role: "admin"|"moderator"|"member" }
 * Actor must be owner or admin. Cannot change owner or self.
 */
import { NextResponse } from "next/server"
import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { socialDbConfigured, socialRpc } from "@/lib/server/social/rpc"
import { nonDurableWriteResponse } from "@/lib/server/production-guard"
import { enforceUserMutationRateLimit } from "@/lib/server/security/user-rate-limit"
import { sanitizeCommunityId } from "@/lib/server/community/community-integrity"
import { communityRole } from "@/lib/server/community/governance-store"
import { checkDurableRateLimit, durableRateLimitCode, durableRateLimitStatus } from "@/lib/server/security/control-plane"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }


const NO_STORE = { "Cache-Control": "no-store, private" }

/** GET /api/communities/[id]/roles — return only the caller's server-verified role. */
export async function GET(request: Request, ctx: Ctx) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: NO_STORE })
  const rate = await checkDurableRateLimit(`community-role:${auth.userId}`, 90, 60_000, { onUnavailable: "deny" })
  if (!rate.ok) return NextResponse.json({ ok: false, error: durableRateLimitCode(rate), retryAfterSec: rate.retryAfterSec }, { status: durableRateLimitStatus(rate), headers: { ...NO_STORE, "Retry-After": String(rate.retryAfterSec) } })
  const { id } = await ctx.params
  const communityId = sanitizeCommunityId(id)
  if (!communityId) return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400, headers: NO_STORE })
  if (!socialDbConfigured()) return NextResponse.json({ ok: false, error: "STORE_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  try {
    const role = await communityRole(communityId, auth.userId)
    const allowed = ["owner", "admin", "moderator", "member"]
    return NextResponse.json({ ok: true, durable: true, role: typeof role === "string" && allowed.includes(role) ? role : "guest" }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ ok: false, error: "ROLE_LOOKUP_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  }
}

export async function POST(request: Request, ctx: Ctx) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401 })
  }
  const __rateLimited = await enforceUserMutationRateLimit(auth.userId, "communities/[id]/roles:POST", 60, 60_000, { failClosed: true })
  if (__rateLimited) return __rateLimited
  const { id } = await ctx.params
  const communityId = sanitizeCommunityId(id)
  const parsedBody = await readBoundedJson(request, 8192)
  if (!parsedBody.ok) return NextResponse.json({ ok: false, error: parsedBody.error }, { status: parsedBody.error === "REQUEST_TOO_LARGE" ? 413 : 400 })
  const body = parsedBody.value
  const targetUserId = String(body.targetUserId || body.userId || "").trim()
  const role = String(body.role || "").trim().toLowerCase()
  // Ownership transfer is not available via this endpoint — prevents client owner injection
  const ALLOWED = new Set(["member", "moderator", "admin"])
  if (!communityId || !targetUserId || targetUserId.length > 160 || /[\u0000-\u001f\u007f]/.test(targetUserId) || !role) {
    return NextResponse.json({ ok: false, error: "INVALID" }, { status: 400 })
  }
  if (!ALLOWED.has(role)) {
    return NextResponse.json({ ok: false, error: "INVALID_ROLE" }, { status: 400 })
  }
  if (targetUserId === auth.userId) {
    return NextResponse.json({ ok: false, error: "SELF_ROLE" }, { status: 403 })
  }
  if (!socialDbConfigured()) {
    const nd = nonDurableWriteResponse("Community role", { extra: { role } })
    return NextResponse.json(nd.body, { status: nd.status })
  }
  const result = await socialRpc("gh_community_set_role", {
    p_community_id: communityId,
    p_actor_id: auth.userId,
    p_target_id: targetUserId,
    p_role: role,
  })
  const data = result.data as { ok?: boolean; error?: string; role?: string }
  if (!result.ok || data?.ok === false) {
    const code = data?.error || result.error || "ROLE_FAILED"
    const status =
      code === "FORBIDDEN" || code === "SELF_ROLE" || code === "CANNOT_CHANGE_OWNER"
        ? 403
        : 400
    return NextResponse.json({ ok: false, error: code }, { status })
  }
  return NextResponse.json({ ok: true, durable: true, role: data?.role || role })
}
