/** GET /api/business/monetization — authenticated, read-only business offer preview. */
import { NextResponse } from "next/server"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { getBusinessMonetizationPolicy } from "@/lib/server/monetization/business-catalog"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  return NextResponse.json(
    { ok: true, policy: getBusinessMonetizationPolicy() },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  )
}
