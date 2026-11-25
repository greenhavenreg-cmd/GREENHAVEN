#!/usr/bin/env node
/** RUN379 — token-safe CSP and requested-scope evidence for Pi authentication. */
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const runtime = read('lib/pi-runtime.ts')
const auth = read('contexts/pi-auth-context.tsx')
const route = read('app/api/auth/pi/route.ts')
const pkg = JSON.parse(read('package.json'))
const vercel = JSON.parse(read('vercel.json'))
const csp = vercel.headers?.find((rule) => rule.source === '/(.*)')?.headers?.find((header) => header.key.toLowerCase() === 'content-security-policy')?.value ?? ''
const connectSrc = csp.match(/(?:^|;\s*)connect-src\s+([^;]+)/)?.[1] ?? ''
const checks = []
const test = (name, ok) => { checks.push(Boolean(ok)); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`) }
test('Observed exact Pi auth origin is permitted by connect-src', connectSrc.split(/\s+/).includes('https://socialchain.app'))
test('Unobserved socialchain subdomains are not broadly permitted', !connectSrc.split(/\s+/).includes('https://*.socialchain.app'))
test('CSP violation listener is installed before Pi SDK initialization', /installPiCspDiagnostics\(\)[\s\S]*?if \(!initPromise\)/.test(runtime) || /installPiCspDiagnostics\(\)[\s\S]*?if \(initialized/.test(runtime))
test('CSP evidence records only directive, blocked host and disposition', /securitypolicyviolation/.test(runtime) && /cspDirective: directive/.test(runtime) && /cspBlockedHost: blockedHost/.test(runtime) && /cspDisposition: event\.disposition/.test(runtime))
test('CSP diagnostic report provides concise violation summary', /cspViolations=\$\{history\.filter/.test(runtime))
test('Requested scopes are recorded in invocation and prompt-start diagnostics', /requestedScopes: scopes\.filter/.test(runtime) && /PI_AUTH_PROMPT_START[\s\S]*?requestedScopes/.test(runtime))
test('Scope diagnostics are restricted to known Pi scope names', /username\|payments\|wallet_address/.test(runtime))
test('Normal sign-in still requests username and payments', /piAuthenticateOfficial\(\["username",\s*"payments"\]\)/.test(auth))
test('Server-side Pi access-token verification remains mandatory', /verifyPiAccessTokenDetailed\(accessToken\)/.test(route))
test('RUN379 gate is registered in both prebuild and static verification', ['prebuild:checks', 'verify:static'].every((key) => pkg.scripts[key]?.includes('check-run379-pi-csp-auth-diagnostics.mjs')))
const failed = checks.filter((v) => !v).length
console.log(`\nRUN379 Pi CSP/auth diagnostics: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
