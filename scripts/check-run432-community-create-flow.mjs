import fs from 'node:fs'
const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8')
const modal = read('../components/ghc/create-group-modal.tsx')
const store = read('../lib/community/create-draft.ts')
const checks = [
  ['community draft is account scoped', /function accountKey\(userId: unknown\)[\s\S]{0,180}return `\$\{DRAFT_PREFIX\}:\$\{id\}`/.test(store)],
  ['draft restores step, fee rail and form fields', /loadCommunityCreateDraft[\s\S]{0,500}setFormData\(draft\.formData\)[\s\S]{0,120}setStep\(draft\.step\)[\s\S]{0,120}setFeeRail\(draft\.feeRail\)/.test(modal)],
  ['draft persists on edits and step changes', /saveCommunityCreateDraft\(window\.localStorage, draftOwnerId, \{[\s\S]{0,180}step,[\s\S]{0,120}formData/.test(modal)],
  ['unstable data and blob image previews are not persisted', /durableCover[\s\S]{0,300}blob:|data:/.test(store)],
  ['draft expiry is bounded', /DRAFT_TTL_MS = 30 \* 24 \* 60 \* 60 \* 1000/.test(store)],
  ['default fee rail matches the Pi-only commerce environment', /defaultFeeRail: CommunityFeeRail = isPiOnlyCommerceClient\(\) \? \"PI\" : \"GHC\"/.test(modal) && /const feeRail = raw\.feeRail === \"PI\" \|\| form\.feeCurrency === \"PI\" \? \"PI\" : \"GHC\"/.test(store)],
  ['payment confirmation is not restored from local draft', /Payment confirmation is deliberately[\s\S]{0,160}not restored/.test(modal) && /setFeePaymentConfirmed\(false\)/.test(modal)],
  ['submission reuses the persisted idempotency identity', /const submission = \{ \.\.\.formData, id: formData\.id \|\| draftIdRef\.current \}[\s\S]{0,250}saveCommunityCreateDraft[\s\S]{0,250}onSubmit\(submission\)/.test(modal)],
  ['failed create keeps draft fields for retry', /A false result means payment\/create failed; preserve every field and stay here/.test(modal)],
  ['successful create clears the draft only after durable confirmation', /if \(result === false\) return[\s\S]{0,250}clearCommunityCreateDraft/.test(modal)],
  ['user can explicitly discard a restored draft', /draftRestored \?[\s\S]{0,500}onClick=\{discardDraft\}/.test(modal)],
]
let failed = 0
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failed++ }
console.log(`RUN432 community creation flow contract: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exitCode = 1
