#!/usr/bin/env node
/** RUN383: least-privilege service-role grants for identity/privacy tables. */
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const migration = readFileSync('supabase/migrations/20261124095500_run383_identity_privacy_service_role_grants.sql', 'utf8')
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const checklist = readFileSync('docs/MIGRATION_CHECKLIST.md', 'utf8')
const checks = [
  ['transactional and additive only', /BEGIN;[\s\S]*COMMIT;/.test(migration) && !/INSERT INTO|UPDATE public\.|DELETE FROM|DROP TABLE|TRUNCATE/i.test(migration)],
  ['RLS explicitly remains enabled on all four server-owned tables', ['gh_user_profiles','gh_user_achievements','gh_user_progress','gh_user_mutes'].every((name) => new RegExp(`ALTER TABLE public\.${name} ENABLE ROW LEVEL SECURITY`).test(migration))],
  ['PUBLIC, anon and authenticated retain no table privileges', /REVOKE ALL ON TABLE[\s\S]*FROM PUBLIC, anon, authenticated/.test(migration)],
  ['profile REST upsert/read receives only SELECT, INSERT and UPDATE', /GRANT SELECT, INSERT, UPDATE ON TABLE public\.gh_user_profiles TO service_role/.test(migration)],
  ['achievement store receives only SELECT and INSERT', /GRANT SELECT, INSERT ON TABLE public\.gh_user_achievements TO service_role/.test(migration)],
  ['progress store receives SELECT only', /GRANT SELECT ON TABLE public\.gh_user_progress TO service_role/.test(migration)],
  ['feed mute-list read receives SELECT only', /GRANT SELECT ON TABLE public\.gh_user_mutes TO service_role/.test(migration)],
  ['migration is classified REVIEW_REQUIRED, never auto-applied', checklist.includes('20261124095500_run383_identity_privacy_service_role_grants.sql') && /20261124095500_run383_identity_privacy_service_role_grants\.sql[\s\S]{0,80}REVIEW_REQUIRED/.test(checklist)],
  ['check is registered once in prebuild and static verification', ['prebuild:checks','verify:static'].every((key) => (pkg.scripts[key].match(/check-run383-identity-privacy-grants\.mjs/g) || []).length === 1)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN383 identity/privacy service-role grants: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
