#!/usr/bin/env node
import fs from 'node:fs'
const read = (file) => fs.readFileSync(file, 'utf8')
const route = read('app/api/research/projects/[id]/analytics/route.ts')
const studio = read('components/field/research-studio-client.tsx')
const pkg = JSON.parse(read('package.json'))
const access = read('lib/server/research/access.ts')
const checks = [
  ['analytics endpoint requires authenticated session', /resolveAuthenticatedUser\(request\.headers\)/.test(route)],
  ['analytics endpoint checks owner/collaborator capability and active membership', /authorizeResearchProject\(id, auth\.userId, \"analytics\.read\"\)/.test(route) && /owner_user_id=eq\./.test(access) && /status=eq\.active/.test(access)],
  ['analytics is rate limited and never cached', /research-analytics:/.test(route) && /private, no-store/.test(route)],
  ['analysis window is frozen at request start', /const asOf = new Date\(\)\.toISOString\(\)/.test(route) && /submitted_at: `lte\.\$\{asOf\}`/.test(route)],
  ['analysis pages use deterministic order and bounded rows', /PAGE_SIZE = 500/.test(route) && /MAX_ROWS = 20_000/.test(route) && /submitted_at\.asc,id\.asc/.test(route)],
  ['numeric summaries include mean median range and population standard deviation', /standardDeviation: Number\(Math\.sqrt\(variance\)/.test(route) && /median\(numbers\)/.test(route) && /Math\.min\(\.\.\.numbers\)/.test(route)],
  ['question-level aggregates and categorical groups below disclosure threshold are suppressed', /MIN_CATEGORY_DISCLOSURE = 5/.test(route) && /count >= MIN_CATEGORY_DISCLOSURE/.test(route) && /answered.length < MIN_CATEGORY_DISCLOSURE/.test(route) && /numbers.length < MIN_CATEGORY_DISCLOSURE/.test(route)],
  ['free-text content is not returned in analytics', /textContentIncluded: false/.test(route) && /freeTextIncluded: false/.test(route)],
  ['coverage identifies bounded samples instead of implying completeness', /coverage: total === null \? "unknown" : rows\.length === total \? "complete" : "bounded_sample"/.test(route) && /truncated:/.test(route)],
  ['analytics response includes review-status and question-level aggregates', /reviewStatus: statusCounts/.test(route) && /questions: questionStats/.test(route)],
  ['studio loads analytics from authenticated project endpoint', /api\/research\/projects\/\$\{activeProject\.id\}\/analytics/.test(studio) && /loadResearchAnalytics/.test(studio)],
  ['studio discloses descriptive statistics and privacy suppression', /Descriptive statistics only/.test(studio) && /low-frequency categories suppressed/.test(studio)],
  ['studio explicitly warns when analytics are bounded', /bounded analysis of the first/.test(studio) && /not presented as complete/.test(studio)],
  ['RUN387 gate is wired once into static and prebuild checks', (pkg.scripts['verify:static'].match(/check-run387-research-analytics\.mjs/g) || []).length === 1 && (pkg.scripts['prebuild:checks'].match(/check-run387-research-analytics\.mjs/g) || []).length === 1],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`RUN387 Research analytics: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
