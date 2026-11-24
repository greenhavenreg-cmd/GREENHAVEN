/** GET /api/economy/pi-acquisition-policy — read-only Phase 6 proposal. */
import { NextResponse } from "next/server"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { getPiGhcAcquisitionProposal } from "@/lib/server/monetization/pi-acquisition-proposal"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  return NextResponse.json(
    { ok: true, proposal: getPiGhcAcquisitionProposal() },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  )
}
