import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { ensureReferralCode } from "@/lib/server/referral/referral-service"
import { deriveGreenHavenId } from "@/lib/domains/greenhaven-id"
import { ensurePublicIdentity } from "@/lib/server/economy/public-id"
import { getByGhUserId } from "@/lib/server/identity/pi-identity-store"
import { isPiOnlyCommerceEnabled } from "@/lib/server/economy/pi-only-commerce"
import { checkDurableRateLimit, durableRateLimitCode, durableRateLimitStatus } from "@/lib/server/security/control-plane"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const noStore = { "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate", Pragma: "no-cache" }

/** GET — ensure and return the caller's referral code + shareable identity keys */
export async function GET(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) {
    return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: noStore })
  }
  const rateLimit = await checkDurableRateLimit(`referral-code:${auth.userId}`, 20, 60_000, { onUnavailable: "deny" })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: durableRateLimitCode(rateLimit) },
      { status: durableRateLimitStatus(rateLimit), headers: { ...noStore, "Retry-After": String(rateLimit.retryAfterSec) } },
    )
  }
  const result = await ensureReferralCode(auth.userId)
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 503, headers: noStore })
  }

  let greenHavenId = deriveGreenHavenId(auth.userId)
  try {
    const ensured = await ensurePublicIdentity({ userId: auth.userId })
    if (ensured?.publicId) greenHavenId = String(ensured.publicId)
  } catch {
    /* derived id still shareable */
  }

  let piUsername: string | null = null
  try {
    const pi = await getByGhUserId(auth.userId)
    piUsername = pi?.piUsername || null
  } catch {
    /* */
  }

  return NextResponse.json({
    ok: true,
    code: result.code,
    greenHavenId,
    piUsername,
    sharePath: `/join?ref=${encodeURIComponent(result.code)}`,
    piOnlyCommerce: isPiOnlyCommerceEnabled(),
  }, { headers: noStore })
}
