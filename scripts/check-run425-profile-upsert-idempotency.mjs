#!/usr/bin/env node
/** RUN425 — idempotent durable profile upsert used by Pi sign-in. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8')
const profile = read('lib/server/identity/profile-store.ts')
const piAuth = read('app/api/auth/pi/route.ts')
const migration = read('supabase/migrations/20261022010028_gh_user_profiles_and_progress.sql')
const grants = read('supabase/migrations/20261124095500_run383_identity_privacy_service_role_grants.sql')
const leastPrivilegeProposal = read('supabase/proposals/20261126_run425_revoke_unneeded_service_role_table_privileges.sql')
const pkg = JSON.parse(read('package.json'))
const dbSelect = profile.slice(profile.indexOf('async function dbSelect'), profile.indexOf('async function dbUpsert'))
const dbUpsert = profile.slice(profile.indexOf('async function dbUpsert'), profile.indexOf('export function isProfileStoreDurable'))
const profileWriter = profile.slice(profile.indexOf('export async function upsertServerProfile'), profile.indexOf('/** Map server record'))
const checks = [
  ['profile upsert targets the canonical gh_user_id conflict key', /gh_user_profiles\?on_conflict=gh_user_id/.test(dbUpsert)],
  ['PostgREST is explicitly instructed to merge duplicates and return the row', /Prefer:\s*"resolution=merge-duplicates,return=representation"/.test(dbUpsert)],
  ['profile read distinguishes not-found from database failure', /Promise<ServerProfileRecord \| null \| undefined>/.test(dbSelect) && /if \(!res\.ok\) return undefined/.test(dbSelect)],
  ['production refuses to upsert when the profile read is unavailable', /existingResult === undefined && isProd\(\)/.test(profileWriter) && /durable read unavailable before upsert/.test(profileWriter)],
  ['profile upsert preserves original created_at on conflict', /created_at:\s*new Date\(rec\.createdAt\)\.toISOString\(\)/.test(dbUpsert)],
  ['profile upsert writes the latest updated_at', /updated_at:\s*new Date\(rec\.updatedAt\)\.toISOString\(\)/.test(dbUpsert)],
  ['profile identity remains uniquely keyed by GreenHaven user ID', /gh_user_id\s+text\s+PRIMARY KEY/i.test(migration)],
  ['profile REST write remains server-role only with RLS enabled', /ENABLE ROW LEVEL SECURITY/.test(grants) && /GRANT SELECT, INSERT, UPDATE ON TABLE public\.gh_user_profiles TO service_role/.test(grants) && /FROM PUBLIC, anon, authenticated/.test(grants)],
  ['Pi profile sync remains recoverable and does not block verified session issuance', /PI_USERNAME_PROFILE_SYNC_DEFERRED/.test(piAuth) && /Profile presentation sync is recoverable/.test(piAuth) && piAuth.indexOf('PI_USERNAME_PROFILE_SYNC_DEFERRED') < piAuth.indexOf('createSession(')],
  ['least-privilege follow-up is a proposal, not an executable migration', /proposal only/i.test(leastPrivilegeProposal) && /REVOKE REFERENCES, TRIGGER, TRUNCATE/.test(leastPrivilegeProposal)],
  ['proposal postconditions verify effective privileges, including inherited grants', /has_table_privilege\('service_role'/.test(leastPrivilegeProposal) && /RAISE EXCEPTION/.test(leastPrivilegeProposal)],
  ['RUN425 regression gate is registered in prebuild', pkg.scripts?.['prebuild:checks']?.includes('check-run425-profile-upsert-idempotency.mjs')],
  ['RUN425 regression gate is registered in static verification', pkg.scripts?.['verify:static']?.includes('check-run425-profile-upsert-idempotency.mjs')],
]
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
const failed = checks.filter(([, ok]) => !ok)
console.log(`\nRUN425 Pi profile upsert: ${checks.length - failed.length}/${checks.length} passed`)
if (failed.length) process.exit(1)
