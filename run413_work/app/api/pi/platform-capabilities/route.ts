import { NextResponse } from "next/server"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { buildPlatformCapabilities } from "@/lib/server/pi/platform-capabilities"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  const matrix = buildPlatformCapabilities()
  return NextResponse.json(
    { ...matrix, ok: true, ts: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  )
}
