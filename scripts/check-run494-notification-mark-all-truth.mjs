import fs from "node:fs"
const src = fs.readFileSync("components/ghc/notification-bell.tsx", "utf8")
const start = src.indexOf("const markAll = async")
const body = src.slice(start, src.indexOf("return (", start))
const checks = [
  ["mark-all is single-flight", /markAllInFlightRef\.current\) return/.test(body) && /markAllInFlightRef\.current = false/.test(body)],
  ["button is disabled and aria-busy while saving", /disabled=\{markingAll\}/.test(src) && /aria-busy=\{markingAll\}/.test(src)],
  ["no unread:0 broadcast before the server answers", !/notifications-changed", \{ detail: \{ unread: 0 \}/.test(body)],
  ["notifications-read (clears app badge) fires only after success", /if \(!failed\) \{\s*\/\/[^\n]*\n[^\n]*\n\s*window\.dispatchEvent\(new CustomEvent\("ghc:notifications-read"\)\)/.test(body) && (body.match(/ghc:notifications-read/g) || []).length === 1],
  ["failure re-polls the badge and shows an error toast", /mark-all-failed/.test(body) && /markAllReadFailed"\), type: "error"/.test(body)],
  ["state is always reconciled and unlocked", /refresh\(\)\s*\n\s*\} finally \{/.test(body)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN494 notification mark-all truth: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
