#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const root = process.cwd()
const read = p => readFileSync(join(root, p), 'utf8')
const migration = read('supabase/migrations/20261125090000_run407_service_role_earnings_ledger_privileges.sql').split('\n').filter(line => !line.trim().startsWith('--')).join('\n')
const checks = [
  ['Run 407 ledger migration exists', existsSync(join(root, 'supabase/migrations/20261125090000_run407_service_role_earnings_ledger_privileges.sql'))],
  ['ledger grants are limited to SELECT/INSERT/UPDATE for service_role', /GRANT\s+SELECT\s*,\s*INSERT\s*,\s*UPDATE\s+ON\s+TABLE\s+public\.gh_earnings_ledger_entries\s+TO\s+service_role\s*;/i.test(migration)],
  ['migration does not grant DELETE or client-role access', !/GRANT[^;]*\bDELETE\b|GRANT[^;]*\bTO\s+(PUBLIC|anon|authenticated)\b/i.test(migration)],
  ['audit report records runtime failures and remaining blockers', /profile-store upsert 403\/409/.test(read('docs/GREENHAVEN-RUN407-PRODUCTION-AUDIT-2026-11-25.md')) && /fail-closed/.test(read('docs/GREENHAVEN-RUN407-PRODUCTION-AUDIT-2026-11-25.md'))],
  ['worklog preserves migration-history and deployment caveats', /do not blindly replay it/i.test(read('docs/UPGRADE-WORKLOG-0.338.133.md')) && /does not claim a GitHub push/i.test(read('docs/UPGRADE-WORKLOG-0.338.133.md'))],
  ['candidate package and in-app release agree', JSON.parse(read('package.json')).version === '0.338.135' && read('lib/app-release.ts').includes('APP_RELEASE_VERSION = "0.338.135"')],
]
let failed = 0
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failed++ }
console.log(`\nRun 407 audit integration: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
