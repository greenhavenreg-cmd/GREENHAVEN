/** Accept or decline a durable community invitation. Actor is always session-derived. */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { enforceUserMutationRateLimit } from "@/lib/server/security/user-rate-limit"
import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { socialDbConfigured, socialRpc } from "@/lib/server/social/rpc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
type Ctx = { params: Promise<{ inviteId: string }> }
const NO_STORE = { "Cache-Control": "no-store, private" }

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: NO_STORE })
  const { inviteId } = await ctx.params
  if (!/^ginv_[a-f0-9]{32}$/i.test(String(inviteId || ""))) return NextResponse.json({ ok: false, error: "INVALID_INVITATION_ID" }, { status: 400, headers: NO_STORE })
  const limited = await enforceUserMutationRateLimit(auth.userId, "community-invitation-response", 20, 60_000, { failClosed: true })
  if (limited) return limited
  const parsed = await readBoundedJson(request, 1024)
  if (!parsed.ok || typeof parsed.value.accept !== "boolean") return NextResponse.json({ ok: false, error: parsed.ok ? "INVALID_RESPONSE" : parsed.error }, { status: 400, headers: NO_STORE })
  if (!socialDbConfigured()) return NextResponse.json({ ok: false, error: "STORE_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  const result = await socialRpc("gh_community_invitation_respond", { p_invitation_id: inviteId, p_actor_id: auth.userId, p_accept: parsed.value.accept })
  const data = result.data as { ok?: boolean; accepted?: boolean; idempotent?: boolean; communityId?: string; error?: string } | null
  if (!result.ok || !data?.ok) {
    const code = data?.error || result.error || "INVITATION_RESPONSE_UNAVAILABLE"
    const status = code === "NOT_FOUND" ? 404 : ["BLOCKED", "BANNED"].includes(code) ? 403 : ["INVITE_NOT_PENDING", "INVITE_EXPIRED", "COMMUNITY_UNAVAILABLE"].includes(code) ? 409 : 503
    return NextResponse.json({ ok: false, error: code }, { status, headers: NO_STORE })
  }
  return NextResponse.json({ ok: true, durable: true, accepted: Boolean(data.accepted), idempotent: Boolean(data.idempotent), communityId: data.communityId }, { headers: NO_STORE })
}
