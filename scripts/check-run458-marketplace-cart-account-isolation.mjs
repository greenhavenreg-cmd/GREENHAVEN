#!/usr/bin/env node
/** RUN458: verified account-scoped Marketplace cart storage and live UI refresh. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
const cart = readFileSync("lib/marketplace/cart.ts", "utf8")
const screen = readFileSync("components/ghc/marketplace-screen.tsx", "utf8")
const app = readFileSync("components/ghc/app.tsx", "utf8")
const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const checks = [
  ["only verified canonical identities receive a private cart namespace", /authState === "authenticated"/.test(cart) && /verificationState === "server_verified"/.test(cart) && /!identity\.isLocalStudioId/.test(cart) && /canonicalId/.test(cart)],
  ["Pi provider UIDs are not used as cart storage principals", !/piUserId.*storageKey|storageKey.*piUserId/.test(cart)],
  ["anonymous cart remains a distinct legacy namespace", /return verified \? `\$\{CART_KEY\}:account:/.test(cart) && /: CART_KEY/.test(cart)],
  ["Marketplace screen refreshes cart when identity changes", /IdentityService\.subscribe\(handler\)/.test(screen) && /unsubscribeIdentity\(\)/.test(screen)],
  ["global cart badge refreshes when identity changes", /IdentityService\.subscribe\(syncCartBadge\)/.test(app)],
  ["single-item checkout idempotency keys are scoped to the active cart namespace", /idempotencyKeyRef\.current\?\.namespace === checkoutNamespace/.test(screen)],
  ["cart checkout stops after an account switch and avoids cleaning another account's cart", /const assertCheckoutAccount = \(\) =>/.test(screen) && /assertCheckoutAccount\(\)/.test(screen) && /getMarketplaceCartNamespace\(\) === checkoutNamespace/.test(screen)],
  ["RUN458 gate is part of static, prebuild and pretypecheck verification", ["verify:static", "prebuild:checks", "pretypecheck"].every((key) => pkg.scripts[key]?.includes("check-run458-marketplace-cart-account-isolation.mjs"))],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) failed++ }
console.log(`\nRUN458 Marketplace cart account isolation: ${checks.length - failed}/${checks.length} passed`)
assert.equal(failed, 0)
