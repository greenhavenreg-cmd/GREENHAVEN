import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const root = process.cwd()
const read = (p) => readFileSync(join(root, p), 'utf8')
let pass = 0
let fail = 0
function test(label, condition) {
  if (condition) { pass++; console.log(`PASS ${label}`) }
  else { fail++; console.error(`FAIL ${label}`) }
}
const sqlPath = 'supabase/diagnostics/RUN437_PHASE3_READONLY_TESTNET_RECONCILIATION.sql'
const sql = read(sqlPath)
const executable = sql.replace(/--[^\n]*/g, '').trim()
const statements = executable.split(';').map(s => s.trim()).filter(Boolean)
test('RUN437 read-only diagnostic SQL exists', existsSync(join(root, sqlPath)))
test('RUN437 diagnostic contains only SELECT/WITH statements', statements.length >= 6 && statements.every(s => /^(SELECT|WITH)\b/i.test(s)))
test('RUN437 checks all 17 RUN384 index effects', (sql.match(/\('idx_gh_/g) || []).length === 17)
test('RUN437 checks server grants and client denial separately', sql.includes("'SERVER_GRANT'") && sql.includes("'CLIENT_DENIAL'"))
test('RUN437 checks RUN388/RUN396/RUN405/RUN429 functions', ['gh_research_submit_response','gh_pi_earnings_payout_list_owned','gh_earnings_testnet_registration_bonus_backfill','gh_community_invitation_create','gh_community_invitation_list','gh_community_invitation_respond'].every(x => sql.includes(x)))
test('RUN437 checks atomic session-cap RPC without enabling it', sql.includes('gh_session_issue_with_cap') && !/ALTER\s+DATABASE|CREATE\s+FUNCTION|GRANT\s+EXECUTE/i.test(executable))
test('RUN437 preserves migration history and reports duplicate records', sql.includes('MIGRATION_HISTORY_DUPLICATE') && sql.includes('MIGRATION_HISTORY_TAIL'))
test('RUN437 fingerprints function definitions without invoking them', sql.includes('pg_get_functiondef') && sql.includes('definition_md5') && sql.includes('FUNCTION_FINGERPRINT'))
test('RUN437 captures exact present RUN384 index definitions', sql.includes('RUN384_INDEX_DEFINITION') && sql.includes('indexdef'))
test('RUN437 inspects RUN405 backfill body without executing backfill', sql.includes('RUN405_BACKFILL_DEFINITION') && !/\b(SELECT|PERFORM)\s+public\.gh_earnings_testnet_registration_bonus_backfill\s*\(/i.test(executable))
test('RUN437 does not invoke business, wallet, or payment RPCs', !/\b(SELECT|PERFORM)\s+public\.(ghc_|gh_pi_|gh_community_invitation_(create|respond))/i.test(executable))
console.log(`RUN437 Phase 3 reconciliation pack: ${pass}/${pass + fail} passed`)
if (fail) process.exit(1)
