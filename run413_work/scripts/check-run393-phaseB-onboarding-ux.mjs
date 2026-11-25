import fs from 'node:fs'
import assert from 'node:assert/strict'
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const ui = read('components/ghc/onboarding.tsx')
const gate = read('lib/onboarding-local.ts')
const completion = read('app/api/auth/onboarding-complete/route.ts')

// Profile enrichment fields are optional and only validated when supplied.
assert.match(ui, /Names, birth date, gender and location enrich the profile/ )
assert.doesNotMatch(ui, /Choose at least 3 interests|Add a profile photo to continue|Choose at least one connection goal/)
assert.doesNotMatch(ui, /Date of birth \*|Gender \*|Location \*/)
assert.match(ui, /step === 3[\s\S]*?formData\.interests\.length \? await updateProfile/)
assert.match(ui, /step === 4[\s\S]*?formData\.photos\.length \? await updateProfile/)
assert.match(ui, /disabled=\{finishing \|\| uploading\}/)

// The authenticated Pi username is presented as identity, not typed profile data.
assert.match(ui, /Pi identity connected/)
assert.match(ui, /@\{piUsername\}/)
assert.match(ui, /Enter GreenHaven now/)
assert.match(ui, /finishSetupForNow/)

// Empty optional steps must not overwrite existing profile values.
assert.match(ui, /Object\.keys\(profilePatch\)\.length \? await updateProfile/)
assert.match(ui, /Object\.keys\(finalProfilePatch\)\.length \? await updateProfile/)

// Completion still requires server confirmation; optionality does not weaken the identity gate.
assert.match(completion, /Optional profile fields are saved independently/)
assert.match(gate, /if \(!input\.serverVerified\) return "unknown"/)
console.log('RUN393 Phase B onboarding UX: PASS (14 assertions)')
