import fs from "node:fs"
import assert from "node:assert/strict"
const src = fs.readFileSync("components/ghc/passkeys-panel.tsx", "utf8")
const load = src.slice(src.indexOf("const load = useCallback"), src.indexOf("useEffect(() => {", src.indexOf("const load = useCallback")))
const checks = [
  ["load has an explicit failed flag", /const \[loadFailed, setLoadFailed\] = useState\(false\)/.test(src)],
  ["a failed or rejected load no longer wipes the list", !/setCreds\(\[\]\)/.test(load) && (load.match(/setLoadFailed\(true\)/g) || []).length === 2],
  ["a successful load replaces the list and clears the flag", /setCreds\(Array\.isArray\(data\.credentials\) \? data\.credentials : \[\]\)/.test(load) && /setLoadFailed\(false\)/.test(load)],
  ["empty list after a failure shows an alert with retry, not 'No passkeys registered'", /creds\.length === 0 && loadFailed \? \(\s*\n\s*<div role="alert"/.test(src) && /This does not mean none are registered/.test(src)],
  ["'No passkeys registered' only renders after a successful load", /\) : creds\.length === 0 \? \(\s*\n\s*<p className="text-\[13px\] text-muted-foreground">No passkeys registered\./.test(src)],
  ["a stale list is flagged as possibly out of date", /could not be refreshed and may be out of date/.test(src)],
  ["revoke, register and step-up flows are untouched", /onRevoke\(c\.id\)/.test(src) && /onRegister\(\)/.test(src) && /onStepUp\(\)/.test(src)],
]
for (const [n, p] of checks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN482 passkeys load truth: ${checks.length}/${checks.length} passed`)
const banner = fs.readFileSync("components/ghc/payment-recovery-banner.tsx", "utf8")
const bl = banner.slice(banner.indexOf("const load = useCallback"), banner.indexOf("useEffect(() => {", banner.indexOf("const load = useCallback")))
const bchecks = [
  ["recovery banner keeps the last confirmed items when a refresh fails", !/setItems\(\[\]\)/.test(bl) && /setItems\(data\.items\.slice\(0, 5\)\)/.test(bl)],
  ["recovery banner still ends loading in finally", /finally \{\s*\n\s*setLoading\(false\)/.test(bl)],
]
for (const [n, p] of bchecks) { console.log(`${p ? "PASS" : "FAIL"} ${n}`); assert.ok(p, n) }
console.log(`RUN482 payment recovery banner truth: ${bchecks.length}/${bchecks.length} passed`)
