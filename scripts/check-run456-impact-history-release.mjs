#!/usr/bin/env node
/** RUN456: expose the completed read-only impact history without releasing donations. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(path, 'utf8')
const registry = read('lib/navigation/service-registry.ts')
const ecosystem = read('components/ghc/greenhaven-ecosystem-screen.tsx')
const route = read('app/api/ecosystem/charity/summary/route.ts')
const screen = read('components/ghc/charity-impact-screen.tsx')
const charityGate = read('scripts/check-charity-impact-release-gate.mjs')
const checks = [
  ['Impact History has a distinct active registry entry and focus destination', /id: "impact-history"[\s\S]{0,260}status: "ACTIVE"[\s\S]{0,150}destination: \{ kind: "focus", serviceId: "impact-history" \}/.test(registry)],
  ['directory selection opens the existing read-only impact screen', /service.id === "events" \|\| service.id === "services-ip" \|\| service.id === "impact-history"/.test(ecosystem) && /focusId === "impact-history"[\s\S]{0,120}CharityImpactScreen/.test(ecosystem)],
  ['summary API gates on Impact History before authentication and ledger access', route.indexOf('getEcosystemServiceAccess("impact-history")') >= 0 && route.indexOf('getEcosystemServiceAccess("impact-history")') < route.indexOf('const auth = await resolveAuthenticatedUser') && route.indexOf('getEcosystemServiceAccess("impact-history")') < route.indexOf('const raw = await getCharityUserSummary')],
  ['summary remains authenticated, durably rate-limited and user-scoped', /resolveAuthenticatedUser/.test(route) && /checkDurableRateLimit/.test(route) && /onUnavailable: "deny"/.test(route) && /raw as Record<string, unknown>\)\.userId !== auth\.userId/.test(route)],
  ['history screen only displays server-confirmed durable records and exposes no payment action', /payload\.durable !== true/.test(screen) && /item\.amountAtomic/.test(screen) && !/onDonate|onPayment|createPayment|checkout/i.test(screen)],
  ['donation-capable Charity remains Coming Soon', /id: "charity"[\s\S]{0,220}status: "COMING_SOON"[\s\S]{0,120}destination: \{ kind: "none" \}/.test(registry)],
  ['existing charity ledger remains segregated and non-withdrawable', /withdrawable: false/.test(read('lib/ecosystem/charity-impact.ts')) && /segregated: true/.test(read('lib/ecosystem/charity-impact.ts'))],
  ['legacy charity release gate still enforces the separate read-only boundary', /read-only Impact History is a separate active service/.test(charityGate) && /Donation-capable Charity remains Coming Soon/.test(charityGate)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN456 Impact History release: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
