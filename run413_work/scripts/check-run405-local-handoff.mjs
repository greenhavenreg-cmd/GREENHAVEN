import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
const release = readFileSync('lib/app-release.ts', 'utf8')
const migration = readFileSync('supabase/migrations/20261125150000_run405_registration_backfill_account_discovery.sql', 'utf8')
const authButton = readFileSync('components/auth/sign-in-with-pi-button.tsx', 'utf8')
const authScreen = readFileSync('components/auth-loading-screen.tsx', 'utf8')
const withdraw = readFileSync('components/ghc/pi-withdraw-sheet.tsx', 'utf8')
const profileHero = readFileSync('components/ghc/profile-hero.tsx', 'utf8')
const polish = readFileSync('app/gh-premium-overhaul.css', 'utf8')
const sourceTruth = readFileSync('docs/SOURCE_OF_TRUTH.md', 'utf8')
const handoff = readFileSync('docs/RUN405-LOCAL-PROJECT-HANDOFF-AND-RECONCILIATION-2026-11-25.md', 'utf8')

const checks = [
  ['package, lockfile and release metadata agree', typeof pkg.version === 'string' && lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && release.includes(`APP_RELEASE_VERSION = "${pkg.version}"`)],
  ['backfill includes all known stable account roots', ['gh_pi_identities','gh_user_profiles','gh_sessions','gh_user_progress','gh_user_achievements','ghc_user_accounts','ghc_transactions','gh_earnings_ledger_entries'].every((t) => migration.includes(`FROM public.${t}`) || migration.includes(`FROM public.${t} WHERE`))],
  ['backfill remains explicit-confirmation, bounded, and idempotent', migration.includes('I_CONFIRM_THIS_IS_THE_INTENDED_TESTNET_PROJECT') && migration.includes('LEAST(GREATEST(COALESCE(p_limit, 250), 1), 500)') && migration.includes('gh_earnings_registration_bonus_claim(v_user)') && migration.includes('REVOKE ALL') && migration.includes('TO service_role')],
  ['migration does not auto-execute credits or rewrite migration history', !/SELECT\s+public\.gh_earnings_testnet_registration_bonus_backfill/i.test(migration) && !/DELETE\s+FROM\s+supabase_migrations\.schema_migrations/i.test(migration) && !/INSERT\s+INTO\s+supabase_migrations\.schema_migrations/i.test(migration)],
  ['sign-in remains one primary action with attempt-aware Try again', authScreen.includes('<SignInWithPiButton label="Sign in" />') && !authScreen.includes('Retry Pi authentication') && authButton.includes('attempted ? "Try again" : label') && authButton.includes('aria-label={busy ? "Connecting securely to Pi" : attempted ? "Try again to sign in" : label}')],
  ['withdrawal retry copy is normalized', !withdraw.includes('Retry Pi authentication') && withdraw.includes('"Try again"')],
  ['Pi username remains canonical and GH ID stays separate', profileHero.includes('String(username || "").trim().replace(/^@/, "") || displayName || "Member"') && profileHero.includes('GreenHaven ID')],
  ['premium styling continues to cover all requested surfaces', ['.gh-world-feed','.gh-world-marketplace','.gh-world-community','[data-gh-module="research"]','.gh-world-messages','.gh-world-discovery','[data-gh-module="cart"]','.gh-world-profile','prefers-reduced-motion: reduce'].every((s) => polish.includes(s))],
  ['handoff explicitly distinguishes local source from live operations', sourceTruth.includes(`Current source version:** \`${pkg.version}\``) && sourceTruth.includes('does not imply a remote push') && handoff.includes('A 100 PI database ledger entry is not an on-chain Pi transfer') && handoff.includes('does not push to GitHub, deploy to Vercel, apply migrations') && handoff.includes('Live migration application')],
  ['Run 405 gate is included once in static and prebuild chains', (pkg.scripts['verify:static'].match(/check-run405-local-handoff\.mjs/g) || []).length === 1 && (pkg.scripts['prebuild:checks'].match(/check-run405-local-handoff\.mjs/g) || []).length === 1],
]
let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (!ok) failed++
}
console.log(`\nRun 405 local handoff: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
