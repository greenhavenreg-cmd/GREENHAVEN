import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Retired: a shared field code is not Pioneer authentication. */
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "PI_AUTHENTICATION_REQUIRED", message: "Field Research access requires Pi SDK authentication and a verified GreenHaven session." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  )
}
