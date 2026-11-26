import assert from 'node:assert/strict'
import {
  clearCommunityCreateDraft,
  loadCommunityCreateDraft,
  normalizeCommunityCreateDraft,
  saveCommunityCreateDraft,
} from '../lib/community/create-draft.ts'

class MemoryStorage {
  data = new Map()
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null }
  setItem(key, value) { this.data.set(key, String(value)) }
  removeItem(key) { this.data.delete(key) }
}

const now = Date.now()
const storage = new MemoryStorage()
const userA = 'user-a'
const userB = 'user-b'
const draft = {
  step: 3,
  feeRail: 'PI',
  updatedAt: now,
  formData: {
    id: 'comm_12345678-1234-1234-1234-123456789abc',
    name: 'Green Builders',
    description: 'A community for builders and makers.',
    category: 'Tech',
    privacy: 'invite-only',
    coverImage: '/api/media/media_cover/content',
    welcomeMessage: 'Welcome builders!',
    rules: ['Be respectful'],
    invitedMembers: ['gh-user-1'],
    feeCurrency: 'PI',
  },
}

assert.equal(saveCommunityCreateDraft(storage, userA, draft), true)
assert.equal(loadCommunityCreateDraft(storage, userA)?.formData.name, 'Green Builders')
assert.equal(loadCommunityCreateDraft(storage, userA)?.step, 3)
assert.equal(loadCommunityCreateDraft(storage, userA)?.formData.id, draft.formData.id)
assert.equal(loadCommunityCreateDraft(storage, userA)?.feeRail, 'PI')
assert.equal(loadCommunityCreateDraft(storage, userA)?.formData.feeCurrency, 'PI')
assert.equal(loadCommunityCreateDraft(storage, userB), null)
assert.equal(loadCommunityCreateDraft(storage, '__proto__'), null)

const legacyPiDraft = normalizeCommunityCreateDraft({ ...draft, feeRail: 'GHC', formData: { ...draft.formData, feeCurrency: 'PI' } }, now)
assert.equal(legacyPiDraft?.feeRail, 'PI')

const unsafe = normalizeCommunityCreateDraft({
  ...draft,
  formData: { ...draft.formData, coverImage: 'data:image/jpeg;base64,AAAA', invitedMembers: Array(20).fill('person'), rules: Array(9).fill('rule') },
}, now)
assert.equal(unsafe?.formData.coverImage, undefined)
assert.equal(unsafe?.formData.invitedMembers.length, 10)
assert.equal(unsafe?.formData.rules.length, 5)
assert.equal(normalizeCommunityCreateDraft({ ...draft, updatedAt: now - 31 * 24 * 60 * 60 * 1000 }, now), null)
assert.equal(normalizeCommunityCreateDraft({ ...draft, step: 99 }, now)?.step, 4)

const brokenStorage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') }, removeItem() { throw new Error('blocked') } }
assert.equal(loadCommunityCreateDraft(brokenStorage, userA), null)
assert.equal(saveCommunityCreateDraft(brokenStorage, userA, draft), false)
assert.equal(clearCommunityCreateDraft(brokenStorage, userA), false)
assert.equal(clearCommunityCreateDraft(storage, userA), true)
assert.equal(loadCommunityCreateDraft(storage, userA), null)

console.log('RUN432 community create draft: 18/18 passed')
