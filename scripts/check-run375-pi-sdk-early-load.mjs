#!/usr/bin/env node
/** RUN375: Pi SDK loads before hydration on authenticated routes; public routes stay Pi-free. */
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const layout = read('app/layout.tsx')
const loader = read('lib/pi-sdk-early-loader.ts')
const policy = read('lib/routing/public-route-policy.ts')
const runtime = read('lib/pi-runtime.ts')
const checks = [
  ['Layout installs the early loader in <head>', /<head>[\s\S]*?<script dangerouslySetInnerHTML=\{\{ __html: PI_SDK_EARLY_LOADER \}\} \/>/.test(layout)],
  ['Layout builds the loader from the shared SDK URL and the shared public-route prefixes', /buildPiSdkEarlyLoaderScript\(PI_NETWORK_CONFIG\.SDK_URL, PUBLIC_PREFIX_ROUTES\)/.test(layout)],
  ['Public-route prefixes are exported from the single policy module', /export const PUBLIC_PREFIX_ROUTES/.test(policy)],
  ['Loader skips public routes, existing window.Pi and an existing script tag', /if\(pub\)return/.test(loader) && /if\(window\.Pi\)return/.test(loader) && /document\.querySelector/.test(loader)],
  ['Loader injects an ordered (async=false) script', /s\.async=false/.test(loader)],
  ['Root layout still has no hard-coded SDK URL or next/script (public boundary contract intact)', !layout.includes('sdk.minepi.com/pi-sdk.js') && !layout.includes('next/script')],
  ['Runtime still waits for an already-present SDK script instead of injecting a second copy', /waitForPi\(timeoutMs, 150\)/.test(runtime)],
  ['Pi.init sandbox flag is unchanged (no Mainnet flip)', /sandbox: getPiSandbox\(\)/.test(runtime) && !/sandbox:\s*false/.test(runtime)],
]
let failed = 0
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++ }
console.log(`\nRUN375 early Pi SDK load: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
