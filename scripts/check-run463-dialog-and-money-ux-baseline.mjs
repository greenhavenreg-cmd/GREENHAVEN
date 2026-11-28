import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const read = (p) => readFileSync(p, "utf8")
const hook = read("hooks/use-dialog-a11y.ts")
const withdraw = read("features/wallet/withdraw-ghc-panel.tsx")
const addGhc = read("features/wallet/add-ghc-sheet.tsx")
const member = read("components/ghc/premium-membership-screen.tsx")
const toast = read("components/ghc/enhanced-toast.tsx")
const story = read("components/ghc/profile-story-section.tsx")
const creator = read("components/ghc/creator-studio-overlay.tsx")
const discovery = read("components/ghc/discovery-components.tsx")
const feedEnh = read("components/ghc/feed-enhancements.tsx")
const css = read("app/globals.css")

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith(".tsx")) out.push(p)
  }
  return out
}
// Buttons without an explicit type submit surrounding forms and are a recurring regression source.
let untyped = 0
const offenders = []
for (const file of [...walk("components"), ...walk("features")]) {
  const src = read(file)
  if (src.includes("<form")) continue
  for (const m of src.matchAll(/<button\b([^>]*)>/g)) {
    if (!/type=/.test(m[1]) && !/\{\.\.\./.test(m[1])) {
      untyped += 1
      offenders.push(file)
    }
  }
}

const checks = [
  ["shared dialog hook handles Escape, Tab trapping, focus restore and scroll lock", /Escape/.test(hook) && /"Tab"/.test(hook) && /opener/.test(hook) && /scrollLockCount/.test(hook)],
  ["scroll lock is reference-counted for stacked sheets", /scrollLockCount \+= 1/.test(hook) && /Math\.max\(0, scrollLockCount - 1\)/.test(hook)],
  ["creator studio overlay is a labelled modal dialog with Escape and backdrop close", /role="dialog"/.test(creator) && /aria-modal="true"/.test(creator) && /useDialogA11y/.test(creator)],
  ["profile preview modal is a dialog, theme-aware, hook runs before early return", /useDialogA11y<HTMLDivElement>\(Boolean\(isOpen && candidate\), onClose\)\s*\n\s*if \(!isOpen \|\| !candidate\) return null/.test(discovery) && /bg-background text-foreground w-full rounded-t-3xl/.test(discovery)],
  ["post options menu is a dialog with a 44px labelled close control", /aria-label="Post options"/.test(feedEnh) && /aria-label="Close post options"/.test(feedEnh) && /h-11 w-11/.test(feedEnh)],
  ["story creator and viewer expose dialog semantics", /aria-label="Create story"/.test(story) && /data-gh-story-viewer="true"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-label=\{`\$\{viewing\.name/.test(story) && (story.match(/role="dialog"/g) || []).length === 2],
  ["error toasts are announced assertively as alerts", /type === "error" \? "alert" : "status"/.test(toast) && /assertive/.test(toast)],
  ["toast dismiss control has a 44px target", /h-11 w-11/.test(toast)],
  ["withdrawal key is bound to its payload and rotates when amount/wallet changes", /idempotencyPayloadRef/.test(withdraw) && /payloadSignature/.test(withdraw)],
  ["withdrawal submit is re-entry guarded", /submittingRef\.current/.test(withdraw) && /submittingRef\.current = false/.test(withdraw)],
  ["withdrawal keeps the idempotency key after timeout", /may already be recorded/.test(withdraw)],
  ["withdrawal inputs are 16px, 44px, labelled with associated errors", /text-base/.test(withdraw) && /min-h-11/.test(withdraw) && /wd-wallet-error/.test(withdraw) && /wd-amount-error/.test(withdraw)],
  ["withdrawal submit stays disabled until address is valid and confirmed", /walletLooksInvalid \|\| !confirmWallet/.test(withdraw)],
  ["Get GHC sheet is a labelled dialog using the shared hook", /aria-label="Get GHC"/.test(addGhc) && /useDialogA11y/.test(addGhc)],
  ["pack purchase intents cannot be double-started", /startingRef\.current/.test(addGhc) && /startingPackId !== null/.test(addGhc)],
  ["pack catalogue failure is distinct from an empty catalogue and retryable", /packsError/.test(addGhc) && /Try again/.test(addGhc)],
  ["pack purchase failures are shown to the member instead of swallowed", /purchaseError/.test(addGhc) && /Nothing was charged/.test(addGhc)],
  ["no operator/deployment wording is shown to members in Get GHC", !/Set testnet unlock or buy flags/.test(addGhc)],
  ["membership allows only one purchase across Pi and GHC methods", /purchaseInFlightRef/.test(member) && /disabled=\{isOffline \|\| Boolean\(busy\)\}/.test(member)],
  ["membership confirm sheet scrolls and respects the safe area", /max-h-\[92dvh\]/.test(member) && /safe-area-inset-bottom/.test(member)],
  ["touch text fields are held at 16px to prevent mobile zoom", /pointer: coarse/.test(css) && /font-size: 16px !important/.test(css)],
  ["buttons outside forms declare type=button", untyped === 0],
]

let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} RUN463 ${label}`)
  if (!ok) failed += 1
}
if (untyped) console.log(`  untyped buttons: ${untyped} in ${[...new Set(offenders)].slice(0, 5).join(", ")}`)
console.log(`RUN463 dialog and money UX baseline: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
