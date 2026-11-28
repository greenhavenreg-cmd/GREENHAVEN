import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8')
const pkg = JSON.parse(read('package.json'))
const hub = read('components/ghc/create-hub-sheet.tsx')
const feed = read('components/ghc/enhanced-feed-screen.tsx')
const css = read('app/globals.css')
const checks = [
  ['Create hub exposes an Others menu', /Others/.test(hub) && /setShowOthers\(true\)/.test(hub)],
  ['Others includes drafts and creator activity shortcuts', /id: "drafts"/.test(hub) && /id: "activity"/.test(hub)],
  ['saved posts shortcut is routed to the account-owned saved feed', /ghc:open-saved-posts/.test(hub) && /ghc:navigate-tab/.test(hub) && /IdentityService\.getCurrentUserId\(\) !== feedPreferenceOwnerId/.test(feed)],
  ['story shortcut reuses the existing story creator', /ghc:open-story-creator/.test(hub)],
  ['Create sheet has a bounded independently scrollable mobile viewport', /max-h-\[min\(90dvh,44rem\)\]/.test(hub) && /overflow-y-auto overscroll-contain/.test(hub)],
  ['app scroll roots retain native vertical momentum without scripted smooth scrolling', /-webkit-overflow-scrolling: touch/.test(css) && /touch-action: pan-y pinch-zoom/.test(css) && /scroll-behavior: auto/.test(css)],
  ['RUN452 gate is registered exactly once in both quality pipelines', ['prebuild:checks','verify:static'].every((key) => (pkg.scripts[key].match(/check-run452-create-others-scroll\.mjs/g) || []).length === 1)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`); if (!ok) failed++ }
if (failed) process.exit(1)
console.log(`RUN452: ${checks.length}/${checks.length} passed`)
