/** Authenticated, durable community invitation inbox. */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { checkDurableRateLimit, durableRateLimitCode, durableRateLimitStatus } from "@/lib/server/security/control-plane"
import { socialDbConfigured, socialRpc } from "@/lib/server/social/rpc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "no-store, private" }

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: NO_STORE })
  const rate = await checkDurableRateLimit(`community-invitations:list:${auth.userId}`, 30, 60_000, { onUnavailable: "deny" })
  if (!rate.ok) return NextResponse.json({ ok: false, error: durableRateLimitCode(rate), retryAfterSec: rate.retryAfterSec }, { status: durableRateLimitStatus(rate), headers: { ...NO_STORE, "Retry-After": String(rate.retryAfterSec) } })
  if (!socialDbConfigured()) return NextResponse.json({ ok: false, error: "STORE_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  const result = await socialRpc("gh_community_invitation_list", { p_user_id: auth.userId, p_limit: 50 })
  const data = result.data as { ok?: boolean; invitations?: unknown[]; error?: string } | null
  if (!result.ok || !data?.ok || !Array.isArray(data.invitations)) {
    return NextResponse.json({ ok: false, error: data?.error || result.error || "INVITATIONS_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  }
  return NextResponse.json({ ok: true, durable: true, invitations: data.invitations }, { headers: NO_STORE })
}
