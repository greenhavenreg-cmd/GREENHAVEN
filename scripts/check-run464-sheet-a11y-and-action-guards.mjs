import { readFileSync } from "node:fs"

const read = (p) => readFileSync(p, "utf8")
let failures = 0
const assert = (ok, msg) => {
  if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) }
}

// Sheets/dialogs that carry money, payment, sharing or reporting actions must use the shared
// dialog hook (Escape, focus trap + restore, scroll lock) and attach its ref to the dialog element.
const sheets = [
  "pi-withdraw-sheet", "send-ghc-flow", "receive-ghc-flow", "request-ghc-flow", "share-sheet",
  "create-hub-sheet", "confirmation-dialog", "pi-payment-detail", "ghc-transaction-detail",
  "create-group-modal", "report-chooser",
]
for (const name of sheets) {
  const src = read(`components/ghc/${name}.tsx`)
  assert(src.includes('from "@/hooks/use-dialog-a11y"'), `${name} imports useDialogA11y`)
  assert(/useDialogA11y<HTMLDivElement>\(/.test(src), `${name} calls useDialogA11y`)
  assert(/ref=\{dialogRef\}\s+tabIndex=\{-1\}\s+role="dialog"/.test(src), `${name} attaches dialogRef to the role=dialog element`)
  assert(/aria-modal="true"/.test(src), `${name} keeps aria-modal`)
}

// Hooks must run before the closed-state early return.
for (const [name, guard] of [
  ["pi-withdraw-sheet", "if (!open) return null"],
  ["confirmation-dialog", "if (!isOpen) return null"],
  ["ghc-transaction-detail", "if (!open || !tx) return null"],
]) {
  const src = read(`components/ghc/${name}.tsx`)
  assert(src.indexOf("useDialogA11y<") > -1 && src.indexOf("useDialogA11y<") < src.indexOf(guard), `${name} calls the hook before its early return`)
}

// Request actions (pay / cancel) and reserved-earnings release need synchronous re-entry guards.
const requests = read("components/ghc/ghc-requests-panel.tsx")
assert(/const actionInFlightRef = useRef\(false\)/.test(requests), "requests panel declares actionInFlightRef")
assert((requests.match(/if \(actionInFlightRef\.current\) return/g) || []).length === 2, "pay and cancel both check actionInFlightRef")
assert((requests.match(/actionInFlightRef\.current = false/g) || []).length === 2, "pay and cancel both release actionInFlightRef in finally")
const earnings = read("components/ghc/unified-earnings-dashboard.tsx")
assert(/if \(releaseInFlightRef\.current\) return/.test(earnings) && /releaseInFlightRef\.current = false/.test(earnings), "reserved-earnings release is re-entry guarded")

// Admin/field buttons without explicit type.
for (const f of ["app/admin/a2u-qualification/page.tsx", "app/admin/treasury/page.tsx", "components/field/research-studio-client.tsx"]) {
  const src = read(f)
  const bad = [...src.matchAll(/<button\b(?![^>]*\btype=)(?![^>]*onClick)[^>]*>/g)].length
  const clickBad = [...src.matchAll(/<button\b(?![^>]*\btype=)[^>]*onClick[^>]*>/g)].length
  assert(clickBad === 0, `${f} has no untyped onClick buttons`)
  void bad
}

if (failures) { console.error(`RUN464 check failed: ${failures} assertion(s)`); process.exit(1) }
console.log("RUN464 sheet accessibility and action guard contract passed")
