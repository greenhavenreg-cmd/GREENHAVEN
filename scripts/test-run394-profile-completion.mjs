#!/usr/bin/env node
import assert from 'node:assert/strict'
import { calculateProfileCompletionMetrics } from '../lib/profile-enhancements.ts'

const emptyButVerified = calculateProfileCompletionMetrics({
  verified: true,
  bornDate: '1990-01-01',
  age: 36,
})
assert.equal(emptyButVerified.percentage, 0, 'verification and age/DOB must not inflate optional profile completion')
assert.equal(emptyButVerified.missing.length, 7)

const enrichedButUnverified = calculateProfileCompletionMetrics({
  displayName: 'GreenHaven Member',
  bio: 'I enjoy building useful connections and sharing practical knowledge.',
  photos: ['https://media.example/avatar.webp'],
  city: 'Kano',
  country: 'Nigeria',
  interests: ['Technology'],
  education: 'University',
  profession: 'Software developer',
  verified: false,
})
assert.equal(enrichedButUnverified.percentage, 100, 'optional profile enrichment must reach 100% without identity verification')
assert.equal(enrichedButUnverified.missing.length, 0)

const partial = calculateProfileCompletionMetrics({ displayName: 'Member', interests: [] })
assert.equal(partial.percentage, 15)
assert.ok(partial.missing.includes('Profile photo'))
console.log('RUN394 profile completion runtime tests: PASS (3 scenarios)')
