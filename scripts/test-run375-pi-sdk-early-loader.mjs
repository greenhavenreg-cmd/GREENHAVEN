#!/usr/bin/env node
/** RUN375 executable test: the early loader injects the Pi SDK on every non-public route and none on public routes. */
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { buildPiSdkEarlyLoaderScript } from '../lib/pi-sdk-early-loader.ts'
import { PUBLIC_PREFIX_ROUTES, isPublicRoutePath } from '../lib/routing/public-route-policy.ts'

const SDK = 'https://sdk.minepi.com/pi-sdk.js'
const code = buildPiSdkEarlyLoaderScript(SDK, PUBLIC_PREFIX_ROUTES)
function run(pathname, { hasPi = false, existing = false } = {}) {
  const appended = []
  const head = { appendChild: (n) => appended.push(n) }
  const document = {
    head, documentElement: head,
    querySelector: () => (existing ? {} : null),
    createElement: () => ({}),
  }
  vm.runInNewContext(code, { location: { pathname }, document, window: hasPi ? { Pi: {} } : {} })
  return appended
}
const paths = ['/', '/feed', '/profile', '/wallet', '/field/studio', '/field/admin/x', '/research', '/ecosystem',
  '/field', '/field/', '/r/abc123', '/r/abc123/', '/r/abc/def', '/privacy', '/terms/', '/support', '/portal-setup', '/validation-key.txt']
let n = 0
for (const p of paths) {
  const injected = run(p).length === 1
  assert.equal(injected, !isPublicRoutePath(p) && p !== '/' ? true : p === '/' ? true : false, `route ${p}`)
  console.log(`PASS ${p} => ${injected ? 'SDK injected' : 'no SDK (public)'}`); n++
}
const s = run('/feed')[0]
assert.equal(s.src, SDK); assert.equal(s.async, false); console.log('PASS injected script uses exact SDK URL, ordered (async=false)'); n++
assert.equal(run('/feed', { hasPi: true }).length, 0); console.log('PASS no duplicate when window.Pi exists'); n++
assert.equal(run('/feed', { existing: true }).length, 0); console.log('PASS no duplicate when script tag already present'); n++
console.log(`\nRUN375 early SDK loader: ${n}/${n} passed`)
