import assert from "node:assert/strict"
import { sanitizeAmountInput as s } from "../lib/wallet/amount-input.ts"
import { parsePiInput } from "../lib/wallet/pi-amount.ts"
let n = 0
const t = (name, fn) => { fn(); n += 1; console.log(`ok - ${name}`) }
t("comma keypad: 1,5 is 1.5 not 15", () => assert.equal(s("1,5", 7), "1.5"))
t("dot unchanged", () => { assert.equal(s("1.5", 7), "1.5"); assert.equal(s("12", 7), "12"); assert.equal(s("", 7), "") })
t("leading separator", () => { assert.equal(s(",5", 7), ".5"); assert.equal(s(".", 7), ".") })
t("trailing separator while typing is kept", () => { assert.equal(s("1,", 7), "1."); assert.equal(s("1.", 7), "1.") })
t("both separators: last one is decimal", () => { assert.equal(s("1,234.5", 7), "1234.5"); assert.equal(s("1.234,5", 7), "1234.5") })
t("a second separator typed into a decimal never changes the value", () => { assert.equal(s("1.5,", 7), "1.5"); assert.equal(s("1,5.", 7), "1.5"); assert.equal(s("12,34.56", 7), "12.3456") })
t("repeated same separator is grouping", () => { assert.equal(s("1,000,000", 7), "1000000"); assert.equal(s("1.000.000", 7), "1000000") })
t("grouped number then trailing separator stays decimal", () => assert.equal(s("1,000,", 7), "1000."))
t("fraction capped, never rounded", () => { assert.equal(s("0,123456789", 7), "0.1234567"); assert.equal(s("1.99999", 4), "1.9999") })
t("letters, signs, exponent and spaces stripped", () => { assert.equal(s("-1e3", 7), "13"); assert.equal(s(" 1 5 ", 7), "15"); assert.equal(s("abc", 7), "") })
t("maxDecimals 0 keeps whole part only", () => assert.equal(s("12,9", 0), "12."))
t("output always parses exactly as Pi", () => {
  assert.deepEqual(parsePiInput(s("2,95", 7)), { ok: true, atomic: 29500000 })
  assert.deepEqual(parsePiInput(s("0,0000001", 7)), { ok: true, atomic: 1 })
})
t("idempotent", () => { for (const v of ["1,5", "1,234.5", "1.000.000", "0,123456789", ",5"]) assert.equal(s(s(v, 7), 7), s(v, 7)) })
console.log(`RUN471 amount input: ${n}/${n} passed`)

// Source contract: every typed money field uses the shared sanitiser, none strips "," silently.
import { readFileSync } from "node:fs"
let bad = 0
for (const [f, dec] of [["components/ghc/pi-withdraw-sheet.tsx", 7], ["components/ghc/send-ghc-flow.tsx", 4], ["components/ghc/request-ghc-flow.tsx", 4]]) {
  const src = readFileSync(f, "utf8")
  if (!new RegExp(`sanitizeAmountInput\\(e\\.target\\.value, ${dec}\\)`).test(src)) { bad += 1; console.error(`FAIL: ${f} does not use sanitizeAmountInput(…, ${dec})`) }
  if (/replace\(\/\[\^\\d\.\]\/g/.test(src)) { bad += 1; console.error(`FAIL: ${f} still strips commas with /[^\\d.]/`) }
}
if (bad) process.exit(1)
console.log("RUN471 money inputs use the shared sanitiser")
