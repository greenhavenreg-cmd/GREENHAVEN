#!/usr/bin/env node
/** RUN373: prevent Pi SDK bridge origins from being misclassified as Developer Sandbox. */
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const runtime = read('lib/pi-runtime.ts')
const framePolicy = read('lib/pi-frame-classification.ts')
const context = read('contexts/pi-auth-context.tsx')
const checks = [
  ['Sandbox referrer classifier is an explicit, reusable pure function', /export function isTrustedPiSandboxReferrerHost\(referrerHost: string\): boolean/.test(framePolicy)],
  ['Only exact sandbox.minepi.com host is trusted', /referrerHost\.trim\(\)\.toLowerCase\(\) === "sandbox\.minepi\.com"/.test(framePolicy)],
  ['app-cdn.minepi.com is explicitly documented as a bridge host, not Sandbox proof', /app-cdn\.minepi\.com[\s\S]{0,40}Pi SDK\/bridge host[\s\S]{0,100}not proof of Developer[\s\S]{0,40}Sandbox framing/.test(framePolicy)],
  ['Pi SDK bridge host is not accepted as a Sandbox referrer', !/referrerHost\s*===\s*"app-cdn\.minepi\.com"/.test(runtime)],
  ['Sandbox classification still requires Testnet mode and iframe framing', /if \(typeof window === "undefined" \|\| !getPiSandbox\(\)\) return false[\s\S]*?window\.self !== window\.top[\s\S]*?isTrustedPiSandboxReferrerHost\(referrerHost\)/.test(runtime)],
  ['Unrecognised Pi-hosted frames take the parent-credentials path', /const sandboxFrame = isPiDirectAuthFrame\(\)[\s\S]*?const parentCredentials = sandboxFrame \? null : await requestParentCredentials\(\)/.test(context) && /return isPiSandboxFrame\(\) \|\| isPiAppCdnFrame\(\)/.test(runtime)],
  ['Sandbox classification is still exact-host only; app-cdn is a separate direct-auth frame kind', /Pi Developer Sandbox is not the legacy App Studio parent bridge/.test(context) && /return framed && isTrustedPiSandboxReferrerHost\(referrerHost\)/.test(runtime)],
  ['Server-side Pi token verification remains mandatory after either auth path', /fetch\("\/api\/auth\/pi"[\s\S]*?accessToken/.test(context) && /verifyPiAccessTokenDetailed\(accessToken\)/.test(read('app/api/auth/pi/route.ts'))],
  ['No local authentication fallback is enabled by frame classification', /if \(host\.endsWith\("\.vercel\.app"\)\) return false/.test(read('lib/system-config.ts'))],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRUN373 Pi Sandbox frame classification: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
