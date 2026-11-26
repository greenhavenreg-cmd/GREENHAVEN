#!/usr/bin/env node
/** RUN424 — wallet reservation arithmetic and partitioned session-cookie clearing. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8')
const route = read('app/api/economy/withdrawals/route.ts')
const db = read('lib/server/economy/db.ts')
const session = read('lib/server/identity/session-store.ts')
const pkg = JSON.parse(read('package.json'))
const release = read('lib/app-release.ts')
const lock = JSON.parse(read('package-lock.json'))
const issuance = session.slice(session.indexOf('export function buildSessionCookieHeader'), session.indexOf('export function buildClearSessionCookieHeader'))
const clearing = session.slice(session.indexOf('export function buildClearSessionCookieHeader'), session.indexOf('/**\n * Extract session token'))
const checks = [
  ['withdrawal quote uses posted ledger balance, not already-spendable balance', /const ledgerBalance = Number\(snap\?\.ledgerBalance\)/.test(route) && /getWithdrawalQuote\(ledgerBalance, locked\)/.test(route) && !/getWithdrawalQuote\(balance, locked\)/.test(route)],
  ['withdrawal quote refuses reservations exceeding posted ledger', /WALLET_LOCK_RECONCILIATION_REQUIRED/.test(route) && /locked > ledgerBalance/.test(route)],
  ['wallet snapshot requires explicit ledgerBalance instead of substituting spendable balance', /Number\(data\[key\]\)/.test(db) && !/key === "ledgerBalance" \? data\.balance/.test(db)],
  ['production session cookie uses Secure and Partitioned', /if \(isProd\) parts\.push\("Secure", "Partitioned"\)/.test(issuance)],
  ['production clear-cookie matches Secure and Partitioned attributes', /if \(isProd\) parts\.push\("Secure", "Partitioned"\)/.test(clearing)],
  ['package, lockfile and in-app release versions agree', pkg.version === lock.version && lock.packages?.['']?.version === pkg.version && release.includes(`APP_RELEASE_VERSION = \"${pkg.version}\"`)],
  ['RUN424 regression gate is part of prebuild', pkg.scripts?.['prebuild:checks']?.includes('check-run424-wallet-session-integrity.mjs')],
  ['RUN424 regression gate is part of static verification', pkg.scripts?.['verify:static']?.includes('check-run424-wallet-session-integrity.mjs')],
]
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
const failed = checks.filter(([, ok]) => !ok)
console.log(`\nRUN424 wallet/session integrity: ${checks.length - failed.length}/${checks.length} passed`)
if (failed.length) process.exit(1)
