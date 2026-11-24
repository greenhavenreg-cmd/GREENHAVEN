import { NextResponse } from "next/server"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { buildListingCompliancePosture } from "@/lib/server/compliance/listing-posture"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  const posture = buildListingCompliancePosture()
  return NextResponse.json(
    { ...posture, ok: true, ts: new Date().toISOString() },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  )
}
