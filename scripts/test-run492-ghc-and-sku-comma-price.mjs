import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { parseGhcInput as p } from "../lib/wallet/ghc-amount.ts"
import { parseProductVariantsText as v, normalizeVariantPrice as n } from "../lib/marketplace/product-variants.ts"
let c = 0
const t = (name, fn) => { fn(); c += 1; console.log(`ok - ${name}`) }
t("GHC 1,5 is 1.5 not 15", () => { assert.equal(p("1,5").units, 15000); assert.equal(p("2,25").amount, 2.25) })
t("GHC dot and grouped input unchanged", () => { assert.equal(p("12.3456").units, 123456); assert.equal(p("1,000,000").amount, 1000000); assert.equal(p("1,234.5").amount, 1234.5) })
t("GHC still rejects exponent, signs, letters, 5 decimals", () => {
  for (const bad of ["1e2", "-1", "abc", "1 5"]) assert.equal(p(bad).code, "INVALID")
  assert.equal(p("1,00001").code, "TOO_MANY_DECIMALS"); assert.equal(p("").code, "EMPTY"); assert.equal(p("0").code, "NOT_POSITIVE")
})
t("variant price comma decimal", () => { assert.equal(n("1,5"), "1.5"); assert.equal(n("12,25"), "12.25"); assert.equal(n("0,5"), "0.5"); assert.equal(n("3.5"), "3.5") })
t("variant price ambiguous or malformed comma rejected, never guessed", () => {
  for (const bad of ["1,000", "1,5.5", "1.5,5", "1,2,3", ",5", "1,"]) assert.equal(n(bad), null)
})
t("variant lines parse comma price exactly", () => {
  const rows = v("A1 | Small | 2,5 | 10\nA2 | Large | 3.75 | 4", "GHC")
  assert.equal(rows[0].price, 2.5); assert.equal(rows[1].price, 3.75)
})
t("variant text with ambiguous price rejects the whole form", () => assert.equal(v("A1 | Small | 1,000 | 10", "GHC"), null))
const panel = readFileSync("features/wallet/withdraw-ghc-panel.tsx", "utf8")
t("GHC panel uses shared sanitiser", () => { assert.match(panel, /sanitizeAmountInput\(e\.target\.value, GHC_INPUT_DECIMALS\)/); assert.doesNotMatch(panel, /replace\(\/\[\^\\d\.,\]\/g/) })
console.log(`RUN492 ghc + sku comma price: ${c}/${c} passed`)
