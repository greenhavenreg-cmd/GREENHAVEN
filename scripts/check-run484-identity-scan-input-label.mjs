import fs from "node:fs"
import assert from "node:assert/strict"
const src = fs.readFileSync("components/ghc/greenhaven-identity-card.tsx", "utf8")
const i = src.indexOf("<textarea")
const tag = src.slice(i, src.indexOf("/>", i))
const checks = [
  ["identity scan textarea has an accessible name", /aria-label="Paste a GH ID or receive link"/.test(tag)],
  ["identity scan textarea disables autocorrect and spellcheck for ID/link paste", /autoCorrect="off"/.test(tag) && /spellCheck=\{false\}/.test(tag) && /autoComplete="off"/.test(tag)],
  ["scan input handling is unchanged", /value=\{scanInput\}/.test(tag) && /setScanInput\(e\.target\.value\)/.test(tag) && /handleParsed\(scanInput\)/.test(src)],
]
for (const [n, p] of checks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN484 identity scan input label: ${checks.length}/${checks.length} passed`)
