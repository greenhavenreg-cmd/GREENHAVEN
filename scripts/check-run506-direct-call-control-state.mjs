#!/usr/bin/env node
/** RUN506: direct-call controls are isolated per call and expose accessible state. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const sheet = readFileSync("components/ghc/direct-call-sheet.tsx", "utf8")
const checks = [
  ["microphone state resets when the call identity changes", /setMuted\(false\)[\s\S]*setCameraOff\(false\)[\s\S]*\}, \[session\?\.callId\]\)/.test(sheet)],
  ["camera state resets when the call identity changes", /setCameraOff\(false\)[\s\S]*\}, \[session\?\.callId\]\)/.test(sheet)],
  ["microphone toggle exposes pressed state", /aria-label=\{muted \? "Unmute microphone" : "Mute microphone"\} aria-pressed=\{muted\}/.test(sheet)],
  ["camera toggle exposes pressed state", /aria-label=\{cameraOff \? "Turn camera on" : "Turn camera off"\} aria-pressed=\{cameraOff\}/.test(sheet)],
  ["call phase is announced accessibly", /role="status" aria-live="polite" aria-atomic="true"/.test(sheet)],
]
for (const [label, pass] of checks) {
  assert.ok(pass, label)
  console.log(`PASS ${label}`)
}
console.log(`RUN506 direct-call control state and accessibility: ${checks.length}/${checks.length} passed`)
