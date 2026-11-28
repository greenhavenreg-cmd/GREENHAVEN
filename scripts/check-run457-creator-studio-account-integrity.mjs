#!/usr/bin/env node
/** RUN457: Creator Studio identity isolation and honest partial-data presentation. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const screen = readFileSync('components/ghc/creator-studio-panel.tsx', 'utf8')
const drafts = readFileSync('lib/creator/post-drafts.ts', 'utf8')
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const checks = [
  ['Creator Studio subscribes to canonical identity changes', /IdentityService\.subscribe\(\(identity\) => setIdentityId\(identity\.userId \|\| ""\)\)/.test(screen)],
  ['creator and economy reads are abortable', /const controller = new AbortController\(\)/.test(screen) && /signal: controller\.signal/.test(screen) && /loadControllerRef\.current\?\.abort\(\)/.test(screen)],
  ['responses are discarded after account changes', /IdentityService\.getCurrentUserId\(\) !== ownerAtStart/.test(screen)],
  ['account changes clear prior creator, post, reputation and economy state', /setCreator\(\{\}\); setPosts\(\[\]\); setDrafts\(\[\]\); setRep\(null\); setEconomy\(null\); setCreatorEconomy\(null\)/.test(screen)],
  ['an in-flight prior-account settings save cannot leave the next account permanently busy', /setDataQuality\(null\); setTipsEnabled\(false\); setMsg\(""\); setBusy\(false\)/.test(screen)],
  ['unavailable source records are cleared instead of retaining stale account data', /sources\.publishedPosts === true && Array\.isArray\(data\.posts\)/.test(screen) && /sources\.reputation === true \? data\.reputation \|\| null : null/.test(screen) && /sources\.creatorEconomy === true && data\.creatorEconomy\?\.ok === true/.test(screen)],
  ['unavailable post data is shown as unavailable, not zero', /dataQuality\?\.sources\?\.publishedPosts !== true \? "—"/.test(screen) && /Content performance is temporarily unavailable/.test(screen)],
  ['creator profile writes are fenced to the initiating identity and disabled without verified profile data', /IdentityService\.getCurrentUserId\(\) !== ownerAtStart \|\| dataQuality\?\.sources\?\.creatorProfile !== true/.test(screen) && /disabled=\{busy \|\| dataQuality\?\.sources\?\.creatorProfile !== true\}/.test(screen)],
  ['local creator drafts remain keyed to canonical account identity', /IdentityService\.getCurrentUserId\(\) \|\| "current-user"/.test(drafts) && /KEY_PREFIX/.test(drafts)],
  ['RUN457 contract is enforced by pretypecheck, prebuild and static verification', ['pretypecheck', 'prebuild:checks', 'verify:static'].every((key) => packageJson.scripts[key]?.includes('check-run457-creator-studio-account-integrity.mjs'))],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++ }
console.log(`\nRUN457 Creator Studio integrity: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
