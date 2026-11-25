#!/usr/bin/env node
import fs from 'node:fs'
const read = (file) => fs.readFileSync(file, 'utf8')
const migration = read('supabase/migrations/20261124150000_run388_research_atomic_schedule_quota.sql')
const publicRoute = read('app/api/research/public/[slug]/route.ts')
const projectsRoute = read('app/api/research/projects/route.ts')
const studio = read('components/field/research-studio-client.tsx')
const inventory = read('scripts/generate-migration-inventory.mjs')
const pkg = JSON.parse(read('package.json'))
const checks = [
  ['quota and schedule are enforced inside a single database transaction', /FOR UPDATE/.test(migration) && /RESPONSE_LIMIT_REACHED/.test(migration)],
  ['project row lock serializes quota-consuming submissions', /FROM public\.gh_research_projects[\s\S]*?FOR UPDATE/.test(migration) && /SELECT count\(\*\) INTO v_response_count/.test(migration)],
  ['submission retries remain idempotent before lifecycle checks', /already accepted submission remains idempotently readable/.test(migration) && /duplicate', true/.test(migration)],
  ['submission payload is bounded and object-shaped', /jsonb_typeof\(p_answers\) <> 'object'/.test(migration) && /pg_column_size\(p_answers\) > 65536/.test(migration)],
  ['database function rejects invalid schedules and quota values', /RESEARCH_SCHEDULE_INVALID/.test(migration) && /RESEARCH_QUOTA_INVALID/.test(migration)],
  ['database function is SECURITY DEFINER with pinned search_path', /SECURITY DEFINER/.test(migration) && /SET search_path = pg_catalog, public/.test(migration)],
  ['database function is executable only by service_role', /REVOKE ALL ON FUNCTION/.test(migration) && /TO service_role/.test(migration) && !/GRANT EXECUTE ON FUNCTION[^;]+ TO (PUBLIC|anon|authenticated)/i.test(migration)],
  ['project creation validates and persists UTC schedule and response quota', /INVALID_STUDY_SCHEDULE_OR_QUOTA/.test(projectsRoute) && /starts_at: startsAt/.test(projectsRoute) && /response_limit: responseLimit/.test(projectsRoute)],
  ['public study access checks future start and expiry', /studyWindow\(project\.settings\)/.test(publicRoute) && /RESEARCH_NOT_OPEN/.test(publicRoute) && /RESEARCH_CLOSED/.test(publicRoute)],
  ['public form checks quota availability before rendering', /Prefer: "count=exact"/.test(publicRoute) && /RESPONSE_LIMIT_REACHED/.test(publicRoute)],
  ['submission calls atomic database RPC rather than direct insert', /supabaseRpc<.*gh_research_submit_response/s.test(publicRoute) && !/gh_research_responses\?on_conflict=project_id,submission_key/.test(publicRoute)],
  ['RPC maps quota and lifecycle failures to explicit HTTP outcomes', /code === "RESPONSE_LIMIT_REACHED"/.test(publicRoute) && /code === "RESEARCH_CLOSED"/.test(publicRoute)],
  ['study builder collects optional opening and closing times', /type="datetime-local"/.test(studio) && /studyStartsAt/.test(studio) && /studyEndsAt/.test(studio)],
  ['study builder collects optional response quota', /studyResponseLimit/.test(studio) && /Maximum responses/.test(studio)],
  ['migration is held for review rather than marked applied', /20261124150000_run388_research_atomic_schedule_quota\.sql/.test(inventory) && /REVIEW_REQUIRED/.test(inventory)],
  ['RUN388 gate is wired once into static and prebuild checks', (pkg.scripts['verify:static'].match(/check-run388-research-schedule-quota\.mjs/g) || []).length === 1 && (pkg.scripts['prebuild:checks'].match(/check-run388-research-schedule-quota\.mjs/g) || []).length === 1],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`RUN388 Research schedule & quota: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
