/**
 * GET /api/referral/status — caller's code, attribution, invite counts, reward tallies.
 * Does not invent balances; settlement still gated by GHC_REFERRAL_SETTLEMENT_ENABLED.
 */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { getReferralStatus } from "@/lib/server/referral/referral-service"
import { checkDurableRateLimit, durableRateLimitCode, durableRateLimitStatus } from "@/lib/server/security/control-plane"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const noStore = { "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate", Pragma: "no-cache" }

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: noStore })
  }
  // This GET may create a referral code and always performs service-role reads.
  // Keep it bounded and fail closed when the shared limiter is unavailable.
  const rateLimit = await checkDurableRateLimit(`referral-status:${auth.userId}`, 30, 60_000, { onUnavailable: "deny" })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: durableRateLimitCode(rateLimit) },
      { status: durableRateLimitStatus(rateLimit), headers: { ...noStore, "Retry-After": String(rateLimit.retryAfterSec) } },
    )
  }
  const status = await getReferralStatus(auth.userId)
  if (!status.ok) {
    return NextResponse.json(
      { ok: false, error: status.error || "STATUS_FAILED" },
      { status: status.error === "DB_UNAVAILABLE" ? 503 : 500, headers: noStore },
    )
  }
  return NextResponse.json({
    ok: true,
    durable: true,
    code: status.code,
    sharePath: status.code ? `/join?ref=${encodeURIComponent(status.code)}` : undefined,
    attributed: status.attributed,
    invitedCount: status.invitedCount ?? 0,
    pendingRewardCount: status.pendingRewardCount ?? 0,
    postedRewardCount: status.postedRewardCount ?? 0,
    pendingRewardGhc: status.pendingRewardGhc ?? 0,
    postedRewardGhc: status.postedRewardGhc ?? 0,
    settlementEnabled: Boolean(status.settlementEnabled),
  }, { headers: noStore })
}
