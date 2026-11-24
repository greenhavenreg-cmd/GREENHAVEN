#!/usr/bin/env node
/** RUN342 historical scope regression, updated for RUN380's universal Pioneer gate. */
import { readFileSync } from 'node:fs'
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const auth = read('contexts/pi-auth-context.tsx')
const wallet = read('lib/client/pi-wallet-consent.ts')
const policy = read('lib/routing/public-route-policy.ts')
const wrapper = read('components/app-wrapper.tsx')
const registry = read('lib/navigation/service-registry.ts')
const release = read('lib/server/ecosystem/service-release.ts')
const checks = []
const test = (name, ok) => { checks.push(Boolean(ok)); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`) }
test('baseline Pi sign-in requests username and payments scopes', /piAuthenticateOfficial\(\["username",\s*"payments"\]\)/.test(auth))
test('wallet permission is requested only inside explicit wallet-consent flow', /piAuthenticateOfficial\(\["wallet_address"\]\)/.test(wallet))
test('research share links are no longer public', !policy.includes('^\\/r\\/'))
test('field desk and field reporting routes are no longer public', !policy.includes('path === "/field"'))
test('coming-soon services are non-interactive and have no destination', /COMING_SOON/.test(registry) && /destination: \{ kind: "none" \}/.test(registry) && /isInteractiveStatus\(service\.status\)/.test(release))
test('service routes mount Pi auth shell', wrapper.includes('<PiAuthProvider>') && wrapper.includes('<IdentityProvider>'))
const failed = checks.filter(Boolean).length !== checks.length
console.log(`\nRUN342 Pi auth scope isolation: ${checks.filter(Boolean).length}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
