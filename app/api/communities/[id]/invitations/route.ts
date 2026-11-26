/** Create a community invitation. Actor and role are re-derived server-side. */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { enforceUserMutationRateLimit } from "@/lib/server/security/user-rate-limit"
import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { socialDbConfigured, socialRpc } from "@/lib/server/social/rpc"
import { sanitizeCommunityId } from "@/lib/server/community/community-integrity"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
type Ctx = { params: Promise<{ id: string }> }
const NO_STORE = { "Cache-Control": "no-store, private" }

export async function POST(request: Request, ctx: Ctx) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: NO_STORE })
  const { id } = await ctx.params
  const communityId = sanitizeCommunityId(id)
  if (!communityId) return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400, headers: NO_STORE })
  const limited = await enforceUserMutationRateLimit(auth.userId, "community-invitation-create", 20, 60_000, { failClosed: true })
  if (limited) return limited
  const parsed = await readBoundedJson(request, 2048)
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: parsed.error === "REQUEST_TOO_LARGE" ? 413 : 400, headers: NO_STORE })
  const inviteeId = typeof parsed.value.userId === "string" ? parsed.value.userId.trim() : ""
  if (!inviteeId || inviteeId.length > 256 || inviteeId === auth.userId) return NextResponse.json({ ok: false, error: "INVALID_INVITEE" }, { status: 400, headers: NO_STORE })
  if (!socialDbConfigured()) return NextResponse.json({ ok: false, error: "STORE_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  const result = await socialRpc("gh_community_invitation_create", { p_community_id: communityId, p_actor_id: auth.userId, p_invitee_id: inviteeId })
  const data = result.data as { ok?: boolean; id?: string; idempotent?: boolean; error?: string } | null
  if (!result.ok || !data?.ok) {
    const code = data?.error || result.error || "INVITATION_CREATE_UNAVAILABLE"
    const status = ["NOT_FOUND", "USER_NOT_FOUND"].includes(code) ? 404 : ["FORBIDDEN", "BLOCKED", "BANNED"].includes(code) ? 403 : ["ALREADY_MEMBER", "REQUEST_PENDING"].includes(code) ? 409 : 503
    return NextResponse.json({ ok: false, error: code }, { status, headers: NO_STORE })
  }
  return NextResponse.json({ ok: true, durable: true, invitationId: data.id, idempotent: Boolean(data.idempotent) }, { headers: NO_STORE })
}
