#!/usr/bin/env node
/**
 * RUN511: a published product must have a price greater than zero, on the
 * seller form and on the listings API. Empty/null price is never treated as 0.
 */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const ui = readFileSync("components/ghc/marketplace-screen.tsx", "utf8")
const api = readFileSync("app/api/marketplace/listings/route.ts", "utf8")
const checklist = readFileSync("lib/marketplace/seller-checklist.ts", "utf8")
const checks = [
  ["seller form treats an empty price as invalid, not 0", /const priceNum = sellPrice\.trim\(\) === "" \? Number\.NaN : Number\(sellPrice\)/.test(ui)],
  ["seller form rejects price <= 0", /priceNum <= 0\) \{\s*setSellError\("Enter a price greater than zero"\)/.test(ui)],
  ["old non-strict check is gone", !/priceNum < 0\) \{\s*setSellError\("Enter a valid price"\)/.test(ui)],
  ["API rejects active product with null/empty/zero price", /kind === "product" && status === "active" && \(body\.price === null/.test(api) && /error: "PRICE_REQUIRED"/.test(api)],
  ["API keeps drafts, pause and remove unaffected", /status === "active"/.test(api) && /\["draft", "active", "paused", "sold_out", "removed"\]/.test(api)],
  ["API keeps upper bound and precision rules", /price > 1_000_000/.test(api) && /PRICE_PRECISION/.test(api)],
  ["seller checklist still requires price greater than zero", /Price greater than zero/.test(checklist)],
]
for (const [label, pass] of checks) { assert.ok(pass, label); console.log(`PASS ${label}`) }
console.log(`RUN511 marketplace positive price: ${checks.length}/${checks.length} passed`)
