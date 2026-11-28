import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8')
const pkg = JSON.parse(read('package.json'))
const app = read('components/ghc/app.tsx')
const css = read('app/globals.css')
const checks = [
  ['all full-screen app branches use the shared app shell', (app.match(/className="gh-app-shell flex h-dvh/g) || []).length >= 5],
  ['shared shell provides legacy viewport fallback before dynamic viewport sizing', /\.gh-app-shell\s*\{[^}]*height:\s*100vh;[^}]*height:\s*100dvh;/s.test(css)],
  ['unsupported dynamic viewport browsers retain a bounded legacy viewport', /@supports not \(height:\s*100dvh\)[\s\S]*?\.gh-app-shell\s*\{\s*max-height:\s*100vh;/m.test(css)],
  ['nested shell panels retain min-height zero for flex scrolling', /\.gh-app-shell\s*\{[^}]*min-height:\s*0;/s.test(css)],
  ['bottom navigation keeps minimum 48px touch targets', /\.gh-bottom-nav\s*>\s*div\s*>\s*button\s*\{[^}]*min-height:\s*3rem;/s.test(css)],
  ['navigation exposes the active destination to assistive technology', /aria-current=\{isActive\s*\?\s*"page"\s*:\s*undefined\}/.test(app)],
  ...['prebuild:checks','verify:static'].map((key) => [`${key} registers RUN453 exactly once`, (pkg.scripts[key].match(/check-run453-shell-viewport-navigation\.mjs/g) || []).length === 1]),
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`); if (!ok) failed++ }
if (failed) process.exit(1)
console.log(`RUN453: ${checks.length}/${checks.length} passed`)
