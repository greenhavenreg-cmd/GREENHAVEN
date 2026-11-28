import { readFileSync } from "node:fs"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } else { console.log(`PASS ${msg}`) } }
const read = (p) => readFileSync(p, "utf8")

// Money and authorization handlers must hold a synchronous ref guard (state flags update after a render).
const guards = [
  ["components/ghc/pi-withdraw-sheet.tsx", ["submitInFlightRef", "pinInFlightRef", "releaseInFlightRef"], "Pi withdrawal sheet"],
  ["components/ghc/rewards-centre-screen.tsx", ["claimInFlightRef"], "Rewards Centre claim"],
  ["features/wallet/wallet-screen.tsx", ["claimHoldInFlightRef"], "Wallet matured-hold claim"],
  ["components/ghc/payment-recovery-panel.tsx", ["fulfillInFlightRef"], "Payment recovery fulfilment"],
  ["components/ghc/pi-payout-authorization-card.tsx", ["authInFlightRef"], "Pi payout authorization"],
  ["components/ghc/messaging-premium-sheet.tsx", ["buyInFlightRef"], "Messaging premium purchase"],
]
for (const [file, refs, label] of guards) {
  const s = read(file)
  for (const r of refs) {
    const uses = s.split(r).length - 1
    assert(new RegExp(`${r} = useRef\\(false\\)`).test(s), `${label}: ${r} declared`)
    assert(/\.current = true/.test(s) && new RegExp(`${r}\\.current = false`).test(s), `${label}: ${r} is released in a finally`)
    assert(uses >= 4, `${label}: ${r} checked, set and released`)
  }
}

// Premium purchase: stable idempotency reference, confirmation step, no dismissal while in flight.
const sheet = read("components/ghc/messaging-premium-sheet.tsx")
assert(/referenceId/.test(sheet) && /JSON\.stringify\(\{ productId, referenceId \}\)/.test(sheet), "premium purchase sends a client reference")
assert(/referenceRef\.current\.delete\(productId\)/.test(sheet), "premium reference is cleared only after a confirmed purchase")
assert(/useDialogA11y<HTMLDivElement>\(open, busy \? undefined : onClose\)/.test(sheet), "premium sheet cannot be dismissed while a purchase is in flight")
assert(/messaging-premium-confirm/.test(sheet) && /Spend <strong/.test(sheet), "premium purchase needs an explicit confirmation")
const route = read("app/api/messaging/premium/route.ts")
assert(/INVALID_REFERENCE/.test(route) && /\{8,128\}/.test(route), "premium route bounds the client reference shape")
assert(route.indexOf("INVALID_REFERENCE") < route.indexOf("executeDurableGhcSpend(spendInput)"), "premium reference is validated before any spend")

if (failures) { console.error(`\nRUN470 money-action single-flight: ${failures} failure(s)`); process.exit(1) }
console.log("\nRUN470 money-action single-flight contract passed")
