import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } }
const read = (p) => readFileSync(p, "utf8")
const walk = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : [] })

// Overlays moved onto the shared dialog hook must not keep a second Escape/focus handler.
for (const [file, label] of [
  ["components/ghc/community-join-reason-picker.tsx", "community join picker"],
  ["components/ghc/connection-intent-picker.tsx", "connection intent picker"],
  ["components/ghc/ghc-utility-panel.tsx", "GHC spend confirmation"],
]) {
  const s = read(file)
  assert(/useDialogA11y/.test(s), `${label} uses useDialogA11y`)
  assert(!/addEventListener\("keydown"/.test(s), `${label} has no bespoke keydown listener`)
  assert(/role="dialog"/.test(s) && /aria-modal="true"/.test(s) && /tabIndex=\{-1\}/.test(s), `${label} is a focusable modal dialog`)
}
assert(/busy \? undefined : onCancel/.test(read("components/ghc/community-join-reason-picker.tsx")), "join picker cannot be dismissed while busy")
assert(/busy \? undefined : onCancel/.test(read("components/ghc/connection-intent-picker.tsx")), "intent picker cannot be dismissed while busy")
assert(/busy \? undefined : \(\) => setConfirmItem\(null\)/.test(read("components/ghc/ghc-utility-panel.tsx")), "spend confirmation cannot be dismissed while a spend is in flight")

// In-conversation message search: Escape clears, then closes; mobile search key; hint is associated.
const msg = read("components/ghc/message-screen.tsx")
assert(/id="gh-message-search"[\s\S]{0,900}onKeyDown=\{[\s\S]{0,300}Escape/.test(msg), "message search handles Escape")
assert(/aria-describedby="gh-message-search-hint"/.test(msg) && /id="gh-message-search-hint"/.test(msg), "message search hint is associated with the input")

// Every search field requests a search enter key on mobile keyboards.
let missing = 0
for (const file of [...walk("app"), ...walk("components"), ...walk("features")]) {
  const s = read(file)
  for (const m of s.matchAll(/type="search"/g)) {
    const st = s.lastIndexOf("<input", m.index)
    const en = s.indexOf("/>", m.index)
    if (st < 0 || en < 0) continue
    if (!/enterKeyHint/.test(s.slice(st, en))) { missing += 1; console.error(`  no enterKeyHint: ${file}`) }
  }
}
assert(missing === 0, `all search inputs set enterKeyHint (${missing} missing)`)

// RUN469 part 2: the conditional-Escape overlays now share the hook instead of private key handlers.
const hook = read("hooks/use-dialog-a11y.ts")
assert(/data-dialog-dismiss/.test(hook) && /data-dialog-initial-focus/.test(hook), "hook honours dismiss-backdrop and initial-focus markers")
for (const [file, label, needle] of [
  ["components/ghc/media-lightbox.tsx", "media lightbox", /useDialogA11y<HTMLDivElement>\(open && items\.length > 0,/],
  ["components/ghc/post-reward/post-reward-panel.tsx", "post-reward panel", /useDialogA11y<HTMLElement>\(open, \(\) => setOpen\(false\)\)/],
  ["components/ghc/unified-compose.tsx", "unified composer", /useDialogA11y<HTMLDivElement>\(open, uploadProgress \|\| isPublishing \? undefined/],
  ["components/ghc/comment-sheet.tsx", "comment sheet", /useDialogA11y<HTMLDivElement>\(open, onClose\)/],
  ["components/ghc/notification-bell.tsx", "notification bell", /useDialogA11y<HTMLDivElement>\(open,/],
  ["components/ghc/premium-membership-screen.tsx", "membership confirm sheet", /useDialogA11y<HTMLDivElement>\(Boolean\(confirmTier\), busy \? undefined/],
]) {
  const src = read(file)
  assert(needle.test(src), `${label} uses the shared dialog hook`)
  assert(!/e\.key === "Escape"|event\.key === "Escape"/.test(src.replace(/onKeyDown=\{[^\n]*Escape[^\n]*\}/g, "")), `${label} has no private Escape handler`)
}
assert(/useDialogA11y<HTMLDivElement>\(successDialogOpen,/.test(read("components/ghc/premium-membership-screen.tsx")), "membership success sheet uses the shared dialog hook")
assert(/useDialogA11y<HTMLDivElement>\(Boolean\(mediaPreview\)/.test(read("components/ghc/comment-sheet.tsx")), "comment attachment preview stacks above the sheet")
assert(/e\.key === "Escape" && query/.test(read("components/ghc/marketplace-screen.tsx")), "marketplace search clears on Escape")

// Sheets and splash screens size against the dynamic viewport so bottom actions are never hidden
// under mobile browser chrome; legacy `vh` and `h-screen` are not allowed in components.
let legacyVh = 0
for (const file of [...walk("app"), ...walk("components"), ...walk("features")]) {
  const src = read(file)
  for (const m of src.matchAll(/(?<![A-Za-z])\d+(?:\.\d+)?vh\b|\b(?:min-h|max-h|h)-screen\b/g)) { legacyVh += 1; console.error(`  legacy viewport unit in ${file}: ${m[0]}`) }
}
assert(legacyVh === 0, `no legacy vh/h-screen sizing in components (${legacyVh} found)`)

if (failures) { console.error(`RUN469 check failed: ${failures} assertion(s)`); process.exit(1) }
console.log("RUN469 overlay hook and search input contract passed")
