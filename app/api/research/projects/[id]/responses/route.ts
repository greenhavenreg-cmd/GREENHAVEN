import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { supabaseRest, getServiceSupabaseConfig } from "@/lib/server/supabase/rest-client"
import { checkDurableRateLimit, durableRateLimitCode, durableRateLimitStatus } from "@/lib/server/security/control-plane"
import { authorizeResearchProject } from "@/lib/server/research/access"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store", Vary: "Cookie, Authorization" }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const REVIEW_STATES = new Set(["received", "pending_review", "verified", "flagged", "rejected"])
const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

type Cursor = { submittedAt: string; id: string }
function encodeCursor(cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url")
}
function decodeCursor(value: string | null): Cursor | null | false {
  if (!value) return null
  if (value.length > 512 || !/^[A-Za-z0-9_-]+$/.test(value)) return false
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Record<string, unknown>
    const submittedAt = typeof parsed.submittedAt === "string" ? parsed.submittedAt : ""
    const id = typeof parsed.id === "string" ? parsed.id : ""
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(submittedAt) || !Number.isFinite(Date.parse(submittedAt)) || !UUID.test(id)) return false
    return { submittedAt, id }
  } catch { return false }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: NO_STORE })
  const rate = await checkDurableRateLimit(`research-inbox:${auth.userId}`, 300, 60_000, { onUnavailable: "deny" })
  if (!rate.ok) return NextResponse.json({ ok: false, error: durableRateLimitCode(rate) }, { status: durableRateLimitStatus(rate), headers: NO_STORE })
  if (!getServiceSupabaseConfig()) return NextResponse.json({ ok: false, error: "RESEARCH_STORAGE_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  const { id } = await context.params
  if (!UUID.test(id)) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404, headers: NO_STORE })

  const access = await authorizeResearchProject(id, auth.userId, "responses.read")
  if (!access.ok) return NextResponse.json({ ok: false, error: access.reason === "unavailable" ? "RESEARCH_STORAGE_UNAVAILABLE" : "NOT_FOUND" }, { status: access.reason === "unavailable" ? 503 : 404, headers: NO_STORE })

  const url = new URL(request.url)
  const cursor = decodeCursor(url.searchParams.get("cursor"))
  if (cursor === false) return NextResponse.json({ ok: false, error: "INVALID_CURSOR" }, { status: 400, headers: NO_STORE })
  const rawLimit = url.searchParams.get("limit")
  const limit = rawLimit === null ? DEFAULT_PAGE_SIZE : Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) return NextResponse.json({ ok: false, error: "INVALID_PAGE_SIZE" }, { status: 400, headers: NO_STORE })
  const status = url.searchParams.get("status") || "all"
  if (status !== "all" && !REVIEW_STATES.has(status)) return NextResponse.json({ ok: false, error: "INVALID_REVIEW_STATUS" }, { status: 400, headers: NO_STORE })

  const query = new URLSearchParams({
    project_id: `eq.${id}`,
    select: "id,answers,review_status,submitted_at",
    order: "submitted_at.desc,id.desc",
    limit: String(limit + 1),
  })
  if (status !== "all") query.set("review_status", `eq.${status}`)
  if (cursor) query.set("or", `(submitted_at.lt.${cursor.submittedAt},and(submitted_at.eq.${cursor.submittedAt},id.lt.${cursor.id}))`)
  const result = await supabaseRest<Array<Record<string, unknown>>>(`gh_research_responses?${query.toString()}`, {
    headers: { Prefer: "count=exact" },
    timeoutMs: 20_000,
    maxResponseBytes: 10 * 1024 * 1024,
  })
  if (!result.ok || !Array.isArray(result.data)) return NextResponse.json({ ok: false, error: "RESEARCH_INBOX_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  const rows = result.data.slice(0, limit)
  const hasMore = result.data.length > limit
  const last = rows[rows.length - 1]
  const nextCursor = hasMore && last && typeof last.submitted_at === "string" && typeof last.id === "string"
    ? encodeCursor({ submittedAt: last.submitted_at, id: last.id })
    : null
  const contentRange = result.headers.get("content-range") || ""
  const countMatch = contentRange.match(/\/(\d+)$/)
  const total = countMatch ? Number(countMatch[1]) : null
  return NextResponse.json({ ok: true, responses: rows, page: { limit, hasMore, nextCursor, total, order: "submitted_at.desc,id.desc" } }, { headers: NO_STORE })
}
