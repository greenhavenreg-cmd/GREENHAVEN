import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { getServiceSupabaseConfig, supabaseRest } from "@/lib/server/supabase/rest-client"
import { checkDurableRateLimit, durableRateLimitCode, durableRateLimitStatus } from "@/lib/server/security/control-plane"
import { authorizeResearchProject } from "@/lib/server/research/access"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "private, no-store", Vary: "Cookie, Authorization" }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i
const PAGE_SIZE = 500
const MAX_ROWS = 20_000
const MIN_CATEGORY_DISCLOSURE = 5

type Question = { id: string; label: string; type: string; options?: string[] }
type ResponseRow = { id: string; answers: Record<string, unknown>; review_status: string; submitted_at: string }
function validNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value !== "string" || !value.trim() || value.trim().length > 64) return null
  const parsed = Number(value.trim())
  return Number.isFinite(parsed) ? parsed : null
}
function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}
function isAnswered(value: unknown) {
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined && String(value).trim().length > 0
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401, headers: NO_STORE })
  const rate = await checkDurableRateLimit(`research-analytics:${auth.userId}`, 60, 60_000, { onUnavailable: "deny" })
  if (!rate.ok) return NextResponse.json({ ok: false, error: durableRateLimitCode(rate) }, { status: durableRateLimitStatus(rate), headers: NO_STORE })
  if (!getServiceSupabaseConfig()) return NextResponse.json({ ok: false, error: "RESEARCH_STORAGE_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  const { id } = await context.params
  if (!UUID.test(id)) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404, headers: NO_STORE })

  const access = await authorizeResearchProject(id, auth.userId, "analytics.read")
  if (!access.ok) return NextResponse.json({ ok: false, error: access.reason === "unavailable" ? "RESEARCH_STORAGE_UNAVAILABLE" : "NOT_FOUND" }, { status: access.reason === "unavailable" ? 503 : 404, headers: NO_STORE })
  const project = await supabaseRest<Array<{ id: string; form_schema: { questions?: Question[] } }>>(
    `gh_research_projects?id=eq.${encodeURIComponent(id)}&select=id,form_schema&limit=1`,
  )
  if (!project.ok || !project.data?.[0]) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404, headers: NO_STORE })
  const questions = Array.isArray(project.data[0].form_schema?.questions)
    ? project.data[0].form_schema.questions.filter((q) => q && typeof q.id === "string" && typeof q.label === "string" && typeof q.type === "string").slice(0, 80)
    : []

  // Freeze the inclusion window at request start so new submissions do not move
  // the offset window while it is being read. This is a bounded descriptive
  // snapshot, not an inferential/statistical population guarantee.
  const asOf = new Date().toISOString()
  const rows: ResponseRow[] = []
  let total: number | null = null
  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const query = new URLSearchParams({
      project_id: `eq.${id}`,
      submitted_at: `lte.${asOf}`,
      select: "id,answers,review_status,submitted_at",
      order: "submitted_at.asc,id.asc",
    })
    const result = await supabaseRest<ResponseRow[]>(`gh_research_responses?${query.toString()}`, {
      headers: { Range: `${offset}-${offset + PAGE_SIZE - 1}`, "Range-Unit": "items", Prefer: "count=exact" },
      timeoutMs: 20_000,
      maxResponseBytes: 10 * 1024 * 1024,
    })
    if (!result.ok || !Array.isArray(result.data)) return NextResponse.json({ ok: false, error: "RESEARCH_ANALYTICS_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
    if (offset === 0) {
      const match = (result.headers.get("content-range") || "").match(/\/(\d+)$/)
      total = match ? Number(match[1]) : null
    }
    rows.push(...result.data)
    if (result.data.length < PAGE_SIZE) break
  }

  const statusCounts: Record<string, number> = { received: 0, pending_review: 0, verified: 0, flagged: 0, rejected: 0 }
  for (const row of rows) if (Object.prototype.hasOwnProperty.call(statusCounts, row.review_status)) statusCounts[row.review_status] += 1

  const questionStats = questions.map((question) => {
    const values = rows.map((row) => row.answers?.[question.id])
    const answered = values.filter(isAnswered)
    if (answered.length < MIN_CATEGORY_DISCLOSURE) return { questionId: question.id, label: question.label, type: question.type, answered: null, missing: null, suppressed: true }
    const base = { questionId: question.id, label: question.label, type: question.type, answered: answered.length, missing: Math.max(0, rows.length - answered.length) }
    if (question.type === "number" || question.type === "rating") {
      const numbers = answered.map(validNumber).filter((value): value is number => value !== null)
      if (numbers.length < MIN_CATEGORY_DISCLOSURE) return { ...base, numeric: null, numericSuppressed: true }
      const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length
      const variance = numbers.reduce((sum, value) => sum + (value - mean) ** 2, 0) / numbers.length
      return { ...base, numeric: { count: numbers.length, min: Math.min(...numbers), max: Math.max(...numbers), mean: Number(mean.toFixed(4)), median: median(numbers), standardDeviation: Number(Math.sqrt(variance).toFixed(4)) } }
    }
    if (["single_choice", "dropdown", "multiple_choice"].includes(question.type)) {
      const counts = new Map<string, number>()
      for (const value of answered) {
        const choices = Array.isArray(value) ? value : [value]
        for (const choice of choices) {
          if (typeof choice !== "string" || choice.length > 240) continue
          counts.set(choice, (counts.get(choice) || 0) + 1)
        }
      }
      const visible = [...counts.entries()].filter(([, count]) => count >= MIN_CATEGORY_DISCLOSURE).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      const suppressed = [...counts.values()].filter((count) => count < MIN_CATEGORY_DISCLOSURE)
      return { ...base, choices: visible.map(([label, count]) => ({ label, count })), suppressedCategoryCount: suppressed.length, disclosureThreshold: MIN_CATEGORY_DISCLOSURE }
    }
    if (question.type === "date") {
      const dates = answered.map((value) => { if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null; const parsed = new Date(`${value}T00:00:00.000Z`); return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : null }).filter((value): value is string => value !== null).sort()
      return { ...base, dateRange: dates.length >= MIN_CATEGORY_DISCLOSURE ? { earliest: dates[0], latest: dates[dates.length - 1], count: dates.length } : null, dateSuppressed: dates.length > 0 && dates.length < MIN_CATEGORY_DISCLOSURE }
    }
    // Free-text content is intentionally not returned in analytics payloads.
    return { ...base, textContentIncluded: false }
  })

  return NextResponse.json({
    ok: true,
    analytics: {
      generatedAt: new Date().toISOString(),
      asOf,
      responseCount: rows.length,
      totalResponses: total,
      truncated: total === null ? rows.length === MAX_ROWS : total > rows.length,
      coverage: total === null ? "unknown" : rows.length === total ? "complete" : "bounded_sample",
      reviewStatus: statusCounts,
      questions: questionStats,
      privacy: { minimumCategoryDisclosure: MIN_CATEGORY_DISCLOSURE, freeTextIncluded: false },
    },
  }, { headers: NO_STORE })
}
