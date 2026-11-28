import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const registry = readFileSync('lib/navigation/service-registry.ts', 'utf8')
const navigation = readFileSync('lib/navigation/navigate.ts', 'utf8')
const marketplace = readFileSync('components/ghc/marketplace-screen.tsx', 'utf8')
const checks = [
  ['Seller Centre is released as an active ecosystem service', /id: "seller-centre"[\s\S]*?status: "ACTIVE"/.test(registry)],
  ['Seller Centre routes into the canonical Marketplace overlay', /id: "seller-centre"[\s\S]*?destination: \{ kind: "overlay", overlay: "marketplace" \}/.test(registry)],
  ['Seller Centre opens the existing owner-scoped listings bucket', /service\.id === "seller-centre"[\s\S]*?marketplaceBucket: "mine"/.test(navigation)],
  ['Marketplace accepts the mine bucket from navigation events', /bucketNext === "sell" \|\| bucketNext === "mine"/.test(marketplace)],
  ['Seller Centre command centre is mounted in the mine bucket', /bucket === "mine"[\s\S]*?<SellerCommandCenter/.test(marketplace)],
  ['Seller Centre actions use existing durable listing and order loaders', /onRefresh=\{\(\) => \{ void loadMineListings\(\); void loadDurableOrders\(\) \}\}/.test(marketplace)],
]
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) process.exitCode = 1 }
console.log(`RUN454 Seller Centre release: ${checks.filter(([, ok]) => ok).length}/${checks.length} passed`)
assert.ok(checks.every(([, ok]) => ok))
