#!/usr/bin/env node
/** RUN374: app-cdn direct-auth routing, no Mainnet flip, and raw-rejection field evidence. */
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const runtime = read('lib/pi-runtime.ts')
const policy = read('lib/pi-frame-classification.ts')
const ctx = read('contexts/pi-auth-context.tsx')
const checks = [
  ['app-cdn host predicate is exact-match only', /referrerHost\.trim\(\)\.toLowerCase\(\) === "app-cdn\.minepi\.com"/.test(policy)],
  ['app-cdn is never classified as Developer Sandbox', !/isPiSandboxFrame[\s\S]{0,600}isPiAppCdnReferrerHost/.test(runtime.split('export function isPiAppCdnFrame')[0].split('export function isPiSandboxFrame')[1] || '')],
  ['Direct-auth routing covers Sandbox and app-cdn only', /isPiSandboxFrame\(\) \|\| isPiAppCdnFrame\(\)/.test(runtime)],
  ['Auth routing skips the parent probe via the direct-auth predicate', /isPiDirectAuthFrame\(\)[\s\S]*?sandboxFrame \? null : await requestParentCredentials\(\)/.test(ctx)],
  ['Pi.init sandbox flag still comes from the single resolver (no Mainnet flip)', /sandbox: getPiSandbox\(\)/.test(runtime) && !/sandbox:\s*false/.test(runtime)],
  ['Rejection shape diagnostic records names and types only', /getOwnPropertyNames/.test(runtime) && /rejectionShape: getPiRejectionShape\(err\)/.test(runtime) && !/JSON\.stringify\(err/.test(runtime)],
  ['Frame context diagnostic is emitted before authenticate', runtime.indexOf('PI_AUTH_FRAME_CONTEXT') > 0 && runtime.indexOf('PI_AUTH_FRAME_CONTEXT') < runtime.indexOf('PI_AUTH_INVOKE_CONTEXT')],
  ['Diagnostic report includes appCdnFrame and ancestorHosts', /appCdnFrame=\$\{snap\.appCdnFrame\} ancestorHosts=\$\{snap\.ancestorHosts\}/.test(runtime)],
  ['Server-side token verification remains mandatory', /fetch\("\/api\/auth\/pi"[\s\S]*?accessToken/.test(ctx)],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRUN374 Pi auth field evidence: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
