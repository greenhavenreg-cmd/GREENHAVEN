import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Canonical referral landing route. Keep invite attribution through the public
 * join link, then hand the browser to the app shell where ?ref= is captured
 * before sign-in and flushed after the authenticated identity is ready.
 */
export async function GET(request: Request) {
  const incoming = new URL(request.url)
  const raw = incoming.searchParams.get("ref") || incoming.searchParams.get("referral") || incoming.searchParams.get("invite") || ""
  const code = raw.trim().toUpperCase()
  const destination = new URL("/", incoming.origin)
  if (/^[A-Z0-9]{2,32}$/.test(code)) destination.searchParams.set("ref", code)
  return NextResponse.redirect(destination, 307)
}
