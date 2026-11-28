import { readFileSync } from "node:fs"
const read = (p) => readFileSync(p, "utf8")
const wrapper = read("lib/auth/install-api-auth-fetch.ts")
const claim = read("lib/rewards/claim-daily-client.ts")
const withdraw = read("features/wallet/withdraw-ghc-panel.tsx")
const pin = read("components/ghc/pi-withdraw-sheet.tsx")
const member = read("components/ghc/premium-membership-screen.tsx")
const addGhc = read("features/wallet/add-ghc-sheet.tsx")
const feed = read("components/ghc/feed-components.tsx")
const boundary = read("lib/error-boundary.tsx")
const walletActions = read("features/wallet/wallet-actions.tsx")
const checks = [
  ["global API fetch applies a bounded default timeout", /DEFAULT_API_TIMEOUT_MS/.test(wrapper) && /AbortController/.test(wrapper)],
  ["global timeout respects caller-owned signals", /if \(init\?\.signal\) return null/.test(wrapper)],
  ["global timeout skips streams, uploads, exports and calls", ["/api/realtime/", "/api/media", "/api/messaging/calls", "/api/account/export"].every((p) => wrapper.includes(p))],
  ["global timeout timer is always cleared", /finally\(bounded\.clear\)/.test(wrapper)],
  ["daily claim requests are bounded", (claim.match(/fetchWithTimeout/g) || []).length >= 3],
  ["timed-out claim is reported as ambiguous, not failed", /may already be recorded/.test(claim)],
  ["withdrawal requests are bounded and keep the idempotency key", (withdraw.match(/timeoutMs/g) || []).length >= 2 && /idempotency key/i.test(withdraw)],
  ["withdrawal timeout never claims a hard failure", /may already be recorded/.test(withdraw)],
  ["Pi withdrawal PIN/readiness requests are bounded", (pin.match(/fetchWithTimeout\(/g) || []).length >= 3],
  ["membership recovery request is bounded", /fetchWithTimeout\("\/api\/membership\/reconcile"/.test(member)],
  ["GHC pack catalogue request is bounded", /fetchWithTimeout\("\/api\/economy\/purchase-ghc"/.test(addGhc)],
  ["post options button has an accessible name and touch target", /aria-label="More post options"/.test(feed) && /min-h-9 min-w-9/.test(feed)],
 ["chunk-load failures are detected and recover by reload", /export function isChunkLoadError/.test(boundary) && /window\.location\.reload\(\)/.test(boundary)],
  ["chunk reload cannot loop", /Date\.now\(\) - last < 30_000/.test(boundary)],
  ["wallet History action is disabled instead of dead when unwired", /disabled=\{disabled \|\| !a\.onClick\}/.test(walletActions) && !/\(\) => \{\}\)/.test(walletActions)],
]
let failed = 0
for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) failed++ }
console.log(`RUN462 client request bounds: ${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
