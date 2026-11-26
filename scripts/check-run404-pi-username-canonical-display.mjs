import fs from 'node:fs'

const hero = fs.readFileSync('components/ghc/profile-hero.tsx', 'utf8')
const profile = fs.readFileSync('components/ghc/profile-screen.tsx', 'utf8')
const checks = [
  ['profile hero preserves the verified Pi username casing', hero.includes('return canonical ? `@${canonical}` : "Pi username not linked"')],
  ['profile hero does not synthesize a handle from displayName', !hero.includes('toHandle(displayName, username)') && !hero.includes('const base = (displayName || "member")')],
  ['profile screen preserves the verified Pi username casing', profile.includes('return canonical ? `@${canonical}` : "Pi username not linked"')],
  ['profile screen does not synthesize a handle from display name', !profile.includes('const base = (name || "member")')],
  ['GH identifier remains separately labeled as an ID', hero.includes('GreenHaven ID')],
]
let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (!ok) failed++
}
console.log(`RUN404: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
