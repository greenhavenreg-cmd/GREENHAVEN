#!/usr/bin/env node
import fs from 'node:fs'
const read = (file) => fs.readFileSync(file, 'utf8')
const route = read('app/api/research/projects/[id]/responses/route.ts')
const studio = read('components/field/research-studio-client.tsx')
const access = read('lib/server/research/access.ts')
const pkg = JSON.parse(read('package.json'))
const checks = [
  ['responses endpoint authenticates every request', /resolveAuthenticatedUser\(request\.headers\)/.test(route)],
  ['response access remains owner/capability scoped', /authorizeResearchProject\(id, auth\.userId, \"responses\.read\"\)/.test(route) && /owner_user_id=eq\./.test(access) && /status=eq\.active/.test(access)],
  ['response cursor is opaque base64url and bounded', /toString\("base64url"\)/.test(route) && /value\.length > 512/.test(route)],
  ['cursor validates timestamp and UUID before query use', /Number\.isFinite\(Date\.parse\(submittedAt\)\)/.test(route) && /UUID\.test\(id\)/.test(route)],
  ['keyset ordering has deterministic timestamp and id tie-breaker', /submitted_at\.desc,id\.desc/.test(route) && /submitted_at\.eq\.\$\{cursor\.submittedAt\},id\.lt\.\$\{cursor\.id\}/.test(route)],
  ['page size is bounded to 100 and fetches one lookahead row', /MAX_PAGE_SIZE = 100/.test(route) && /String\(limit \+ 1\)/.test(route)],
  ['review status filter is allowlisted', /REVIEW_STATES\.has\(status\)/.test(route)],
  ['responses use no-store and bounded server response size', /"Cache-Control": "private, no-store"/.test(route) && /maxResponseBytes: 10 \* 1024 \* 1024/.test(route)],
  ['response page discloses cursor and count metadata', /nextCursor, total, order/.test(route)],
  ['inbox loads a first page and tracks continuation state', /responses\?limit=50/.test(studio) && /setResponseCursor/.test(studio) && /setResponseHasMore/.test(studio)],
  ['load-more appends only unseen response IDs', /known = new Set\(current\.map\(\(row\) => row\.id\)\)/.test(studio) && /!known\.has\(row\.id\)/.test(studio)],
  ['complete CSV traverses every cursor page before creating file', /do \{[\s\S]*?responses\?\$\{params\}[\s\S]*?\} while \(cursor\)/.test(studio)],
  ['CSV export fails closed without creating partial files on retrieval failure', /No partial file was generated/.test(studio) && /if \(!r\.ok \|\| !d\.ok/.test(studio)],
  ['CSV export is bounded to 20,000 records', /allRows\.length > 20_000/.test(studio)],
  ['CSV export retains spreadsheet formula injection protection', /const safe = \^?/.test('') === false && /\^\[\\s\]\*\[=\+@\\-\]/.test(studio)],
  ['inbox offers explicit load-more and full-export states', /Load more responses/.test(studio) && /Export complete CSV/.test(studio)],
  ['RUN386 gate is wired once into static and prebuild checks', (pkg.scripts['verify:static'].match(/check-run386-research-pagination-export\.mjs/g) || []).length === 1 && (pkg.scripts['prebuild:checks'].match(/check-run386-research-pagination-export\.mjs/g) || []).length === 1],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`RUN386 Research pagination & export: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
