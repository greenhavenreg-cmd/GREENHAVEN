#!/usr/bin/env node
import assert from 'node:assert/strict'
import { isPiAppCdnReferrerHost, isTrustedPiSandboxReferrerHost } from '../lib/pi-frame-classification.ts'
const cases = [['app-cdn.minepi.com', true], [' APP-CDN.minepi.com ', true], ['sandbox.minepi.com', false], ['x.app-cdn.minepi.com', false], ['app-cdn.minepi.com.evil.example', false], ['', false], [null, false], [undefined, false]]
for (const [h, e] of cases) { assert.equal(isPiAppCdnReferrerHost(h), e, String(h)); console.log(`PASS ${String(h)} => ${e}`) }
assert.equal(isTrustedPiSandboxReferrerHost('app-cdn.minepi.com'), false)
console.log(`\nRUN374 app-cdn host policy: ${cases.length + 1}/${cases.length + 1} passed`)
