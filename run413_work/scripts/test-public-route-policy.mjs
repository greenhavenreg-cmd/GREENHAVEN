#!/usr/bin/env node
import { isPublicRoutePath } from '../lib/routing/public-route-policy.ts'
const cases = [
  ['root uses authenticated app shell', '/', false],
  ['privacy remains public', '/privacy', true],
  ['terms remains public', '/terms', true],
  ['support remains public', '/support', true],
  ['validation resource remains public', '/validation-key.txt', true],
  ['research share slug requires Pi authentication', '/r/survey-opaque-slug', false],
  ['research nested path requires Pi authentication', '/r/survey-opaque-slug/edit', false],
  ['field desk requires Pi authentication', '/field', false],
  ['field studio requires Pi authentication', '/field/studio', false],
  ['field admin requires Pi authentication', '/field/admin/evidence', false],
  ['portal setup requires Pi authentication', '/portal-setup', false],
  ['field lookalike requires Pi authentication', '/fielding', false],
]
let failed = 0
for (const [name, path, expected] of cases) {
  const actual = isPublicRoutePath(path)
  const ok = actual === expected
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${path} => ${actual}`)
  if (!ok) failed += 1
}
console.log(`\nPi-only route policy: ${cases.length - failed}/${cases.length} passed`)
process.exit(failed ? 1 : 0)
