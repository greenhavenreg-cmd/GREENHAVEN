#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const root = process.cwd()
const read = (p) => readFileSync(join(root, p), 'utf8')
const pkg = JSON.parse(read('package.json'))
const css = read('app/gh-executive-premium.css')
const layout = read('app/layout.tsx')
const scripts = pkg.scripts
const checks = [
  ['executive premium stylesheet exists', existsSync(join(root, 'app/gh-executive-premium.css'))],
  ['new visual layer loads after the established premium layer', layout.indexOf('gh-premium-overhaul.css') >= 0 && layout.indexOf('gh-executive-premium.css') > layout.indexOf('gh-premium-overhaul.css')],
  ['light and dark themes receive separate executive tokens', /:root\s*\{[\s\S]*--gh-exec-surface/.test(css) && /\.dark\s*\{[\s\S]*--gh-exec-shadow-hover/.test(css)],
  ['styling is scoped to explicit modules and known GreenHaven shell classes', /\[data-gh-module\]/.test(css) && /\.gh-page-chrome/.test(css)],
  ['focus, touch, responsive and reduced-motion rules are present', /:focus-visible/.test(css) && /touch-action:\s*manipulation/.test(css) && /max-width:\s*480px/.test(css) && /prefers-reduced-motion:\s*reduce/.test(css)],
  ['financial and API behavior is not changed by the visual stylesheet', !/fetch\(|\/api\/|PI_A2U|withdraw|supabase/i.test(css)],
  ['candidate package and in-app release version match', typeof pkg.version === 'string' && pkg.version.length > 0 && read('lib/app-release.ts').includes(`APP_RELEASE_VERSION = "${pkg.version}"`)],
  ['focused check is registered in static and prebuild verification', scripts['verify:static'].includes('check-run409-executive-premium.mjs') && scripts['prebuild:checks'].includes('check-run409-executive-premium.mjs')],
  ['audit report and worklog record the release limitations', /Production remains \*\*NOT APPROVED\*\*/.test(read('docs/RUN409-EXECUTIVE-PREMIUM-UI-AUDIT-2026-11-25.md')) && /no GitHub push/i.test(read('docs/UPGRADE-WORKLOG-0.338.134.md'))],
]
let failed = 0
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failed++ }
console.log(`\nRun 409 executive premium source check: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
