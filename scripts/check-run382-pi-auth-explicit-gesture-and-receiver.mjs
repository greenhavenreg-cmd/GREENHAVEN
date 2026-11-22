#!/usr/bin/env node
/** RUN382: Pi auth is tap-only and SDK bridge methods retain their receiver. */
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const context = read('contexts/pi-auth-context.tsx')
const runtime = read('lib/pi-runtime.ts')
const button = read('components/auth/sign-in-with-pi-button.tsx')
const route = read('app/api/auth/pi/route.ts')
const effectStart = context.indexOf('  useEffect(() => {\n    // Mount is preparation only.')
const effectEnd = context.indexOf('\n  const signOut = () => {', effectStart)
if (effectStart < 0 || effectEnd <= effectStart) throw new Error('Mount effect boundaries must exist')
const mountEffect = context.slice(effectStart, effectEnd)
const checks = [
  ['Page mount never invokes the auth initializer', !/\binitialize\s*\(/.test(mountEffect)],
  ['Page mount may initialize the Pi SDK but never calls Pi.authenticate', /ensurePiInitialized\(\)/.test(mountEffect) && !/piAuthenticateOfficial|officialPiAuthenticate|\.authenticate\s*\(/.test(mountEffect)],
  ['Mount messaging requires an explicit Sign in with Pi action', /Tap Sign in with Pi/.test(mountEffect)],
  ['Pi.init is invoked with the Pi SDK object as receiver', /\(Pi\.init as[\s\S]*?\)\.call\(Pi,/.test(runtime)],
  ['Pi.authenticate is invoked with the Pi SDK object as receiver', /authenticate\.call\(Pi, scopes,/.test(runtime)],
  ['Pi sign-in button delegates to the explicit provider retry action', /onClick=\{\(\) => void onClick\(\)\}/.test(button) && /await reinitialize\(\)/.test(button)],
  ['Server-side Pi token verification remains mandatory', /verifyPiAccessTokenDetailed\(accessToken\)/.test(route)],
  ['Pi identity remains username-only in the normal sign-in path', /piAuthenticateOfficial\(\["username"\]\)/.test(context)],
  ['Single-flight guard and bounded auth timeout remain in place', /authAttemptRef\.current/.test(context) && /authTimeoutMs = 25000/.test(runtime)],
]
let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`)
  if (!ok) failed++
}
console.log(`\nRUN382 explicit-gesture / receiver regression: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
