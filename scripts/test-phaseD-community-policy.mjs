#!/usr/bin/env node
import assert from 'node:assert/strict'
import { communityPrivacyLabel, matchesPrivacyFilter, normalizeCommunityPrivacy } from '../lib/community/discovery.ts'
const cases = [
  ['public', 'public', 'Open join'],
  ['request', 'request', 'Approval'],
  ['approval', 'request', 'Approval'],
  ['invite-only', 'invite', 'Invite only'],
  ['private_closed', 'private', 'Private'],
]
for (const [input, normalized, label] of cases) {
  assert.equal(normalizeCommunityPrivacy(input), normalized)
  assert.equal(communityPrivacyLabel(input), label)
}
assert.equal(matchesPrivacyFilter('private_closed', 'request'), true)
assert.equal(matchesPrivacyFilter('invite-only', 'request'), false)
assert.equal(matchesPrivacyFilter('invite-only', 'invite'), true)
assert.equal(matchesPrivacyFilter('public', 'public'), true)
assert.equal(matchesPrivacyFilter('request', 'all'), true)
console.log(`Phase D community privacy policy: ${cases.length + 5}/${cases.length + 5} passed`)
