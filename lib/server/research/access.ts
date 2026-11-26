import { supabaseRest } from "@/lib/server/supabase/rest-client"

export type ResearchCapability = "responses.read" | "analytics.read" | "evidence.read" | "evidence.attach" | "evidence.review"
export type ResearchRole = "owner" | "editor" | "reviewer" | "field_agent"
export type ResearchAccessResult =
  | { ok: true; role: ResearchRole }
  | { ok: false; reason: "not_found" | "unavailable" }

const ROLE_CAPABILITIES: Record<ResearchRole, ReadonlySet<ResearchCapability>> = {
  owner: new Set(["responses.read", "analytics.read", "evidence.read", "evidence.attach", "evidence.review"]),
  editor: new Set(["responses.read", "analytics.read", "evidence.read", "evidence.attach"]),
  reviewer: new Set(["responses.read", "analytics.read", "evidence.read", "evidence.review"]),
  field_agent: new Set(),
}

/** Server-side capability check. Membership labels alone never authorize access:
 * the member must be active and the requested capability must be granted here.
 */
export async function authorizeResearchProject(
  projectId: string,
  userId: string,
  capability: ResearchCapability,
): Promise<ResearchAccessResult> {
  const owner = await supabaseRest<Array<{ id: string }>>(
    `gh_research_projects?id=eq.${encodeURIComponent(projectId)}&owner_user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`,
  )
  if (!owner.ok) return { ok: false, reason: "unavailable" }
  if (owner.data?.length) return { ok: true, role: "owner" }

  const member = await supabaseRest<Array<{ role: string; status: string }>>(
    `gh_research_members?project_id=eq.${encodeURIComponent(projectId)}&user_id=eq.${encodeURIComponent(userId)}&status=eq.active&select=role,status&limit=1`,
  )
  if (!member.ok) return { ok: false, reason: "unavailable" }
  const row = member.data?.[0]
  if (!row || !Object.prototype.hasOwnProperty.call(ROLE_CAPABILITIES, row.role)) return { ok: false, reason: "not_found" }
  const role = row.role as ResearchRole
  if (!ROLE_CAPABILITIES[role].has(capability)) return { ok: false, reason: "not_found" }
  return { ok: true, role }
}
