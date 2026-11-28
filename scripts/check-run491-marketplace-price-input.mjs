import fs from "node:fs"
const src = fs.readFileSync("components/ghc/marketplace-screen.tsx", "utf8")
const api = fs.readFileSync("app/api/marketplace/listings/route.ts", "utf8")
const checks = [
  ["marketplace imports the shared amount sanitiser", /import \{ sanitizeAmountInput \} from "@\/lib\/wallet\/amount-input"/.test(src)],
  ["client decimal cap mirrors the server cap of 8", /const MARKETPLACE_PRICE_MAX_DECIMALS = 8/.test(src) && /const MAX_PRICE_DECIMALS = 8/.test(api)],
  ["listing base price uses the sanitiser", /setPrice\(sanitizeAmountInput\(e\.target\.value, MARKETPLACE_PRICE_MAX_DECIMALS\)\)/.test(src)],
  ["minimum and maximum price filters use the sanitiser", /setMinPrice\(sanitizeAmountInput\(event\.target\.value, MARKETPLACE_PRICE_MAX_DECIMALS\)\.slice\(0,19\)\)/.test(src) && /setMaxPrice\(sanitizeAmountInput\(event\.target\.value, MARKETPLACE_PRICE_MAX_DECIMALS\)\.slice\(0,19\)\)/.test(src)],
  ["no marketplace price input still strips commas", !/replace\(\/\[\^0-9\.\]\/g/.test(src)],
  ["server price validation and listing submit are unchanged", /PRICE_PRECISION/.test(api) && /price: Number\(price\)/.test(src)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN491 marketplace price input: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
