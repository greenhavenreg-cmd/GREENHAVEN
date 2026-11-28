#!/usr/bin/env node
/** RUN455: release the existing authenticated community Events discovery workflow. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(path, 'utf8')
const registry = read('lib/navigation/service-registry.ts')
const ecosystem = read('components/ghc/greenhaven-ecosystem-screen.tsx')
const navigation = read('lib/navigation/navigate.ts')
const api = read('app/api/ecosystem/events/route.ts')
const platform = read('app/api/communities/[id]/platform/route.ts')
const gate = read('scripts/check-events-discovery-release-gate.mjs')
const servicesGate = read('scripts/check-services-directory-release-gate.mjs')
const pkg = JSON.parse(read('package.json'))
const checks = [
  ['Events registry is active and routes to its canonical focus destination', /id: "events"[\s\S]{0,260}status: "ACTIVE"[\s\S]{0,140}destination: \{ kind: "focus", serviceId: "events" \}/.test(registry)],
  ['Ecosystem mounts the existing Events discovery screen with a back action', /EventsDiscoveryScreen/.test(ecosystem) && /focusId === "events"/.test(ecosystem) && /onBack=\{\(\) => setFocusId\(null\)\}/.test(ecosystem)],
  ['Selecting Events from the directory opens the in-place screen', /service\.id === "events" \|\| service\.id === "services-ip"[\s\S]{0,100}setFocusId\(service\.id\)/.test(ecosystem)],
  ['Canonical openService navigation resolves the Events focus destination', /if \(dest\.kind === "focus"\)[\s\S]{0,100}navigateTo\("ecosystem", \{ focus: dest\.serviceId \}\)/.test(navigation)],
  ['Events API enforces release gate before auth and data access', api.indexOf('getEcosystemServiceAccess("events")') >= 0 && api.indexOf('getEcosystemServiceAccess("events")') < api.indexOf('const auth = await resolveAuthenticatedUser')],
  ['Events API uses authenticated, rate-limited server-side reads', /resolveAuthenticatedUser/.test(api) && /checkDurableRateLimit/.test(api) && /socialRest</.test(api)],
  ['RSVP uses the existing authenticated community platform action', /gh_community_event_rsvp/.test(platform) && /action: "event_rsvp"/.test(ecosystem + read('components/ghc/events-discovery-screen.tsx'))],
  ['Event visibility preserves private-community membership checks', /privacy !== "public" && !activeMemberships\.has\(communityId\)/.test(read('lib/ecosystem/events-discovery.ts'))],
  ['Services directory is released and mounted with canonical Marketplace listing handoff', /id: "services-ip"[\s\S]{0,260}status: "ACTIVE"[\s\S]{0,140}destination: \{ kind: "focus", serviceId: "services-ip" \}/.test(registry) && /ServicesDirectoryScreen/.test(ecosystem) && /navigateTo\("marketplace", \{ listingId \}\)/.test(ecosystem)],
  ['Services directory retains durable active-listing and no-fabricated-checkout boundaries', /payload\.durable !== true/.test(read('components/ghc/services-directory-screen.tsx')) && /row\.kind !== "service" \|\| row\.status !== "active"/.test(read('lib/ecosystem/services-directory.ts')) && !/checkout|paymentIntent|createOrder/i.test(read('components/ghc/services-directory-screen.tsx'))],
  ['Services release-boundary contract asserts active and mounted state', /Services is released as an active service/.test(servicesGate) && /Services directory is mounted/.test(servicesGate)],
  ['Donation-capable Charity remains gated while the separate read-only Impact History can be released', /id: "charity"[\s\S]{0,220}status: "COMING_SOON"[\s\S]{0,120}destination: \{ kind: "none" \}/.test(registry) && /id: "impact-history"[\s\S]{0,260}status: "ACTIVE"/.test(registry)],
  ['Events release-boundary contract is registered in both quality pipelines', ['verify:static', 'prebuild:checks'].every((key) => (pkg.scripts[key].match(/check-events-discovery-release-gate\.mjs/g) || []).length === 1)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN455 Events and Services unblocks: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
