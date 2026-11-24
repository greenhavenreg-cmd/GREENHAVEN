#!/usr/bin/env node
import fs from 'node:fs'

const read = (file) => fs.readFileSync(file, 'utf8')
const studio = read('components/field/research-studio-client.tsx')
const field = read('components/field/field-desk-client.tsx')
const page = read('app/field/studio/page.tsx')
const publicForm = read('components/field/public-research-form.tsx')
const projectApi = read('app/api/research/projects/route.ts')
const packageJson = JSON.parse(read('package.json'))
const responseApi = read('app/api/research/projects/[id]/responses/route.ts')
const checks = [
  ['research dashboard derives portfolio lifecycle counts from loaded projects', /projectCounts = useMemo/.test(studio) && /published: projects\.filter/.test(studio)],
  ['research dashboard supports title, description and type search', /projectSearch/.test(studio) && /project\.title.*project\.description.*project\.project_type/.test(studio)],
  ['research dashboard supports lifecycle status filters', /projectStatusFilter/.test(studio) && /matchesStatus/.test(studio)],
  ['empty filtered result has a clear recovery path', /No matching studies/.test(studio) && /Reset filters/.test(studio)],
  ['share copy explicitly restricts participation to Pi Browser and verified session', /Participation requires Pi Browser and a verified GreenHaven session/.test(studio)],
  ['share messaging instructs respondents to complete Pi sign-in in Pi Browser', /inside Pi Browser and sign in with Pi/.test(studio)],
  ['share link does not promise access from any browser', !/Anyone with the link can respond in a browser/.test(studio)],
  ['CSV export is owner-inbox scoped and exports only loaded responses', /function exportResponsesCsv/.test(studio) && /filteredResponses\.map\(\(response\)/.test(studio) && /up to 200 most recent/.test(studio)],
  ['CSV export neutralizes spreadsheet formula-leading cells', studio.includes("const safe = /^[\\s]*[=+@\\-]/.test(raw)") && studio.includes("safe.replace(/\"/g")],
  ['owner inbox filters responses by status and answer content', /filteredResponses = useMemo/.test(studio) && /answerText/.test(studio) && /responseStatusFilter/.test(studio)],
  ['owner inbox distinguishes empty data from no filter matches', /No responses received yet/.test(studio) && /No matching responses/.test(studio)],
  ['CSV export respects current inbox filters and discloses loaded window', /const rows = filteredResponses\.map/.test(studio) && /latest 200 loaded records/.test(studio)],
  ['RUN385 regression gate is registered exactly once in static and prebuild checks', (packageJson.scripts['verify:static'].match(/check-run385-research-field-upgrade\.mjs/g) || []).length === 1 && (packageJson.scripts['prebuild:checks'].match(/check-run385-research-field-upgrade\.mjs/g) || []).length === 1],
  ['private Research Studio is excluded from search indexing', /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/.test(page)],
  ['field portal shows server session verification state before tools unlock', /checkingSession/.test(field) && /Verifying your Pioneer session/.test(field)],
  ['field portal explains Pi Browser-only participation on auth failure', /Other browsers and unverified sessions cannot participate/.test(field)],
  ['published research API remains owner authenticated', /resolveAuthenticatedUser/.test(projectApi) && /owner_user_id: auth\.userId/.test(projectApi)],
  ['response inbox remains owner checked and bounded', /owner_user_id=eq/.test(responseApi) && /limit=200/.test(responseApi)],
  ['respondent portal still requires server account security context', /requireAccountSecurityContext/.test(read('app/api/research/public/[slug]/route.ts'))],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`RUN385 Research & Field Research upgrade: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
