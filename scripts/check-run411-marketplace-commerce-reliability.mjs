#!/usr/bin/env node
import fs from 'node:fs'
const read = (path) => fs.readFileSync(path, 'utf8')
const screen = read('components/ghc/marketplace-screen.tsx')
const cart = read('lib/marketplace/cart.ts')
const pkg = JSON.parse(read('package.json'))
const lock = JSON.parse(read('package-lock.json'))
const checks = [
  ['saved listings expose loading, ready and unavailable states', /savedLoadState, setSavedLoadState/.test(screen) && /setSavedLoadState\("ready"\)/.test(screen) && /setSavedLoadState\("unavailable"\)/.test(screen)],
  ['saved listing failure is not rendered as an empty saved list', /data-testid="marketplace-saved-unavailable"/.test(screen) && /Retry saved listings/.test(screen) && /savedLoadState === "ready" \? <EmptyState title="Nothing saved yet"/.test(screen)],
  ['order history failure has a retry path and no false empty state', /data-testid="marketplace-orders-unavailable"/.test(screen) && /Retry orders/.test(screen) && /orders.length === 0 && ordersLoadState === "ready"/.test(screen)],
  ['stale orders are labelled when refresh fails', /data-testid="marketplace-orders-stale"/.test(screen)],
  ['local/demo order fallback is not used for durable orders', !/else if \(domain\?\.getOrders\)/.test(screen) && /const outcomeOrders = useMemo\(\(\) => durableOrders/.test(screen)],
  ['checkout cleanup removes exact successfully reserved line snapshots', /removeMarketplaceCartItemsBySnapshots\(completedLineSnapshots\)/.test(screen)],
  ['cart removal distinguishes variants', /removeMarketplaceCartItem\(listingId: string, variantId\?: string\)/.test(cart) && /onRemove\(item\.listingId, item\.variantId \?\? ""\)/.test(screen)],
  ['checkout cleanup preserves changed cart lines', /removeMarketplaceCartItemsBySnapshots/.test(cart) && /current\.quantity !== snapshot\.quantity/.test(cart) && /current\.addedAt !== snapshot\.addedAt/.test(cart)],
  ['partial checkout removes already-paid GHC lines but preserves unpaid recovery lines', /if \(paidGhcIds\.length\)/.test(screen) && /const paidLines = created\.filter\(\(\{ id \}\) => paidGhcIds\.includes\(id\)\)/.test(screen) && /removeMarketplaceCartItemsBySnapshots\(paidLines\.map\(\(\{ item \}\) => item\)\)/.test(screen)],
  ['package and lock versions are synchronized', typeof pkg.version === 'string' && pkg.version.length > 0 && lock.version === pkg.version && lock.packages?.['']?.version === pkg.version],
  ['release metadata matches candidate version', read('lib/app-release.ts').includes(`APP_RELEASE_VERSION = "${pkg.version}"`)],
  ['run 411 check is registered in static and prebuild gates', pkg.scripts['verify:static'].includes('check-run411-marketplace-commerce-reliability.mjs') && pkg.scripts['prebuild:checks'].includes('check-run411-marketplace-commerce-reliability.mjs')],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRun 411 marketplace commerce reliability: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
