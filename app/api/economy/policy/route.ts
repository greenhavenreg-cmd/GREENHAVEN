/**
 * GET /api/economy/policy — authenticated, read-only GHC utility rules and catalog.
 * Contains no account, balance, or private operational data.
 */
import { NextResponse } from "next/server"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { getPublicGhcEconomyPolicy } from "@/lib/server/economy/public-policy"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  return NextResponse.json(
    { ok: true, policy: getPublicGhcEconomyPolicy() },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  )
}
