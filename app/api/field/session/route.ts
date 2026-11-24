import { NextResponse } from "next/server"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  return NextResponse.json({ ok: true, configured: true, authenticated: true, label: access.auth.username || null }, { headers: { "Cache-Control": "no-store" } })
}

export async function DELETE(request: Request) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  return NextResponse.json({ ok: false, error: "USE_PI_SESSION_SIGN_OUT" }, { status: 405, headers: { "Cache-Control": "no-store" } })
}
