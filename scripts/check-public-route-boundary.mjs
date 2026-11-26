#!/usr/bin/env node
/** RUN380 regression: no research or field service route bypasses Pi auth. */
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const policy = read('lib/routing/public-route-policy.ts')
const wrapper = read('components/app-wrapper.tsx')
const middleware = read('middleware.ts')
const checks = [
  ['only legal/help, referral landing and validation resources are public', policy.includes('\"/join\"') && !policy.includes('"/portal-setup"') && !policy.includes('^\\/r\\/') && !policy.includes('path === "/field"')],
  ['research share pages are not public', !policy.includes('^\\/r\\/')],
  ['field pages are not public', !policy.includes('path === "/field"')],
  ['all non-public pages mount authenticated shell', wrapper.includes('isPublicRoutePath(pathname)') && wrapper.includes('<AuthenticatedRouteShell>')],
  ['page middleware requires GH session cookie before service render', middleware.includes('request.cookies.get("gh_session")') && middleware.includes('!isPublicRoutePath(path)')],
  ['durable account-security gate checks session-store durability', read('lib/server/identity/auth-integrity.ts').includes('export async function requireAccountSecurityContext') && read('lib/server/identity/auth-integrity.ts').includes('requireDurableSessionStore()')],
  ['field reporter remains available inside authenticated app shell', read('app/field/page.tsx').includes('FieldDeskClient') && read('components/field/field-desk-client.tsx').includes('usePiAuth') && read('components/field/field-desk-client.tsx').includes('PIONEER WORKSPACE')],
  ['field unlock endpoint is retired', read('app/api/field/unlock/route.ts').includes('status: 410') && read('app/api/field/unlock/route.ts').includes('PI_AUTHENTICATION_REQUIRED')],
  ['research GET/POST both require durable GH session', (read('app/api/research/public/[slug]/route.ts').match(/requireAccountSecurityContext\(request\.headers\)/g)||[]).length === 2],
  ['research evidence intent requires GH session and Pioneer-scoped key', read('app/api/research/public/[slug]/evidence/intent/route.ts').includes('requireAccountSecurityContext') && read('app/api/research/public/[slug]/evidence/intent/route.ts').includes('researchSubmissionKey')],
  ['research evidence completion requires GH session', read('app/api/research/public/[slug]/evidence/complete/route.ts').includes('requireAccountSecurityContext')],
  ['research exams derive respondent identity server-side', read('app/api/research/public/[slug]/exam/route.ts').includes('researchRespondentHash(access.auth.userId')],
  ['field report requires GH session and server-derived scope', read('app/api/field/report/route.ts').includes('requireAccountSecurityContext') && read('app/api/field/report/route.ts').includes('fieldSessionScopeId')],
  ['field surveys require GH session', read('app/api/field/surveys/route.ts').includes('requireAccountSecurityContext')],
  ['field evidence APIs require GH session', ['intent','complete'].every(x=>read(`app/api/field/reports/[id]/evidence/${x}/route.ts`).includes('requireAccountSecurityContext'))],
  ['field administration requires GH session', read('app/api/field/admin/evidence/route.ts').includes('requireAccountSecurityContext') && read('app/api/field/admin/reports/[id]/evidence/route.ts').includes('requireAccountSecurityContext')],
  ['ecosystem service metadata and fee quotes require durable Pioneer session', [
    'app/api/marketplace/listing-fee/route.ts', 'app/api/communities/create-fee/route.ts',
    'app/api/business/monetization/route.ts', 'app/api/economy/catalog/route.ts',
    'app/api/economy/supply/route.ts', 'app/api/economy/policy/route.ts',
    'app/api/economy/pi-acquisition-policy/route.ts', 'app/api/pi/platform-capabilities/route.ts',
    'app/api/notifications/push/config/route.ts', 'app/api/social/posts/[id]/reward/route.ts',
    'app/api/social/posts/[id]/ghpv/route.ts', 'app/api/public/portal-links/route.ts',
    'app/api/public/compliance-posture/route.ts',
  ].every(path => read(path).includes('requireAccountSecurityContext'))],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed += 1 }
console.log(`\nRUN380 Pi-only research boundary: ${checks.length-failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
