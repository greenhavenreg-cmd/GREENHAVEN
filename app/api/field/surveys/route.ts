import { NextResponse } from "next/server"
import { fieldSessionScopeId } from "@/lib/server/field/access"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { listFieldSurveys } from "@/lib/server/field/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  return NextResponse.json(
    { ok: true, surveys: listFieldSurveys() },
    { headers: { "Cache-Control": "no-store" } },
  )
}
