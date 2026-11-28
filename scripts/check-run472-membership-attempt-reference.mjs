import { readFileSync } from "node:fs"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } else console.log(`PASS ${msg}`) }
const s = readFileSync("lib/domains/membership-domain.ts", "utf8")
assert(/const ghcPurchaseAttempts = new Map/.test(s), "GHC membership attempts are kept per tier and period")
assert(/GHC_ATTEMPT_TTL_MS = 10 \* 60 \* 1000/.test(s), "attempt reference expires so a later renewal gets a new reference")
assert(/const purchaseAttemptId = ghcPurchaseAttemptId\(tier, periodKey\)/.test(s), "purchaseWithGhc reuses the stable attempt reference")
assert(!/purchaseAttemptId = typeof crypto/.test(s), "purchaseWithGhc no longer mints a fresh reference per call")
assert(/settleGhcPurchaseAttempt\(tier, periodKey\)/.test(s), "attempt ends on a definitive server answer")
const settle = s.indexOf("settleGhcPurchaseAttempt(tier, periodKey)\n        }")
const fetchAt = s.indexOf('method: "ghc"')
assert(settle > fetchAt && fetchAt > 0, "attempt is settled only after the server responds, not on network failure")
assert(!/GHC was not spent\./.test(s.slice(s.indexOf("purchaseWithGhc"))), "unconfirmed purchase never claims GHC was not spent")
if (failures) process.exit(1)
console.log("RUN472 membership attempt reference contract passed")
