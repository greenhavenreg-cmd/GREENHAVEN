import fs from 'node:fs'
import assert from 'node:assert/strict'

const screenPath = 'components/ghc/rewards-centre-screen.tsx'
const screen = fs.readFileSync(screenPath, 'utf8')
const checks = [
  ['rewards summary has an accessible heading', /aria-labelledby="rewards-balance-summary-title"/.test(screen) && /id="rewards-balance-summary-title"/.test(screen)],
  ['available balance is sourced from server economy snapshot', /displayEconomy\.available == null \? "—" : formatGhc\(displayEconomy\.available\)/.test(screen)],
  ['pending balance is sourced from server economy snapshot', /displayEconomy\.pending == null \? "—" : formatGhc\(displayEconomy\.pending\)/.test(screen)],
  ['locked balance is sourced from server economy snapshot', /displayEconomy\.locked == null \? "—" : formatGhc\(displayEconomy\.locked\)/.test(screen)],
  ['unknown balances are not presented as zero', /displayEconomy\.(available|pending|locked) == null \? "—"/.test(screen)],
  ['pending and locked funds are explicitly described as not spendable', /Pending and locked are not spendable/.test(screen)],
  ['history action opens existing history tab', /onClick=\{\(\) => setTab\("history"\)\}/.test(screen)],
  ['history action has visible keyboard focus', /focus-visible:ring-emerald-600/.test(screen)],
  ['summary separates claim-ready and under-review reward records without treating them as ledger credits', /Locally marked claim-ready/.test(screen) && /Under review \/ maturity/.test(screen) && /Needs server claim/.test(screen) && /Credits post after server confirmation/.test(screen)],
]
let failed = 0
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`)
  if (!passed) failed++
}
assert.equal(failed, 0, `${failed} wallet rewards transparency checks failed`)
console.log(`Wallet Rewards Phase 3 checks: ${checks.length}/${checks.length} passed`)
