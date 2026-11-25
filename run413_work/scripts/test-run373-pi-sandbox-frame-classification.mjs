#!/usr/bin/env node
/** RUN373 executable regression for the Pi Developer Sandbox referrer trust boundary. */
import assert from 'node:assert/strict'
import { isTrustedPiSandboxReferrerHost } from '../lib/pi-frame-classification.ts'

const cases = [
  ['sandbox.minepi.com', true],
  ['SANDBOX.MINEPI.COM', true],
  [' sandbox.minepi.com ', true],
  ['app-cdn.minepi.com', false],
  ['www.sandbox.minepi.com', false],
  ['sandbox.minepi.com.attacker.example', false],
  ['attacker-sandbox.minepi.com', false],
  ['', false],
  [null, false],
  [undefined, false],
]
for (const [host, expected] of cases) {
  assert.equal(isTrustedPiSandboxReferrerHost(host), expected, `unexpected trust result for ${String(host)}`)
  console.log(`PASS ${String(host)} => ${expected}`)
}
console.log(`\nRUN373 executable Pi Sandbox host policy: ${cases.length}/${cases.length} passed`)
