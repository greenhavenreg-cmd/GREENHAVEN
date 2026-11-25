import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { supabaseRest, supabaseRpc, getServiceSupabaseConfig } from "@/lib/server/supabase/rest-client"
import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { checkDurableRateLimit, durableRateLimitCode, durableRateLimitStatus } from "@/lib/server/security/control-plane"
import { isResearchQuestionVisible, type ResearchQuestion } from "@/lib/research/logic"
import { requireAccountSecurityContext } from "@/lib/server/identity/auth-integrity"
import { researchSubmissionKey } from "@/lib/server/research/respondent"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "no-store" }
type Question = ResearchQuestion
function studyWindow(settings: unknown, now = Date.now()) {
  const value = settings && typeof settings === "object" && !Array.isArray(settings) ? settings as Record<string, unknown> : {}
  const startsRaw = value.starts_at
  const endsRaw = value.ends_at
  const startsAt = startsRaw === undefined || startsRaw === null || startsRaw === "" ? null : typeof startsRaw === "string" ? Date.parse(startsRaw) : Number.NaN
  const endsAt = endsRaw === undefined || endsRaw === null || endsRaw === "" ? null : typeof endsRaw === "string" ? Date.parse(endsRaw) : Number.NaN
  if ((startsAt !== null && !Number.isFinite(startsAt)) || (endsAt !== null && !Number.isFinite(endsAt)) || (startsAt !== null && endsAt !== null && endsAt <= startsAt)) return "invalid"
  if (startsAt !== null && now < startsAt) return "not_open"
  if (endsAt !== null && now >= endsAt) return "closed"
  return "open"
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  const { slug } = await context.params
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(slug) || !getServiceSupabaseConfig()) return NextResponse.json({ ok: false, error: "RESEARCH_NOT_FOUND" }, { status: 404, headers: NO_STORE })
  const result = await supabaseRest<Array<Record<string, unknown>>>(`gh_research_projects?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,slug,title,description,project_type,form_schema,settings&limit=1`)
  const project = result.ok ? result.data?.[0] : null
  if (!project) return NextResponse.json({ ok: false, error: "RESEARCH_NOT_FOUND" }, { status: 404, headers: NO_STORE })
  const windowState = studyWindow(project.settings)
  if (windowState === "invalid") return NextResponse.json({ ok: false, error: "RESEARCH_SCHEDULE_INVALID" }, { status: 503, headers: NO_STORE })
  if (windowState === "not_open") return NextResponse.json({ ok: false, error: "RESEARCH_NOT_OPEN" }, { status: 409, headers: NO_STORE })
  if (windowState === "closed") return NextResponse.json({ ok: false, error: "RESEARCH_CLOSED" }, { status: 410, headers: NO_STORE })
  const settings = project.settings && typeof project.settings === "object" ? project.settings as Record<string, unknown> : {}
  if (Number.isSafeInteger(settings.response_limit) && Number(settings.response_limit) > 0) {
    const count = await supabaseRest<Array<{ id: string }>>(`gh_research_responses?project_id=eq.${encodeURIComponent(String(project.id))}&select=id&limit=1`, { headers: { Prefer: "count=exact" } })
    const total = (count.headers.get("content-range") || "").match(/\/(\d+)$/)
    if (!count.ok || !total) return NextResponse.json({ ok: false, error: "RESEARCH_AVAILABILITY_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
    if (Number(total[1]) >= Number(settings.response_limit)) return NextResponse.json({ ok: false, error: "RESPONSE_LIMIT_REACHED" }, { status: 410, headers: NO_STORE })
  }
  return NextResponse.json({ ok: true, project: { slug: project.slug, title: project.title, description: project.description, projectType: project.project_type, isExam: project.project_type === "examination", questions: ((project.form_schema as { questions?: Question[] })?.questions || []).map((question) => { const { correctAnswer: _correctAnswer, answerKey: _answerKey, points: _points, ...publicQuestion } = question as Question & { correctAnswer?: unknown; answerKey?: unknown; points?: unknown }; return publicQuestion }), allowEvidenceUploads: project.project_type !== "examination" && settings.allow_evidence_uploads !== false } }, { headers: NO_STORE })
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const access = await requireAccountSecurityContext(request.headers)
  if (!access.ok) return access.response
  const { slug } = await context.params
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(slug)) return NextResponse.json({ ok: false, error: "RESEARCH_NOT_FOUND" }, { status: 404, headers: NO_STORE })
  const rawIp = request.headers.get("x-real-ip")?.trim() || "unknown"
  const ip = /^[0-9a-fA-F:.]{1,64}$/.test(rawIp) ? rawIp : "unknown"
  const rate = await checkDurableRateLimit(`research-public-submit:${slug}:${ip}`, 8, 60 * 60_000, { onUnavailable: "deny" })
  if (!rate.ok) return NextResponse.json({ ok: false, error: durableRateLimitCode(rate) }, { status: durableRateLimitStatus(rate), headers: NO_STORE })
  const parsed = await readBoundedJson(request, 64 * 1024)
  if (!parsed.ok) return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: parsed.error === "REQUEST_TOO_LARGE" ? 413 : 400, headers: NO_STORE })
  const payload = parsed.value as Record<string, unknown>
  const answers = payload.answers && typeof payload.answers === "object" && !Array.isArray(payload.answers) ? payload.answers as Record<string, unknown> : null
  const consent = payload.consent === true
  if (!answers || !consent) return NextResponse.json({ ok: false, error: "CONSENT_AND_ANSWERS_REQUIRED" }, { status: 400, headers: NO_STORE })
  if (!getServiceSupabaseConfig()) return NextResponse.json({ ok: false, error: "RESEARCH_STORAGE_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  const projectResult = await supabaseRest<Array<Record<string, unknown>>>(`gh_research_projects?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,project_type,form_schema,settings&limit=1`)
  const project = projectResult.ok ? projectResult.data?.[0] : null
  if (!project) return NextResponse.json({ ok: false, error: "RESEARCH_NOT_FOUND" }, { status: 404, headers: NO_STORE })
  const windowState = studyWindow(project.settings)
  if (windowState === "invalid") return NextResponse.json({ ok: false, error: "RESEARCH_SCHEDULE_INVALID" }, { status: 503, headers: NO_STORE })
  if (windowState === "not_open") return NextResponse.json({ ok: false, error: "RESEARCH_NOT_OPEN" }, { status: 409, headers: NO_STORE })
  if (windowState === "closed") return NextResponse.json({ ok: false, error: "RESEARCH_CLOSED" }, { status: 410, headers: NO_STORE })
  if (project.project_type === "examination") return NextResponse.json({ ok: false, error: "EXAM_SUBMISSION_REQUIRED" }, { status: 409, headers: NO_STORE })
  const questions = ((project.form_schema as { questions?: Question[] })?.questions || []).slice(0, 80)
  const normalized: Record<string, string | string[] | number> = {}
  for (const q of questions) {
    const visible = isResearchQuestionVisible(q.showWhen, normalized)
    if (!visible) continue
    const raw = answers[q.id]
    const empty = raw === undefined || raw === null || raw === "" || (typeof raw === "string" && !raw.trim()) || (Array.isArray(raw) && raw.length === 0)
    if (q.required && empty) return NextResponse.json({ ok: false, error: "REQUIRED_ANSWER_MISSING", questionId: q.id }, { status: 400, headers: NO_STORE })
    if (raw === undefined || raw === null || raw === "") continue
    if (["single_choice", "dropdown"].includes(q.type)) {
      if (typeof raw !== "string" || !(q.options || []).includes(raw)) return NextResponse.json({ ok: false, error: "INVALID_ANSWER", questionId: q.id }, { status: 400, headers: NO_STORE })
      normalized[q.id] = raw
    } else if (q.type === "multiple_choice") {
      if (!Array.isArray(raw) || raw.length > 30 || raw.some((v) => typeof v !== "string" || !(q.options || []).includes(v))) return NextResponse.json({ ok: false, error: "INVALID_ANSWER", questionId: q.id }, { status: 400, headers: NO_STORE })
      normalized[q.id] = raw as string[]
    } else if (q.type === "rating" || q.type === "number") {
      const n = Number(raw)
      const max = q.type === "rating" ? 5 : 1000000
      if (!Number.isFinite(n) || n < 0 || n > max || (q.type === "rating" && !Number.isInteger(n))) return NextResponse.json({ ok: false, error: "INVALID_ANSWER", questionId: q.id }, { status: 400, headers: NO_STORE })
      normalized[q.id] = n
    } else {
      if (typeof raw !== "string" || raw.length > 4000) return NextResponse.json({ ok: false, error: "INVALID_ANSWER", questionId: q.id }, { status: 400, headers: NO_STORE })
      if (q.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(`${raw}T00:00:00Z`)))) return NextResponse.json({ ok: false, error: "INVALID_ANSWER", questionId: q.id }, { status: 400, headers: NO_STORE })
      normalized[q.id] = raw.trim()
    }
  }
  const acceptedIds = new Set(questions.filter((q) => isResearchQuestionVisible(q.showWhen, normalized)).map((q) => q.id))
  if (Object.keys(answers).some((key) => !acceptedIds.has(key))) return NextResponse.json({ ok: false, error: "UNKNOWN_OR_HIDDEN_ANSWER" }, { status: 400, headers: NO_STORE })
  const clientSubmissionKey = typeof payload.submissionKey === "string" && /^[A-Za-z0-9_-]{16,80}$/.test(payload.submissionKey) ? payload.submissionKey : randomUUID()
  const idempotencyKey = researchSubmissionKey(access.auth.userId, clientSubmissionKey)
  const submittedAt = new Date().toISOString()
  const submitted = await supabaseRpc<{ ok: boolean; error?: string; duplicate?: boolean; response_id?: string; submitted_at?: string }>("gh_research_submit_response", {
    p_project_id: String(project.id),
    p_submission_key: idempotencyKey,
    p_answers: normalized,
    p_consent_recorded_at: submittedAt,
  }, { timeoutMs: 15_000 })
  if (!submitted.ok || !submitted.data) return NextResponse.json({ ok: false, error: "RESPONSE_SAVE_FAILED" }, { status: 503, headers: NO_STORE })
  if (!submitted.data.ok) {
    const code = submitted.data.error || "RESPONSE_SAVE_FAILED"
    const status = code === "RESPONSE_LIMIT_REACHED" ? 409 : code === "RESEARCH_CLOSED" ? 410 : code === "RESEARCH_NOT_OPEN" ? 409 : code === "RESEARCH_NOT_FOUND" ? 404 : code === "RESEARCH_SCHEDULE_INVALID" || code === "RESEARCH_QUOTA_INVALID" ? 503 : 400
    return NextResponse.json({ ok: false, error: code }, { status, headers: NO_STORE })
  }
  const responseRow = submitted.data.response_id ? { id: submitted.data.response_id } : null
  if (!responseRow?.id) return NextResponse.json({ ok: false, error: "RESPONSE_REFERENCE_UNAVAILABLE" }, { status: 503, headers: NO_STORE })
  // Bind only uploads created under this exact project + unguessable submission key.
  const pendingEvidence = await supabaseRest<Array<{ id: string }>>(`gh_research_evidence?project_id=eq.${project.id}&submission_key=eq.${encodeURIComponent(idempotencyKey)}&response_id=is.null&select=id&limit=6`)
  if (!pendingEvidence.ok) return NextResponse.json({ ok: false, error: "RESPONSE_EVIDENCE_RECONCILIATION_PENDING" }, { status: 503, headers: NO_STORE })
  if (pendingEvidence.data.length) {
    const attached = await supabaseRest(`gh_research_evidence?project_id=eq.${project.id}&submission_key=eq.${encodeURIComponent(idempotencyKey)}&response_id=is.null`, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ response_id: responseRow.id }) })
    if (!attached.ok) return NextResponse.json({ ok: false, error: "RESPONSE_EVIDENCE_RECONCILIATION_PENDING" }, { status: 503, headers: NO_STORE })
  }
  const attachedEvidence = await supabaseRest<Array<{ id: string }>>(`gh_research_evidence?project_id=eq.${project.id}&response_id=eq.${responseRow.id}&select=id&limit=6`)
  if (!attachedEvidence.ok) return NextResponse.json({ ok: false, error: "RESPONSE_EVIDENCE_RECONCILIATION_PENDING" }, { status: 503, headers: NO_STORE })
  return NextResponse.json({ ok: true, message: "Your response has been received.", duplicate: submitted.data.duplicate === true, evidenceCount: attachedEvidence.data.length }, { status: submitted.data.duplicate ? 200 : 201, headers: NO_STORE })
}
