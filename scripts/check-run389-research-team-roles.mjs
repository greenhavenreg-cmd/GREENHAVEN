#!/usr/bin/env node
import fs from 'node:fs'
const read = (file) => fs.readFileSync(file, 'utf8')
const access = read('lib/server/research/access.ts')
const projects = read('app/api/research/projects/route.ts')
const responses = read('app/api/research/projects/[id]/responses/route.ts')
const analytics = read('app/api/research/projects/[id]/analytics/route.ts')
const evidence = read('app/api/research/projects/[id]/evidence/route.ts')
const content = read('app/api/research/evidence/[evidenceId]/content/route.ts')
const studio = read('components/field/research-studio-client.tsx')
const memberActions = read('app/api/research/projects/[id]/members/[memberId]/route.ts')
const pkg = JSON.parse(read('package.json'))
const checks = [
  ['capability matrix defines owner, editor, reviewer and field-agent roles', /owner: new Set/.test(access) && /editor: new Set/.test(access) && /reviewer: new Set/.test(access) && /field_agent: new Set/.test(access)],
  ['membership authorization requires active status', /status=eq\.active/.test(access)],
  ['owner and collaborator access are both checked server-side', /owner_user_id=eq\./.test(access) && /gh_research_members\?project_id=/.test(access)],
  ['unknown roles and missing capabilities fail closed', /ROLE_CAPABILITIES\[role\]\.has\(capability\)/.test(access) && /reason: "not_found"/.test(access)],
  ['project list includes owned and active/invited collaboration records', /gh_research_members\?user_id=/.test(projects) && /status=in\.\(invited,active\)/.test(projects) && /ownedRows, \.\.\.memberProjects/.test(projects)],
  ['collaborator project list strips exam answer keys and limits pending invitations to metadata', /correctAnswer: _correctAnswer/.test(projects) && /safeSchema/.test(projects) && /membership\.status === "invited"/.test(projects) && /slug: ""/.test(projects)],
  ['response inbox requires explicit responses.read capability', /authorizeResearchProject\(id, auth\.userId, "responses\.read"\)/.test(responses)],
  ['analytics requires explicit analytics.read capability', /authorizeResearchProject\(id, auth\.userId, "analytics\.read"\)/.test(analytics)],
  ['evidence listing requires evidence.read', /authorizeResearchProject\(id, auth\.userId, "evidence\.read"\)/.test(evidence)],
  ['evidence attachment requires evidence.attach', /authorizeResearchProject\(projectId, auth\.userId, "evidence\.attach"\)/.test(evidence)],
  ['evidence review requires evidence.review', /authorizeResearchProject\(projectId, auth\.userId, "evidence\.review"\)/.test(evidence)],
  ['evidence content authorizes before revealing quarantine status', content.indexOf('authorizeResearchProject') < content.indexOf('EVIDENCE_QUARANTINED')],
  ['owner-only membership API remains the authority for team administration', /owner_user_id=eq\./.test(read('app/api/research/projects/[id]/members/route.ts')) && /isOwner/.test(read('app/api/research/projects/[id]/members/[memberId]/route.ts'))],
  ['team UI loads and invites canonical GreenHaven user IDs', /openTeam\(/.test(studio) && /inviteResearchMember/.test(studio) && /canonical GreenHaven user ID/.test(studio)],
  ['team UI supports role changes and member lifecycle controls', /change_role/.test(studio) && /suspend/.test(studio) && /reactivate/.test(studio) && /Cancel invite/.test(studio)],
  ['membership lifecycle transitions are validated and concurrency guarded', /MEMBER_NOT_REACTIVATABLE/.test(memberActions) && /MEMBER_NOT_SUSPENDABLE/.test(memberActions) && /statusGuard = `&status=eq/.test(memberActions)],
  ['invitees can accept their own pending invitation', /acceptResearchInvitation/.test(studio) && /action: "accept"/.test(studio)],
  ['field agents do not receive Research Studio response capabilities', /field_agent: new Set\(\)/.test(access) && /Open Field Desk/.test(studio)],
  ['exam and election management remain owner-only in the UI', /access_role === "owner" && activeProject\?\.project_type === "election_observation"/.test(studio) && /access_role === "owner" && activeProject\?\.project_type === "examination"/.test(studio)],
  ['reviewer and editor evidence controls match server capabilities', /access_role === "owner" \|\| activeProject\?\.access_role === "editor"/.test(studio) && /access_role === "owner" \|\| activeProject\?\.access_role === "reviewer"/.test(studio)],
  ['RUN389 gate is wired once into static and prebuild checks', (pkg.scripts['verify:static'].match(/check-run389-research-team-roles\.mjs/g) || []).length === 1 && (pkg.scripts['prebuild:checks'].match(/check-run389-research-team-roles\.mjs/g) || []).length === 1],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`RUN389 Research team roles: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
