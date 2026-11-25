#!/usr/bin/env node
import fs from 'node:fs'
const read = (p) => fs.readFileSync(p, 'utf8')
const screen = read('components/ghc/marketplace-screen.tsx')
const pkg = JSON.parse(read('package.json'))
const lock = JSON.parse(read('package-lock.json'))
const checks = [
  ['seller listing load has explicit loading, ready and unavailable states', /mineLoadState, setMineLoadState/.test(screen) && /setMineLoadState\("ready"\)/.test(screen) && /setMineLoadState\("unavailable"\)/.test(screen)],
  ['order load has explicit loading, ready and unavailable states', /ordersLoadState, setOrdersLoadState/.test(screen) && /setOrdersLoadState\("ready"\)/.test(screen) && /setOrdersLoadState\("unavailable"\)/.test(screen)],
  ['seller metrics withhold unverified counts rather than showing false zeroes', /listingsAvailable \? "—" : activeListings/.test(screen) && /ordersAvailable \? "—" : openOrders/.test(screen)],
  ['seller centre shows an actionable unavailable-data state and retry', /data-testid="seller-data-unavailable"/.test(screen) && /onClick=\{onRefresh\}/.test(screen) && /Retry data/.test(screen)],
  ['seller inventory does not claim empty until authoritative response is ready', /data-testid="seller-listings-unavailable"/.test(screen) && /Your listings could not be verified/.test(screen) && /Your storefront is ready for its first listing/.test(screen)],
  ['marketplace section controls expose pressed state and usable touch targets', /aria-pressed=\{bucket === chip\.id\}/.test(screen) && /aria-pressed=\{showCategories && bucket === "browse"\}/.test(screen) && /min-h-10 shrink-0/.test(screen)],
  ['seller center distinguishes listing and order data availability', /listingsAvailable=\{mineLoadState === "ready"\}/.test(screen) && /ordersAvailable=\{ordersLoadState === "ready"\}/.test(screen)],
  ['package and lockfile versions are synchronized', pkg.version === '0.338.136' && lock.version === pkg.version && lock.packages[''].version === pkg.version],
  ['release version matches package version', read('lib/app-release.ts').includes('APP_RELEASE_VERSION = "0.338.136"')],
  ['marketplace maturity check is registered for static and prebuild gates', pkg.scripts['verify:static'].includes('check-run410-marketplace-maturity.mjs') && pkg.scripts['prebuild:checks'].includes('check-run410-marketplace-maturity.mjs')],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRun 410 marketplace maturity check: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
