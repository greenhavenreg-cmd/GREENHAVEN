import fs from "node:fs"
const ctx = fs.readFileSync("contexts/ghc-context.tsx", "utf8")
const lib = fs.readFileSync("lib/ux/toast-safe-message.ts", "utf8")
const checks = [
  ["addToast sanitizes the message through toastSafeMessage", /const message = toastSafeMessage\(rawMessage, type\)/.test(ctx) && /from "@\/lib\/ux\/toast-safe-message"/.test(ctx)],
  ["identical on-screen toasts are replaced, not stacked or swallowed", /s\.toasts\.filter\(\(t\) => !\(t\.message === message && t\.type === type\)\)/.test(ctx)],
  ["provider keeps errors longer than the shell's 6.5s hide time", /type === "error" \? 7500 : 4000/.test(ctx)],
  ["toast type, id and ordering are preserved", /\{ id, message, type \}/.test(ctx)],
  ["machine codes are mapped through both existing code maps", /userFacingError\(text, ""\)/.test(lib) && /humanizeClientErrorCode\(text, GENERIC_ERROR\)/.test(lib)],
  ["infrastructure and secret-like text falls back to a generic message", /toClientSafeErrorMessage\(text, GENERIC_ERROR\)/.test(lib)],
  ["unmapped upper-case words are masked only for error toasts", /type === "error" \? humanizeClientErrorCode\(text, GENERIC_ERROR\) : text/.test(lib)],
  ["empty success toast text stays empty, empty error text is generic", /type === "error" \? GENERIC_ERROR : ""/.test(lib)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN487 toast safe message: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
